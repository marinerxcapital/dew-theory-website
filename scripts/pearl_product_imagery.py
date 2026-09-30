#!/usr/bin/env python3
"""
PEARL EDITORIAL product imagery treatment.

WHY THIS EXISTS
---------------
The assets in `public/images/products/skin-script/` are photographs of *real*
Skin Script packaging. A prior CLINICAL NOIR pass keyed them onto a #050505
void with a hot-pink rim. The approved mockups are a pearl/ivory editorial
system, where packaging has to read on a light ground. Regenerating the product
would show customers packaging the product does not ship in, so this script
keeps the photograph and changes only the *ground*:

  sage / void plate  ->  transparent ground
  generic shadow     ->  a soft warm contact shadow beneath the subject

The treatment is deterministic and identical for every asset, so the catalog
reads as one campaign shoot. Product pixels are never repainted: hue and
packaging artwork are preserved exactly; only the background is removed, the
edge is decontaminated off the old plate, and a contact shadow is synthesised.

Output is RGBA WebP, so the same asset works on the ivory page ground, on a
white card, or inside a dark band without carrying a plate colour with it.

Usage:
    python scripts/pearl_product_imagery.py                # all assets, in place
    python scripts/pearl_product_imagery.py --dry-run       # report only
    python scripts/pearl_product_imagery.py --only slug     # one directory
    python scripts/pearl_product_imagery.py --json report.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "images" / "products" / "skin-script"

# Warm near-black used for the synthesised contact shadow (not pure black, so it
# reads as light being blocked rather than as a hole).
SHADOW_RGB = np.array([28.0, 24.0, 20.0], dtype=np.float32)

# Background key thresholds. The key is the *stronger* of two independent
# signals, because either one alone fails on a real catalog:
#
#   luminance distance - separates a package from a backdrop of very different
#     brightness, but cannot see a white bottle on a light plate.
#   chroma distance - the studio plates are chromatic (sage green, or iridescent
#     lavender/blush), while Skin Script packaging is neutral white, silver and
#     black. This rescues low-contrast subjects the luminance key loses, and
#     leaves tinted plate shadow behind as background.
KEY_LO = 10.0
KEY_HI = 34.0
CHROMA_GAIN = 2.2

# Alpha below this is backdrop noise rather than product.
ALPHA_FLOOR = 0.14

# Keep every coherent object, not just the biggest one: kits and group shots
# have four or five separate subjects and dropping all but the largest erases
# most of the frame. Anything smaller than this is backdrop fleck.
MIN_COMPONENT_FRACTION = 0.0015

# If the key cannot find a plausible amount of product, or the silhouette does
# not survive a stricter threshold (a white product on a white plate, or a
# spec-sheet panel that has no product silhouette at all), the script must not
# write. Shipping a cut-out rectangle over a real product photo is worse than
# shipping the plate that has not been through this pipeline.
MIN_COVERAGE = 0.04
MAX_COVERAGE = 0.6

# How much of its own bounding box the silhouette fills. A bottle or tube fills
# most of its box; a mask assembled from scattered specks fills almost none.
# This is what separates a real subject from a key that fragmented into confetti.
MIN_BBOX_FILL = 0.3

# Contact shadow shape.
SHADOW_OFFSET = 0.012  # fraction of image height
SHADOW_BLUR = 14.0
SHADOW_STRENGTH = 0.26
SHADOW_SPREAD = 6


def backdrop_colour(rgb: np.ndarray, ring: int = 6) -> np.ndarray:
    """Median colour of the outer ring - the studio backdrop."""
    parts = [
        rgb[:ring, :, :].reshape(-1, 3),
        rgb[-ring:, :, :].reshape(-1, 3),
        rgb[:, :ring, :].reshape(-1, 3),
        rgb[:, -ring:, :].reshape(-1, 3),
    ]
    return np.median(np.concatenate(parts, axis=0), axis=0).astype(np.float32)


def saturation(rgb: np.ndarray) -> np.ndarray:
    """HSV-style saturation without the colour-space round trip."""
    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    return np.where(mx > 1.0, (mx - mn) / np.maximum(mx, 1.0), 0.0)


def key_strength(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """Distance from the backdrop, in whichever channel disagrees most."""
    luminance = np.max(np.abs(rgb - bg[None, None, :]), axis=2)
    bg_sat = float(saturation(bg[None, None, :])[0, 0])
    chroma = np.abs(saturation(rgb) - bg_sat) * 255.0 * CHROMA_GAIN
    return np.maximum(luminance, chroma)


def silhouette(rgb: np.ndarray, bg: np.ndarray):
    """Soft alpha matte for the product, with interior holes filled.

    Returns the matte plus the hard solid mask. The solid mask also rejects
    backdrop sensor noise, which would otherwise survive as isolated speckles.
    """
    alpha = np.clip((key_strength(rgb, bg) - KEY_LO) / (KEY_HI - KEY_LO), 0.0, 1.0)
    alpha = np.clip((alpha - ALPHA_FLOOR) / (1.0 - ALPHA_FLOOR), 0.0, 1.0)

    # Anything the backdrop colour cannot reach from the border is product.
    solid = alpha > 0.55
    solid = ndimage.binary_opening(solid, structure=np.ones((3, 3)))
    filled = ndimage.binary_fill_holes(solid)

    labels, count = ndimage.label(filled)
    if count > 1:
        sizes = ndimage.sum(filled, labels, range(1, count + 1))
        floor = filled.size * MIN_COMPONENT_FRACTION
        keep = tuple(i + 1 for i, size in enumerate(sizes) if size >= floor)
        filled = np.isin(labels, keep) if keep else np.zeros_like(filled)

    # Nothing outside the (slightly dilated) product region may carry alpha.
    allowed = ndimage.binary_dilation(filled, iterations=2)
    alpha = np.where(allowed, alpha, 0.0)

    return np.maximum(alpha, filled.astype(np.float32)), filled


def decontaminate(rgb: np.ndarray, bg: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Un-premultiply partial edge pixels off the old backdrop.

    A half-transparent edge pixel is a blend of product and sage; leaving it
    alone produces a green fringe. Solving for the product term removes the cast
    without touching the fully opaque interior. The amplification is capped
    because dividing by a near-zero alpha multiplies sensor noise into confetti.
    """
    a = np.clip(alpha, 0.5, 1.0)[:, :, None]
    return np.clip((rgb - (1.0 - a) * bg[None, None, :]) / a, 0.0, 255.0)


def despill(product: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Kill residual plate chroma left on partial edge pixels.

    Un-premultiplying recovers most of the product edge, but the plate here is
    strongly chromatic (sage green), so the last few percent of blend survives
    as a green fringe around a neutral white bottle. Edge pixels are pulled
    toward their own luminance in proportion to how transparent they are, which
    removes the cast without touching the opaque interior or changing its hue.
    """
    a = np.clip(alpha, 0.0, 1.0)[:, :, None]
    luminance = product.mean(axis=2, keepdims=True)
    weight = np.clip(1.0 - a, 0.0, 1.0) * 0.9
    return product * (1.0 - weight) + luminance * weight


def chroma_vector(rgb: np.ndarray) -> np.ndarray:
    """Per-pixel chroma direction (mean-subtracted, unit length)."""
    centred = rgb - rgb.mean(axis=2, keepdims=True)
    norm = np.linalg.norm(centred, axis=2, keepdims=True)
    return centred / np.maximum(norm, 1e-6)


def reject_plate_shadow(rgb: np.ndarray, bg: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Zero alpha wherever the pixel is the plate's own cast shadow.

    The luminance term of the key is *supposed* to fire on anything darker than
    the plate, which is exactly what a real product shadow is — so the original
    studio shadow (a darker version of the same chromatic plate) survives the
    key as a semi-transparent smudge beside the product. On a pearl ground that
    reads as a grey-green bruise.

    A cast shadow keeps the plate's *hue* and most of its saturation; the
    packaging is neutral (white / silver / black) or a different hue. So a pixel
    is rejected as plate shadow when its chroma points the same way as the
    plate's, retains most of the plate's saturation, and is darker than it.
    """
    sat_pixel = saturation(rgb)
    sat_bg = float(saturation(bg[None, None, :])[0, 0])
    if sat_bg < 0.04:
        return alpha

    cos = np.einsum('hwc,c->hw', chroma_vector(rgb), chroma_vector(bg[None, None, :])[0, 0])
    retains = sat_pixel >= sat_bg * 0.55
    darker = rgb.mean(axis=2) <= float(bg.mean()) + 2.0
    plate_shadow = (cos > 0.9) & retains & darker

    return np.where(plate_shadow, 0.0, alpha)


def offset_down(mask: np.ndarray, rows: int) -> np.ndarray:
    """Shift a boolean mask downward by `rows`, filling the gap from above."""
    if rows <= 0:
        return mask
    out = np.zeros_like(mask)
    out[rows:] = mask[:-rows]
    out[:rows] = mask[:rows]
    return out


def contact_shadow(solid: np.ndarray) -> np.ndarray:
    """Soft warm shadow pooled beneath the subject."""
    h = solid.shape[0]
    spread = ndimage.binary_dilation(solid, iterations=SHADOW_SPREAD)
    shifted = offset_down(spread, max(1, int(round(h * SHADOW_OFFSET))))
    blurred = ndimage.gaussian_filter(shifted.astype(np.float32), sigma=SHADOW_BLUR)
    if blurred.max() > 0:
        blurred = blurred / blurred.max()
    return np.clip(blurred * SHADOW_STRENGTH, 0.0, 1.0)


def treat(path: Path, dry_run: bool = False) -> dict:
    with Image.open(path) as im:
        mode = im.mode
        size = im.size
        rgb = np.asarray(im.convert("RGB"), dtype=np.float32)

    bg = backdrop_colour(rgb)
    alpha, solid = silhouette(rgb, bg)
    alpha = reject_plate_shadow(rgb, bg, alpha)

    h, w = alpha.shape
    opaque = int((alpha > 0.5).sum())
    coverage = opaque / float(w * h)

    if solid.any():
        rows = np.nonzero(solid.any(axis=1))[0]
        cols = np.nonzero(solid.any(axis=0))[0]
        box = float((rows[-1] - rows[0] + 1) * (cols[-1] - cols[0] + 1))
        bbox_fill = float(solid.sum()) / max(box, 1.0)
    else:
        bbox_fill = 0.0

    base = {
        "file": str(path.relative_to(ROOT)).replace("\\", "/"),
        "size": f"{size[0]}x{size[1]}",
        "mode": mode,
        "backdrop": [round(float(c), 1) for c in bg],
        "product_px": opaque,
        "coverage": round(coverage, 4),
        "bbox_fill": round(bbox_fill, 3),
    }

    if dry_run:
        return {**base, "status": "inspected"}

    # Safety gate - leave the original exactly as it was and record why.
    if coverage < MIN_COVERAGE:
        return {**base, "status": "skipped", "reason": "no plausible product silhouette"}
    if coverage > MAX_COVERAGE:
        return {**base, "status": "skipped", "reason": "key swallowed the whole frame"}
    if bbox_fill < MIN_BBOX_FILL:
        return {
            **base,
            "status": "skipped",
            "reason": "silhouette fragmented (low bounding-box fill)",
        }

    product = despill(decontaminate(rgb, bg, alpha), alpha)

    # A restrained clarity lift on the product only - no hue or saturation
    # change, so packaging colour stays exactly as photographed.
    product = np.clip(128.0 + (product - 128.0) * 1.04, 0.0, 255.0)

    shadow_a = contact_shadow(solid)
    a3 = alpha[:, :, None]
    s3 = shadow_a[:, :, None]

    # Composite: shadow first, product over it. Both are straight
    # (non-premultiplied) colour with their own alpha.
    out_alpha = np.clip(alpha + shadow_a * (1.0 - alpha), 0.0, 1.0)
    denom = np.maximum(out_alpha, 1e-4)[:, :, None]
    out_rgb = (
        product * a3 + SHADOW_RGB[None, None, :] * (s3 * (1.0 - a3))
    ) / denom

    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(out_rgb, 0.0, 255.0).astype(np.uint8)
    rgba[:, :, 3] = np.clip(out_alpha * 255.0, 0.0, 255.0).astype(np.uint8)

    # Normalise alpha before encoding.
    #
    # Snap sub-threshold noise to fully transparent and force the outer 1px ring
    # transparent. A near-opaque speckle sitting on the frame edge makes
    # downstream resizers fail: the Cloudflare Images binding behind
    # next/image returns 500 "error code: 1101" for that asset at very small
    # widths, which showed up as one broken product thumbnail in production.
    alpha_channel = rgba[:, :, 3]
    alpha_channel[alpha_channel < 6] = 0
    alpha_channel[0, :] = 0
    alpha_channel[-1, :] = 0
    alpha_channel[:, 0] = 0
    alpha_channel[:, -1] = 0

    out = Image.fromarray(rgba, mode="RGBA")
    if path.suffix.lower() == ".webp":
        out.save(path, "WEBP", quality=92, method=4, lossless=False)
    else:
        out.save(path, "PNG", optimize=True)

    return {**base, "status": "treated"}


def assets(only: str | None) -> list[Path]:
    if not ASSET_DIR.is_dir():
        raise SystemExit(f"asset directory not found: {ASSET_DIR}")
    out: list[Path] = []
    for path in sorted(ASSET_DIR.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".webp", ".png"}:
            continue
        if only and only not in path.parts:
            continue
        out.append(path)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--only", help="limit to a single product directory")
    parser.add_argument("--json", help="write a report to this path")
    args = parser.parse_args()

    targets = assets(args.only)
    if not targets:
        raise SystemExit("no assets matched")

    report = []
    for i, path in enumerate(targets, 1):
        entry = treat(path, dry_run=args.dry_run)
        report.append(entry)
        status = entry.get("status", "")
        note = f"  <- {entry['reason']}" if entry.get("reason") else ""
        print(f"[{i:>3}/{len(targets)}] {status:<9} {entry['file']}{note}", flush=True)

    skipped = [e for e in report if e.get("status") == "skipped"]
    if skipped:
        print(f"\n{len(skipped)} asset(s) left untouched by the safety gate:")
        for e in skipped:
            print(f"  - {e['file']} ({e['reason']})")

    if args.json:
        Path(args.json).write_text(json.dumps(report, indent=2), encoding="utf-8")

    treated = [e for e in report if e.get("status") == "treated"]
    print(
        f"\n{len(targets)} asset(s) {'inspected' if args.dry_run else 'processed'}"
        f" ({len(treated)} treated, {len(skipped)} skipped)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
