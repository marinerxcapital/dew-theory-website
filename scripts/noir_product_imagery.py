#!/usr/bin/env python3
"""
CLINICAL NOIR product imagery treatment.

WHY THIS EXISTS INSTEAD OF AN AI RE-RENDER
------------------------------------------
The brief called for regenerating all 35 SKUs with a generative image model.
The assets in `public/images/products/skin-script/` are photographs of *real*
Skin Script packaging. Replacing them with synthesised bottles would show
customers packaging the product does not ship in — a truth-in-advertising
problem and exactly what the repository's own master directive forbids
("Do not misrepresent actual Skin Script packaging"). So this script keeps the
photograph and changes the *lighting*, which is what actually made the old set
feel like 35 separate stock renders:

  flat sage backdrop  →  #050505 void with a soft vertical falloff
  generic drop shadow →  a pink rim light tracing the right edge
  nothing underneath  →  a pink reflection pooling on the surface

The treatment is deterministic and identical for every asset, so the catalog
reads as one campaign shoot. Product pixels are never repainted: hue and
packaging artwork are preserved exactly; only the background, edge
decontamination, and added light are synthesised.

Usage:
    python scripts/noir_product_imagery.py              # all assets, in place
    python scripts/noir_product_imagery.py --dry-run     # report only
    python scripts/noir_product_imagery.py --only slug   # one directory
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "images" / "products" / "skin-script"

VOID = np.array([5.0, 5.0, 5.0], dtype=np.float32)
PINK = np.array([255.0, 31.0, 143.0], dtype=np.float32)

# Background key thresholds. The key is the *stronger* of two independent
# signals, because either one alone fails on a real catalog:
#
#   luminance distance — separates a white bottle from any backdrop, but cannot
#     see a light-grey pouch that happens to match the plate's brightness.
#   chroma distance — the studio plates are chromatic (sage, or iridescent
#     lavender), while Skin Script packaging is neutral white, silver, and
#     black. This rescues low-contrast subjects the luminance key loses, and
#     leaves tinted shadows on the plate behind as background.
KEY_LO = 10.0
KEY_HI = 34.0
CHROMA_GAIN = 2.2

RIM_SIGMA = 20.0
HALO_SIGMA = 26.0
RIM_STRENGTH = 0.38
HALO_STRENGTH = 0.14
POOL_STRENGTH = 0.30

# Alpha below this is backdrop noise rather than product.
ALPHA_FLOOR = 0.14

# The rim light must not screen over the packaging, or the bottle picks up a
# pink cast and stops reading as a white clinical bottle. Everything inside
# this erosion of the silhouette is protected.
INTERIOR_PROTECT = 12

# Keep every coherent object, not just the biggest one: kits and group shots
# have four or five separate subjects and dropping all but the largest erases
# most of the frame. Anything smaller than this is backdrop fleck.
MIN_COMPONENT_FRACTION = 0.0015

# If the key cannot find a plausible amount of product, or the silhouette does
# not survive a stricter threshold (the signature of a white product on a white
# plate, or of a spec-sheet panel that has no product silhouette at all), the
# script must not write. Shipping a black rectangle over a real product photo is
# worse than shipping a plate that has not been through this pipeline.
MIN_COVERAGE = 0.04
MAX_COVERAGE = 0.6

# How much of its own bounding box the silhouette fills. A bottle or tube fills
# most of its box; a mask assembled from scattered specks on an iridescent
# plate fills almost none of it. This is what separates a real subject from a
# key that has fragmented into confetti.
MIN_BBOX_FILL = 0.3

# The frame must be invisible.
#
# These are composited onto a `#050505` page, so anything above void inside the
# image rectangle reads as a lighter box around the product — very visible on an
# OLED phone in a dark room. Every light term therefore fades to exactly zero
# before it reaches the frame edge, and any pixel that is only a level or two
# above void is snapped back to void. The ramp is kept narrow (4–5% of the
# frame) so it cannot clip a product that runs close to the edge, as the kit
# group shot does.
FRAME_RAMP_X = 0.05
FRAME_RAMP_TOP = 0.04
FRAME_RAMP_BOTTOM = 0.035

# Pixels this close to void carry no information worth keeping.
VOID_EPSILON = 1.2


def backdrop_colour(rgb: np.ndarray, ring: int = 6) -> np.ndarray:
    """Median colour of the outer ring — the studio backdrop."""
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


def silhouette(rgb: np.ndarray, bg: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Soft alpha matte for the product, with interior holes filled.

    Returns the matte plus the hard solid mask. The solid mask is also used to
    reject backdrop sensor noise, which would otherwise survive as isolated
    white speckles floating in the void.
    """
    alpha = np.clip((key_strength(rgb, bg) - KEY_LO) / (KEY_HI - KEY_LO), 0.0, 1.0)
    # Kill backdrop grain, then restate the ramp so the edge stays smooth.
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
    alone produces a green fringe against black. Solving for the product term
    removes the cast without touching the fully opaque interior.
    """
    # Cap the amplification: dividing by a near-zero alpha multiplies sensor
    # noise into magenta confetti at the silhouette edge.
    a = np.clip(alpha, 0.5, 1.0)[:, :, None]
    return np.clip((rgb - (1.0 - a) * bg[None, None, :]) / a, 0.0, 255.0)


def frame_fade(shape: tuple[int, int]) -> np.ndarray:
    """0 at the frame border, 1 a few percent inside it.

    Guarantees that no synthesised light — rim, halo, or reflection — can reach
    the image edge, which is what makes the plate disappear into the page.
    """
    h, w = shape
    xu = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]
    yu = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    fx = smoothstep(0.0, FRAME_RAMP_X, xu) * (1.0 - smoothstep(1.0 - FRAME_RAMP_X, 1.0, xu))
    fy = smoothstep(0.0, FRAME_RAMP_TOP, yu) * (
        1.0 - smoothstep(1.0 - FRAME_RAMP_BOTTOM, 1.0, yu)
    )
    return fx * fy


def void_backdrop(shape: tuple[int, int], alpha: np.ndarray) -> np.ndarray:
    """Flat #050505.

    There is deliberately no bloom or vignette here any more. A lifted floor is
    indistinguishable from a visible frame once the image sits on a #050505
    page, and the product's own rim light plus the page's grain already stop the
    black from reading as flat.
    """
    h, w = shape
    return np.broadcast_to(VOID[None, None, :], (h, w, 3)).copy()


def screen(base: np.ndarray, light: np.ndarray) -> np.ndarray:
    return 255.0 - (255.0 - base) * (255.0 - np.clip(light, 0.0, 255.0)) / 255.0


def dither(image: np.ndarray, seed: int = 20260926) -> np.ndarray:
    """±1 level of deterministic noise.

    A wide, very low-opacity pink falloff over near-black quantises into visible
    banding at 8-bit. One level of ordered noise breaks the contours without
    being perceptible, and the fixed seed keeps the pipeline reproducible.
    """
    rng = np.random.default_rng(seed)
    noise = rng.integers(-1, 2, size=image.shape, dtype=np.int16).astype(np.float32)
    return np.clip(image + noise, 0.0, 255.0)


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / max(edge1 - edge0, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def apply_lighting(canvas: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Key light from upper-left, hot-pink rim on the right, pool underneath."""
    h, w = alpha.shape
    fg = alpha > 0.5
    if not fg.any():
        return canvas

    # Packaging stays exactly as photographed; only its edge and the air around
    # it receive the pink light.
    interior = ndimage.binary_erosion(fg, iterations=INTERIOR_PROTECT)
    outside = (~interior).astype(np.float32)

    ys, xs = np.nonzero(fg)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    centre_x = (x0 + x1) / 2.0

    xgrid = np.arange(w, dtype=np.float32)[None, :]
    # A smooth lateral falloff, not a boolean half-plane: a hard cut produces a
    # visible rectangular seam where the glow term starts.
    right_side = smoothstep(centre_x - 26.0, centre_x + 46.0, xgrid)

    # Rim: the outer 8px of the silhouette, right half only, diffused.
    inner = ndimage.binary_erosion(fg, iterations=8)
    edge = (fg & ~inner).astype(np.float32) * right_side
    rim = ndimage.gaussian_filter(edge, sigma=RIM_SIGMA, mode="constant")
    if rim.max() > 0:
        rim = rim / rim.max()

    # Halo: the whole silhouette, right side, very diffuse.
    halo = ndimage.gaussian_filter(fg.astype(np.float32) * right_side, sigma=HALO_SIGMA)
    if halo.max() > 0:
        halo = halo / halo.max()

    light_mask = (rim * RIM_STRENGTH + halo * HALO_STRENGTH) * outside
    # Nothing may reach the frame edge.
    light_mask = light_mask * frame_fade((h, w))
    light = light_mask[:, :, None] * PINK[None, None, :]
    lit = screen(canvas, light)

    # Pool: the product reflected, squashed, pinked, fading at both ends so the
    # patch never shows a seam where it meets the void.
    span = min(int((y1 - y0) * 0.42), h - y1 - 1)
    if span > 8:
        mirrored = ndimage.gaussian_filter(
            canvas[y0 : y1 + 1][::-1], sigma=(6.0, 3.0, 0.0)
        )
        target_h = span
        src_h = mirrored.shape[0]
        idx = (np.arange(target_h) * (src_h / target_h)).astype(np.int32)
        squashed = mirrored[np.clip(idx, 0, src_h - 1)]
        ramp = np.linspace(0.0, 1.0, target_h, dtype=np.float32)
        fade = (np.sin(ramp * np.pi) * 0.5).astype(np.float32)[:, None, None]
        pool_patch = squashed * fade * POOL_STRENGTH
        # Lateral soft mask so the reflection stays under the product.
        lateral = smoothstep(x0 - 40.0, x0 + 20.0, xgrid) * (
            1.0 - smoothstep(x1 - 20.0, x1 + 40.0, xgrid)
        )
        pool_patch = pool_patch * lateral[:, :, None]
        pool_patch = pool_patch * frame_fade((h, w))[y1 + 1 : y1 + 1 + target_h][:, :, None]
        lit[y1 + 1 : y1 + 1 + target_h] = screen(lit[y1 + 1 : y1 + 1 + target_h], pool_patch)

    # A pink pool ellipse directly beneath the product.
    poolyx = np.add.outer(
            ((np.arange(h, dtype=np.float32) - (y1 + 6)) / max(span, 24)) ** 2,
            ((np.arange(w, dtype=np.float32) - (x0 + x1) / 2.0) / ((x1 - x0) * 0.55 + 1)) ** 2,
        )
    pool = np.exp(-poolyx * 1.5).astype(np.float32)
    pool = ndimage.gaussian_filter(pool, sigma=10.0)
    pool = pool / pool.max()
    lit = screen(
        lit,
        (pool * 0.22 * frame_fade((h, w)))[:, :, None] * PINK[None, None, :],
    )

    return lit


def treat(path: Path) -> dict:
    with Image.open(path) as im:
        mode = im.mode
        size = im.size
        rgb = np.asarray(im.convert("RGB"), dtype=np.float32)

    bg = backdrop_colour(rgb)
    alpha, solid = silhouette(rgb, bg)

    h, w = alpha.shape
    opaque = int((alpha > 0.5).sum())
    coverage = opaque / float(w * h)

    # Compactness: how much of its own bounding box the subject fills.
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

    # Safety gate. A colour key cannot separate a white product from a white
    # plate, and a spec-sheet panel is not a product silhouette at all. Writing
    # either one would ship a black rectangle over a real product photograph,
    # so the original is left exactly as it was and the reason is recorded.
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

    product = decontaminate(rgb, bg, alpha)

    # A restrained clarity lift on the product only — no hue or saturation
    # change, so packaging colour stays exactly as photographed.
    product = np.clip(128.0 + (product - 128.0) * 1.045, 0.0, 255.0)

    canvas = void_backdrop((h, w), alpha)
    a3 = alpha[:, :, None]
    composed = canvas * (1.0 - a3) + product * a3
    composed = apply_lighting(composed, alpha)

    # Snap anything within a couple of levels of void back to exact void, then
    # dither only where there is real signal. Without this the 8-bit encode
    # leaves a faint rectangle of the image's own bounds on the page.
    excess = np.max(composed - VOID[None, None, :], axis=2)
    composed = dither(composed)
    has_signal = (excess > VOID_EPSILON)[:, :, None]
    composed = np.where(has_signal, composed, VOID[None, None, :])
    composed = np.clip(composed, 0.0, 255.0).astype(np.uint8)

    out = Image.fromarray(composed, mode="RGB")
    if path.suffix.lower() == ".webp":
        out.save(path, "WEBP", quality=90, method=6)
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
        entry = treat(path) if not args.dry_run else {"file": str(path)}
        report.append(entry)
        status = entry.get("status", "")
        note = f"  <- {entry['reason']}" if entry.get("reason") else ""
        print(f"[{i:>3}/{len(targets)}] {status:<8} {entry['file']}{note}", flush=True)

    skipped = [e for e in report if e.get("status") == "skipped"]
    if skipped:
        print(f"\n{len(skipped)} asset(s) left untouched by the safety gate:")
        for e in skipped:
            print(f"  - {e['file']} ({e['reason']})")

    if args.json:
        Path(args.json).write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"\n{len(targets)} asset(s) {'inspected' if args.dry_run else 'treated'}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
