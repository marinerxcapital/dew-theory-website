# Baseline style inventory
Source: canonical local serving snapshot before revamp.
All matching declarations and interaction classes are recorded below. Product plates require pixel sampling; current WebPs include transparent ground.

## app\globals.css
```
9: --color-forest: #1E2B22;
10: --color-sage-deep: #5B7356;
11: --color-sage: #93A890;
12: --color-ivory: #EDEDE6;
13: --color-stone: #C9C4B8;
15: --color-black: #1E2B22;
16: --color-ink: #1E2B22;
17: --color-pearl: #EDEDE6;
18: --color-chrome: #5A655C;
19: --color-graphite: #1E2B22;
20: --color-ice: #E4E8E0;
21: --color-lavender: #D8E0D4;
22: --color-blush: #E5E2D9;
23: --color-charcoal: #1E2B22;
24: --color-muted: #5A655C;
25: --color-surface: #FFFFFF;
26: --color-surface-light: #E5E2D9;
27: --color-specular: #EDEDE6;
28: --color-border: #D4CFC6;
29: --color-border-strong: #B8B2A6;
31: --color-promo: #8B3A3A;
32: --color-promo-dark: #6E2E2E;
34: --color-dew: #5B7356;
35: --color-dew-dark: #1E2B22;
36: --color-dew-mid: #93A890;
37: --color-dew-soft: #E4E8E0;
38: --color-dew-surface: #D8E0D4;
40: --color-aqua: #8FB9B8;
41: --color-aqua-deep: #4F8583;
42: --color-lilac: #B9A9D6;
43: --color-lilac-deep: #7A6AA6;
44: --color-blush: #D8AFA8;
45: --color-blush-deep: #A8756D;
46: --color-champagne: #D6C49A;
47: --color-champagne-deep: #A38F5F;
48: --color-peach: #E2B69A;
49: --color-peach-deep: #B47F5E;
50: --color-botanical: #8FAE96;
51: --color-botanical-deep: #55755D;
63: background: var(--color-ivory, #EDEDE6);
64: color: var(--color-forest, #1E2B22);
80: /* Mobile: keep interactive targets tappable; reduce paint on long lists */
105: mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 1.5rem), transparent 100%);
151: animation-duration: 0.001ms !important;
152: animation-iteration-count: 1 !important;
153: transition-duration: 0.001ms !important;
159: opacity: 1 !important;
163: .chrome-text { transition: none !important; }
164: .chrome-text.is-lit { background-position: 50% 50%; }
167: .ambient-orb { animation: none !important; }
169: /* AIDesigner Noise Shimmer: keep static gradient fallback only */
173: .scroll-cue { animation: none !important; opacity: 0.55 !important; transform: none !important; }
176: a:hover .media-zoom img,
177: article:hover .media-zoom img {
182: /* ---- Keyboard focus (sitewide) ----
183: Mouse clicks use :focus without :focus-visible → no ring.
184: Keyboard tab uses :focus-visible → graphite + ice double ring. */
185: :focus {
188: :focus-visible {
191: border-radius: 2px;
192: box-shadow: 0 0 0 4px rgba(91, 115, 86, 0.35);
195: .bg-graphite:focus-visible,
196: .bg-ink:focus-visible,
197: .bg-black:focus-visible,
198: .bg-forest:focus-visible,
199: .btn-primary:focus-visible,
200: button.bg-graphite:focus-visible,
201: a.bg-graphite:focus-visible {
203: box-shadow: 0 0 0 4px rgba(147, 168, 144, 0.55);
205: /* Custom radio/checkbox chips: ring the visible label when input is focused */
206: label:has(input:focus-visible) {
209: box-shadow: 0 0 0 4px rgba(91, 115, 86, 0.35);
216: z-index: 100;
218: background: var(--color-pearl);
220: border: 1px solid rgba(45, 47, 58, 0.35);
227: /* Visually hidden until focused */
235: .skip-link:focus,
236: .skip-link:focus-visible {
245: box-shadow: 0 0 0 5px rgba(196, 218, 233, 0.55);
247: /* Main landmark can receive skip-link focus without scroll outline flash */
248: #main:focus {
251: #main:focus-visible {
253: box-shadow: none;
258: background: rgba(147, 168, 144, 0.45);
264: background-image: linear-gradient(
266: #6E7A85 0%, #828F9A 10%, #C4DAE9 22%, var(--color-specular) 32%,
267: #CECDE1 42%, #8B98A3 52%, #DEC2CF 64%, var(--color-specular) 74%,
268: #A8B4BE 86%, #6E7A85 100%
270: background-size: 260% 100%;
271: background-position: 12% 50%;
272: -webkit-background-clip: text;
273: background-clip: text;
275: transition: background-position 1.6s cubic-bezier(0.22, 1, 0.36, 1);
276: filter: drop-shadow(0 1px 0 rgba(247, 249, 250, 0.35));
278: .chrome-text.is-lit { background-position: 88% 50%; }
285: background: transparent;
290: drop-shadow(0 0 0.16rem rgba(250, 246, 229, 0.34))
291: drop-shadow(0 0.18rem 0.34rem rgba(20, 20, 18, 0.16));
300: z-index: 0;
301: opacity: 0;
307: background:
308: radial-gradient(52% 58% at 48% 45%, rgba(250, 247, 230, 0.58), transparent 64%),
309: radial-gradient(36% 42% at 68% 32%, rgba(198, 211, 216, 0.24), transparent 68%),
310: radial-gradient(42% 38% at 28% 70%, rgba(201, 183, 154, 0.28), transparent 70%);
311: filter: blur(0.32rem);
313: opacity: 0.34;
317: z-index: 2;
318: background: linear-gradient(
322: rgba(250, 248, 236, 0.68) 47%,
323: rgba(198, 211, 216, 0.22) 52%,
327: background-size: 240% 100%;
329: opacity: 0.22;
331: .brand-wordmark:hover img {
333: drop-shadow(0 0 0.2rem rgba(250, 246, 229, 0.42))
334: drop-shadow(0 0.24rem 0.42rem rgba(20, 20, 18, 0.18));
336: .brand-wordmark:hover::before {
337: opacity: 0.45;
342: animation: brand-wordmark-breathe 5.8s ease-in-out infinite;
345: animation: brand-wordmark-aura 5.8s ease-in-out infinite;
348: animation: brand-wordmark-shimmer 6.8s cubic-bezier(0.33, 0, 0.2, 1) infinite;
355: drop-shadow(0 0 0.14rem rgba(250, 246, 229, 0.28))
356: drop-shadow(0 0.14rem 0.28rem rgba(20, 20, 18, 0.14));
359: opacity: 0.24;
362: opacity: 0.12;
369: drop-shadow(0 0 0.14rem rgba(250, 246, 229, 0.28))
370: drop-shadow(0 0.16rem 0.3rem rgba(20, 20, 18, 0.14));
374: drop-shadow(0 0 0.24rem rgba(250, 246, 229, 0.46))
375: drop-shadow(0 0 0.28rem rgba(201, 183, 154, 0.20))
376: drop-shadow(0 0.2rem 0.38rem rgba(20, 20, 18, 0.16));
381: opacity: 0.28;
385: opacity: 0.44;
391: background-position: 150% 50%;
392: opacity: 0;
395: opacity: 0.22;
398: background-position: -70% 50%;
399: opacity: 0;
409: z-index: 2;
410: background: radial-gradient(
412: rgba(247,249,250,0.92) 0%,
413: rgba(196,218,233,0.48) 28%,
414: rgba(206,205,225,0.22) 52%,
415: rgba(222,194,207,0.08) 68%,
416: rgba(247,249,250,0) 80%
419: transition: opacity 0.6s ease;
424: background:
425: radial-gradient(48% 42% at 18% 14%, rgba(247,249,250,0.75) 0%, transparent 58%),
426: radial-gradient(60% 55% at 22% 18%, rgba(222,194,207,0.62) 0%, rgba(222,194,207,0) 62%),
427: radial-gradient(55% 60% at 78% 28%, rgba(196,218,233,0.68) 0%, rgba(196,218,233,0) 64%),
428: radial-gradient(70% 60% at 55% 82%, rgba(206,205,225,0.58) 0%, rgba(206,205,225,0) 66%),
429: radial-gradient(40% 35% at 88% 78%, rgba(130,143,154,0.18) 0%, transparent 70%),
430: linear-gradient(165deg, #F4F6F7 0%, #E8EEF3 38%, #F0E8ED 72%, #F4F6F7 100%);
431: background-size: 100% 100%;
434: /* ---- Site background — warm ivory (no video, no fixed media decode) ---- */
438: z-index: 0;
441: background: var(--color-ivory);
446: background: var(--color-ivory);
451: background: linear-gradient(
453: rgba(237, 237, 230, 1) 0%,
454: rgba(201, 196, 184, 0.35) 55%,
455: rgba(147, 168, 144, 0.22) 100%
457: opacity: 0.85;
464: z-index: 0;
467: background: transparent;
470: background: linear-gradient(
472: rgba(196, 218, 233, 0.04) 0%,
478: opacity: 0.18;
489: background: transparent;
493: border-radius: 50%;
494: filter: blur(1px);
502: background: radial-gradient(
504: rgba(196, 218, 233, 0.82) 0%,
505: rgba(196, 218, 233, 0.28) 42%,
514: background: radial-gradient(
516: rgba(206, 205, 225, 0.72) 0%,
517: rgba(206, 205, 225, 0.2) 46%,
526: background: radial-gradient(
528: rgba(222, 194, 207, 0.68) 0%,
529: rgba(222, 194, 207, 0.16) 48%,
538: background: radial-gradient(
540: rgba(247, 249, 250, 0.55) 0%,
541: rgba(130, 143, 154, 0.28) 38%,
548: animation: ambient-breathe-a 28s ease-in-out infinite alternate;
551: animation: ambient-breathe-b 34s ease-in-out infinite alternate;
554: animation: ambient-breathe-c 31s ease-in-out infinite alternate;
557: animation: ambient-breathe-a 40s ease-in-out infinite alternate-reverse;
577: opacity: 0.55;
578: background-image:
579: radial-gradient(rgba(45, 47, 58, 0.04) 0.55px, transparent 0.7px);
580: background-size: 2.75px 2.75px;
582: radial-gradient(ellipse 85% 75% at 50% 38%, #000 15%, transparent 78%),
583: linear-gradient(180deg, #000 0%, #000 70%, transparent 100%);
586: radial-gradient(ellipse 85% 75% at 50% 38%, #000 15%, transparent 78%);
592: background:
593: radial-gradient(ellipse 100% 80% at 50% 100%, rgba(45, 47, 58, 0.06) 0%, transparent 55%),
594: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196, 218, 233, 0.12) 0%, transparent 60%);
595: opacity: 1;
602: background: var(--color-surface);
605: border: 1px solid var(--color-border);
606: box-shadow:
607: 0 1px 0 rgba(255, 255, 255, 0.8) inset,
608: 0 18px 40px -28px rgba(31, 33, 40, 0.16);
609: transition:
610: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
611: border-color 0.35s ease,
621: z-index: 1;
623: a.glass-1:hover,
624: .glass-1.glass-lift:hover {
625: border-color: var(--color-border-strong);
626: box-shadow:
627: 0 1px 0 rgba(255, 255, 255, 0.9) inset,
628: 0 28px 56px -30px rgba(31, 33, 40, 0.26);
634: background: rgba(255, 255, 255, 0.72);
635: backdrop-filter: blur(8px);
636: -webkit-backdrop-filter: blur(8px);
637: border: 1px solid var(--color-border);
638: box-shadow: 0 12px 32px -28px rgba(31, 33, 40, 0.12);
645: border: 1px solid var(--color-border);
646: background: var(--color-surface);
656: background: rgba(255, 255, 255, 0.55);
657: border-top: 1px solid var(--color-border);
658: border-bottom: 1px solid var(--color-border);
666: background: var(--color-ivory);
667: border-top: 1px solid var(--color-border);
668: border-bottom: 1px solid var(--color-border);
677: border: 1px solid var(--color-forest);
678: background: var(--color-forest);
680: box-shadow: none;
681: transition:
682: background 0.2s ease,
683: border-color 0.2s ease,
687: .btn-primary:hover {
688: background: var(--color-forest);
689: border-color: var(--color-sage-deep);
690: box-shadow: inset 0 0 0 1px var(--color-sage-deep);
698: border: 1px solid var(--color-border-strong);
699: background: var(--color-surface);
701: transition:
702: border-color 0.2s ease,
703: background 0.2s ease,
706: .btn-ghost:hover {
707: border-color: var(--color-forest);
708: background: var(--color-ivory);
715: border: 1px solid var(--color-sage);
716: background: var(--color-sage);
718: transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
720: .btn-dew:hover {
721: background: var(--color-forest);
722: border-color: var(--color-forest);
731: border: 1px solid var(--color-sage-deep);
732: background: transparent;
734: transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
736: .btn-dew-outline:hover {
737: background: var(--color-dew-soft);
744: border: 1px solid var(--color-promo);
745: background: var(--color-promo);
747: transition: background 0.2s ease, border-color 0.2s ease;
749: .btn-promo:hover {
750: background: var(--color-promo-dark);
751: border-color: var(--color-promo-dark);
754: /* Media hover — soft scale, no bounce */
760: transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), filter 0.7s ease;
762: .media-zoom:hover img,
763: .media-zoom:hover .media-zoom-target,
764: a:hover .media-zoom img,
765: article:hover .media-zoom img {
774: [data-product-image-frame]:hover .media-zoom-target,
775: a:hover [data-product-image-frame] .media-zoom-target,
776: article:hover [data-product-image-frame] .media-zoom-target {
781: /* Subtle hover polish — no chrome sweep glare on retail cards */
792: background:
793: linear-gradient(
799: background-size: 200% 100%;
800: animation: product-skel 1.35s ease-in-out infinite;
804: animation: none;
805: background: var(--color-ivory);
809: 0% { background-position: 100% 0; }
810: 100% { background-position: -100% 0; }
814: With js-motion: CSS transitions driven by IntersectionObserver (.is-inview). */
815: [data-reveal] { opacity: 1; transform: none; }
817: opacity: 0;
819: transition:
820: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
822: will-change: opacity, transform;
826: opacity: 1;
831: opacity: 1;
836: Delay is additive to the base reveal transition and gated by .js-motion. */
837: .js-motion [data-reveal][data-stagger='1'] { transition-delay: 55ms; }
838: .js-motion [data-reveal][data-stagger='2'] { transition-delay: 110ms; }
839: .js-motion [data-reveal][data-stagger='3'] { transition-delay: 165ms; }
840: .js-motion [data-reveal][data-stagger='4'] { transition-delay: 220ms; }
841: .js-motion [data-reveal][data-stagger='5'] { transition-delay: 275ms; }
842: .js-motion [data-reveal][data-stagger='6'] { transition-delay: 330ms; }
843: .js-motion [data-reveal][data-stagger='7'] { transition-delay: 385ms; }
846: opacity: 1 !important;
848: transition: none !important;
855: background: rgba(237, 237, 230, 0.94);
856: backdrop-filter: blur(12px);
857: -webkit-backdrop-filter: blur(12px);
858: border-bottom: 1px solid var(--color-border);
859: box-shadow: none;
864: background: var(--color-forest);
868: background: var(--color-promo);
871: background: var(--color-sage-deep);
876: background: var(--color-forest);
880: color: rgba(237, 237, 230, 0.88);
882: .category-nav a:hover,
897: z-index: 1;
898: opacity: 1;
901: .nav-logo:focus-visible {
904: border-radius: 2px;
918: background: linear-gradient(
921: rgba(91, 115, 86, 0.7),
926: transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
928: .nav-link:hover::after,
940: background: var(--color-pearl);
941: background-image: none;
947: background: transparent;
950: background: linear-gradient(
953: rgba(31, 33, 40, 0.18) 40%,
954: rgba(31, 33, 40, 0.4) 100%
959: animation: scroll-cue-pulse 2.8s ease-in-out infinite;
963: 0%, 100% { opacity: 0.35; transform: scaleY(0.85); transform-origin: top; }
964: 50% { opacity: 0.9; transform: scaleY(1); transform-origin: top; }
969: background:
970: radial-gradient(58% 52% at 82% 26%, rgba(143, 185, 184, 0.30) 0%, transparent 62%),
971: radial-gradient(52% 48% at 93% 66%, rgba(185, 169, 214, 0.26) 0%, transparent 60%),
972: radial-gradient(48% 44% at 74% 88%, rgba(226, 182, 154, 0.22) 0%, transparent 58%),
973: radial-gradient(46% 42% at 12% 92%, rgba(214, 196, 154, 0.24) 0%, transparent 60%),
974: linear-gradient(168deg, #F2F1EA 0%, var(--color-ivory) 46%, #E9E8DF 100%);
981: z-index: 0;
983: background:
984: radial-gradient(52% 60% at 16% 84%, rgba(143, 174, 150, 0.22) 0%, transparent 62%),
985: radial-gradient(44% 54% at 88% 8%, rgba(185, 169, 214, 0.20) 0%, transparent 58%);
987: opacity: 0.7;
991: animation: hero-breathe 16s ease-in-out infinite alternate;
996: opacity: 0.55;
1000: opacity: 0.85;
1005: opacity: 0.85;
1022: background: rgba(91, 115, 86, 0.55);
1028: animation: hero-rise 1.15s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
1031: animation: hero-rise 1s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both;
1034: animation: hero-rule 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both;
1037: animation: hero-rise 1.05s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
1040: animation: hero-rise 1.05s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
1043: animation: hero-rise 1.05s cubic-bezier(0.22, 1, 0.36, 1) 0.62s both;
1046: animation: hero-dew-fade 1.4s ease 0.3s both;
1052: opacity: 0;
1054: filter: blur(4px);
1057: opacity: 1;
1059: filter: blur(0);
1063: from { transform: scaleX(0); opacity: 0; }
1064: to { transform: scaleX(1); opacity: 1; }
1067: from { opacity: 0; }
1068: to { opacity: 0.85; }
1080: background: var(--color-forest);
1081: color: rgba(237, 237, 230, 0.92);
1082: border-top: 1px solid rgba(237, 237, 230, 0.08);
1083: box-shadow: none;
1090: color: rgba(237, 237, 230, 0.72);
1091: transition: color 0.25s ease;
1093: .site-footer a:hover {
1097: color: rgba(147, 168, 144, 0.55);
1100: background: rgba(147, 168, 144, 0.35);
1105: border: 1px solid var(--color-border);
1106: background: var(--color-surface);
1107: transition:
1108: background 0.25s ease,
1109: border-color 0.25s ease,
1114: background: var(--color-forest);
1115: border-color: var(--color-forest);
1116: box-shadow: none;
1119: .filter-chip:not([aria-selected='true']):not([aria-pressed='true']):hover {
1120: border-color: var(--color-forest);
1121: background: var(--color-ivory);
1127: background: var(--color-dew-surface);
1128: border: 1px solid rgba(91, 115, 86, 0.22);
1131: background: var(--color-dew-soft);
1133: border: 1px solid rgba(91, 115, 86, 0.25);
1139: background: var(--color-sage);
1144: background: var(--color-stone);
1198: color: rgba(26, 28, 32, 0.62);
1208: background: rgba(31, 33, 40, 0.35);
1220: background-color: var(--color-surface);
1221: box-shadow: 0 18px 40px -32px rgba(31, 33, 40, 0.14);
1222: border: 1px solid var(--color-border);
1227: background-image:
1228: radial-gradient(120% 90% at 12% 8%, rgba(143, 185, 184, 0.16), transparent 42%),
1229: radial-gradient(110% 90% at 88% 18%, rgba(185, 169, 214, 0.14), transparent 44%),
1230: radial-gradient(120% 110% at 78% 92%, rgba(216, 175, 168, 0.14), transparent 46%),
1231: radial-gradient(110% 100% at 16% 96%, rgba(214, 196, 154, 0.15), transparent 44%),
1232: linear-gradient(180deg, var(--color-ivory) 0%, #F4F3EE 100%);
1235: background-image: linear-gradient(
1237: rgba(143, 185, 184, 0.9),
1238: rgba(185, 169, 214, 0.9),
1239: rgba(216, 175, 168, 0.9),
1240: rgba(214, 196, 154, 0.9),
1241: rgba(226, 182, 154, 0.9)
1246: background-image: linear-gradient(180deg, var(--color-ivory) 0%, #F4F3EE 100%);
1250: /* Concern / skin-goal tile — quiet tint, soft lift on hover */
1255: transition: transform 0.3s ease, box-shadow 0.3s ease;
1262: background-image: linear-gradient(
1265: rgba(30, 43, 34, 0.18),
1269: @media (hover: hover) {
1270: .concern-tile:hover {
1272: box-shadow: 0 18px 36px -30px rgba(30, 43, 34, 0.38);
1277: transition: none;
1279: .concern-tile:hover {
1288: background-image:
1289: radial-gradient(115% 88% at 14% 6%, var(--sp-wash-1, transparent), transparent 46%),
1290: radial-gradient(105% 86% at 88% 22%, var(--sp-wash-2, transparent), transparent 48%),
1291: linear-gradient(180deg, var(--sp-soft, var(--color-ivory)) 0%, rgba(255, 255, 255, 0.9) 100%);
1301: background-color: var(--sp-accent, var(--color-sage-deep));
1312: z-index: -1;
1313: border-radius: 50%;
1314: background-image: radial-gradient(
1316: var(--sp-wash-1, rgba(143, 185, 184, 0.3)),
1317: var(--sp-wash-2, rgba(185, 169, 214, 0.2)) 55%,
1320: filter: blur(26px);
1331: border-radius: 999px;
1332: background-color: var(--sp-accent, var(--color-sage-deep));
1336: filter: blur(18px);
1355: -webkit-mask-image: linear-gradient(
1358: #000 18%,
1359: #000 82%,
1362: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
1364: mask-image: linear-gradient(
1367: #000 18%,
1368: #000 82%,
1371: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
1388: z-index: 1;
1390: background-image: linear-gradient(
1392: rgba(143, 185, 184, 0.26) 0%,
1393: rgba(185, 169, 214, 0.18) 44%,
1394: rgba(226, 182, 154, 0.16) 100%
1398: .hero-product__shadow {
1404: z-index: 0;
1405: border-radius: 50%;
1406: background: radial-gradient(50% 50% at 50% 50%, rgba(30, 43, 34, 0.22), transparent 72%);
1407: filter: blur(14px);
1411: z-index: 2;
1414: box-shadow: 0 20px 40px -30px rgba(30, 43, 34, 0.55);
1418: animation: hero-float 9s ease-in-out infinite alternate;
1431: animation: none;
1448: --bg-void: #EDEBE6; /* page ground, warm ivory */
1449: --bg-elevated: #F4F2ED;
1450: --bg-elevated-2: #F8F6F2;
1451: --hairline: #D9D4CA;
1452: --text-primary: #141412;
1453: --text-secondary: #4A463F;
1454: --text-tertiary: #8A857B;
1458: decorative rules and disabled affordances. */
1459: --text-eyebrow: #5F5B53;
1460: --accent-ink: #141412;
1463: --accent-pink: #141412;
1464: --accent-pink-bright: #141412;
1465: --accent-pink-dim: #3A3833;
1466: --accent-pink-wash: rgba(20, 20, 18, 0.05);
1469: --refract-champagne: #C9B79A;
1470: --refract-blush: #DCC3BD;
1471: --refract-ice: #C6D3D8;
1472: --refract-lavender: #CFC9DE;
1478: --surface-void: #EDEBE6;
1479: --surface-elevated: #FFFFFF;
1480: --surface-elevated-2: #F4F2ED;
1481: --hairline-solid: #D9D4CA;
1484: --color-forest: #141412;
1485: --color-sage-deep: #141412;
1486: --color-sage: #141412;
1487: --color-ivory: #EDEBE6;
1488: --color-stone: #DCD7CD;
1489: --color-black: #141412;
1490: --color-ink: #141412;
1491: --color-pearl: #F4F2ED;
1492: --color-chrome: #8A857B;
1493: --color-graphite: #141412;
1494: --color-ice: #C6D3D8;
1495: --color-lavender: #CFC9DE;
1496: --color-blush: #DCC3BD;
1497: --color-charcoal: #141412;
1498: --color-muted: #5F5B53;
1499: --color-surface: #FFFFFF;
1500: --color-surface-light: #F4F2ED;
1501: --color-specular: #FFFFFF;
1502: --color-border: #D9D4CA;
1503: --color-border-strong: #BDB7AB;
1504: --color-promo: #8B3A3A;
1505: --color-promo-dark: #6E2E2E;
1506: --color-dew: #141412;
1507: --color-dew-dark: #141412;
1508: --color-dew-mid: #3A3833;
1509: --color-dew-soft: #F0EDE7;
1510: --color-dew-surface: #E8E4DC;
1511: --color-aqua: #C6D3D8;
1512: --color-aqua-deep: #9FB0B6;
1513: --color-lilac: #CFC9DE;
1514: --color-lilac-deep: #A79FBE;
1515: --color-blush-deep: #BFA49E;
1516: --color-champagne: #C9B79A;
1517: --color-champagne-deep: #A38F6B;
1518: --color-peach: #E4CBB8;
1519: --color-peach-deep: #C0A288;
1520: --color-botanical: #CBD6C6;
1521: --color-botanical-deep: #A5B3A0;
1525: background: var(--bg-void);
1532: background: var(--bg-void);
1535: background: linear-gradient(
1537: rgba(255, 255, 255, 0.5) 0%,
1538: rgba(237, 235, 230, 0.0) 34%,
1539: rgba(220, 215, 205, 0.22) 100%
1541: opacity: 1;
1546: background: linear-gradient(
1548: rgba(201, 183, 154, 0.05) 0%,
1554: opacity: 0.1;
1557: opacity: 0.3;
1558: background-image: radial-gradient(rgba(20, 20, 18, 0.05) 0.5px, transparent 0.7px);
1561: background:
1562: radial-gradient(ellipse 100% 80% at 50% 100%, rgba(190, 182, 168, 0.14) 0%, transparent 58%),
1563: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 255, 255, 0.5) 0%, transparent 62%);
1566: background: radial-gradient(
1568: rgba(255, 255, 255, 0.7) 0%,
1569: rgba(201, 183, 154, 0.12) 40%,
1574: /* Cursor-reactive light. Position comes from --glow-x / --glow-y, which a
1579: z-index: 0;
1581: opacity: 0;
1582: transition: opacity 900ms ease;
1583: background: radial-gradient(
1585: rgba(255, 255, 255, 0.55) 0%,
1586: rgba(201, 183, 154, 0.07) 44%,
1587: rgba(201, 183, 154, 0) 74%
1590: .ambient-glow[data-active='true'] {
1591: opacity: 1;
1598: background: var(--color-surface);
1601: border: 1px solid var(--color-border);
1602: box-shadow: none;
1603: transition:
1604: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
1605: border-color 0.35s ease,
1615: z-index: 1;
1617: a.glass-1:hover,
1618: .glass-1.glass-lift:hover {
1619: border-color: var(--color-ink);
1620: box-shadow: none;
1626: background: rgba(255, 255, 255, 0.82);
1627: backdrop-filter: blur(10px);
1628: -webkit-backdrop-filter: blur(10px);
1629: border: 1px solid var(--color-border);
1630: box-shadow: none;
1633: background: rgba(255, 255, 255, 0.55);
1634: border-top: 1px solid var(--color-border);
1635: border-bottom: 1px solid var(--color-border);
1640: background: var(--bg-void);
1642: border-color: var(--hairline);
1645: background: var(--color-stone);
1648: background: #F4F2ED;
1649: border: 1px solid var(--hairline);
1652: background: rgba(20, 20, 18, 0.04);
1654: border: 1px solid var(--hairline);
1659: hairline near-black border, ink label. Near-square, no shadow, no glow. */
1661: border: 1px solid var(--accent-ink);
1662: background: var(--accent-ink);
1663: /* Ivory on #141412 measures ~17:1 — well past AA for the small tracked
1666: box-shadow: none;
1667: transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
1669: .btn-primary:hover {
1670: background: #000000;
1671: border-color: #000000;
1672: color: #FFFFFF;
1674: .btn-primary:active {
1675: background: #000000;
1676: border-color: #000000;
1679: .btn-primary:disabled,
1680: .btn-primary[aria-disabled='true'] {
1681: background: #B9B4AA;
1682: border-color: #B9B4AA;
1683: color: #F4F2ED;
1684: box-shadow: none;
1690: border: 1px solid var(--accent-ink);
1691: background: transparent;
1694: .btn-ghost:hover,
1695: .btn-dew-outline:hover {
1696: border-color: var(--accent-ink);
1697: background: rgba(20, 20, 18, 0.05);
1700: .btn-ghost:active,
1701: .btn-dew-outline:active {
1702: background: rgba(20, 20, 18, 0.09);
1706: border: 1px solid var(--accent-ink);
1707: background: transparent;
1710: .btn-dew:hover {
1711: background: var(--accent-ink);
1712: border-color: var(--accent-ink);
1717: border: 1px solid var(--color-promo);
1718: background: var(--color-promo);
1719: color: #FFFFFF;
1721: .btn-promo:hover {
1722: background: var(--color-promo-dark);
1723: border-color: var(--color-promo-dark);
1732: background: none;
1733: border: 0;
1744: background: currentColor;
1747: transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
1749: .btn-tertiary:hover {
1752: .btn-tertiary:hover::after,
1753: .btn-tertiary:focus-visible::after {
1761: background: var(--bg-void);
1763: border-bottom: 1px solid var(--hairline);
1765: .announcement-bar a:hover {
1770: background: var(--bg-void);
1772: border-top: 1px solid var(--hairline);
1773: border-bottom: 1px solid var(--hairline);
1778: .category-nav a:hover,
1789: background: transparent;
1792: border-bottom: 0;
1793: box-shadow: none;
1797: background: var(--accent-ink);
1801: .nav-logo:focus-visible {
1807: background:
1808: radial-gradient(70% 60% at 78% 30%, rgba(201, 183, 154, 0.16) 0%, transparent 62%),
1809: radial-gradient(60% 50% at 16% 12%, rgba(255, 255, 255, 0.9) 0%, transparent 60%),
1813: background:
1814: radial-gradient(52% 60% at 14% 86%, rgba(198, 211, 216, 0.16) 0%, transparent 62%),
1815: radial-gradient(44% 54% at 88% 6%, rgba(220, 195, 189, 0.14) 0%, transparent 58%);
1817: opacity: 0.5;
1820: background: var(--accent-ink);
1823: background: linear-gradient(
1826: rgba(20, 20, 18, 0.2) 40%,
1827: rgba(20, 20, 18, 0.7) 100%
1833: background: var(--bg-void);
1835: border-top: 1px solid var(--hairline);
1840: .site-footer a:hover {
1844: color: var(--color-border);
1847: background: var(--hairline);
1852: border: 1px solid var(--hairline);
1853: background: transparent;
1858: background: var(--accent-ink);
1859: border-color: var(--accent-ink);
1862: .filter-chip:not([aria-selected='true']):not([aria-pressed='true']):hover {
1863: border-color: var(--accent-ink);
1864: background: transparent;
1870: gradient belonged to the dark ground and reads as a stain on pearl. */
1872: background-image: none;
1873: -webkit-background-clip: initial;
1874: background-clip: initial;
1879: background: radial-gradient(
1881: rgba(255, 255, 255, 0.7) 0%,
1882: rgba(201, 183, 154, 0.12) 40%,
1883: rgba(201, 183, 154, 0) 76%
1890: background-image:
1891: radial-gradient(90% 70% at 18% 10%, rgba(255, 255, 255, 0.85) 0%, transparent 52%),
1892: radial-gradient(70% 60% at 82% 26%, rgba(220, 195, 189, 0.28) 0%, transparent 58%),
1893: radial-gradient(80% 70% at 55% 88%, rgba(198, 211, 216, 0.24) 0%, transparent 60%),
1894: linear-gradient(180deg, #F6F4EF 0%, var(--bg-void) 100%);
1897: background-image: linear-gradient(90deg, transparent, var(--refract-champagne), transparent);
1900: background-color: var(--refract-champagne);
1903: now carries its own light and a synthesised contact shadow, and a bloom
1915: background: rgba(20, 20, 18, 0.28);
1918: background-image: linear-gradient(90deg, transparent, rgba(20, 20, 18, 0.14), transparent);
1923: background: transparent;
1925: border: 1px solid var(--hairline);
1928: mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 1.5rem), transparent 100%);
1931: background: rgba(20, 20, 18, 0.14);
1935: background: #FFFFFF;
1937: border: 1px solid var(--accent-ink);
1939: .skip-link:focus,
1940: .skip-link:focus-visible {
1942: box-shadow: 0 0 0 4px rgba(20, 20, 18, 0.18);
1944: :focus-visible {
1947: box-shadow: 0 0 0 4px rgba(20, 20, 18, 0.16);
1949: .bg-graphite:focus-visible,
1950: .bg-ink:focus-visible,
1951: .bg-black:focus-visible,
1952: .bg-forest:focus-visible,
1953: .btn-primary:focus-visible,
1954: button.bg-graphite:focus-visible,
1955: a.bg-graphite:focus-visible {
1957: box-shadow: 0 0 0 4px rgba(20, 20, 18, 0.22);
1959: label:has(input:focus-visible) {
1961: box-shadow: 0 0 0 4px rgba(20, 20, 18, 0.16);
1964: background-color: #FFFFFF;
1965: border: 1px solid var(--hairline);
1966: box-shadow: 0 24px 60px -40px rgba(20, 20, 18, 0.4);
1969: background-image: linear-gradient(
1971: rgba(255, 255, 255, 0.55) 0%,
1972: rgba(201, 183, 154, 0.12) 44%,
1973: rgba(20, 20, 18, 0.03) 100%
1976: .hero-product__shadow {
1977: background: radial-gradient(50% 50% at 50% 50%, rgba(20, 20, 18, 0.16), transparent 72%);
1980: box-shadow: none;
1995: variants (`border-graphite/25`) are separate class names and keep their
1998: background-color: var(--accent-ink);
2000: .bg-graphite:hover {
2001: background-color: #000000;
2003: .border-graphite {
2004: border-color: var(--accent-ink);
2013: background-color: var(--color-stone);
2046: z-index: 0;
2048: opacity: 0.02;
2049: background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
2050: background-size: 140px 140px;
2055: product rather than behind the type. Cheap: no filters, no animation. */
2059: background-image:
2060: linear-gradient(118deg, transparent 28%, rgba(255, 255, 255, 0.5) 40%, transparent 52%),
2061: linear-gradient(118deg, transparent 54%, rgba(226, 197, 190, 0.22) 66%, transparent 78%),
2062: linear-gradient(118deg, transparent 76%, rgba(198, 211, 216, 0.18) 85%, transparent 94%),
2063: radial-gradient(72% 66% at 20% 12%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.34) 30%, rgba(255, 255, 255, 0) 74%),
2064: radial-gradient(66% 62% at 82% 28%, rgba(226, 197, 190, 0.34) 0%, rgba(226, 197, 190, 0.12) 34%, rgba(226, 197, 190, 0) 76%),
2065: radial-gradient(70% 64% at 58% 88%, rgba(198, 211, 216, 0.3) 0%, rgba(198, 211, 216, 0.1) 36%, rgba(198, 211, 216, 0) 78%),
2066: radial-gradient(50% 46% at 92% 72%, rgba(207, 201, 222, 0.24) 0%, rgba(207, 201, 222, 0.08) 40%, rgba(207, 201, 222, 0) 80%),
2067: linear-gradient(168deg, #F8F6F1 0%, #EDEBE6 48%, #E4E0D8 100%);
2075: gradients instead. It is decorative, cheap (no filters over text, no
2076: animation), and sits under the content in its own layer.
2085: z-index: 0;
2095: background:
2096: radial-gradient(34% 28% at 64% 20%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 64%),
2097: radial-gradient(48% 42% at 34% 62%, rgba(198, 211, 216, 0.42) 0%, rgba(198, 211, 216, 0) 68%),
2098: radial-gradient(42% 38% at 78% 76%, rgba(207, 201, 222, 0.34) 0%, rgba(207, 201, 222, 0) 72%),
2099: radial-gradient(56% 50% at 62% 44%, rgba(226, 197, 190, 0.32) 0%, rgba(226, 197, 190, 0) 70%);
2100: filter: blur(38px);
2106: background-image:
2107: linear-gradient(112deg, transparent 30%, rgba(255, 255, 255, 0.85) 38%, transparent 45%),
2108: linear-gradient(112deg, transparent 52%, rgba(255, 255, 255, 0.5) 58%, transparent 64%),
2109: linear-gradient(112deg, transparent 64%, rgba(226, 197, 190, 0.42) 71%, transparent 78%),
2110: linear-gradient(112deg, transparent 82%, rgba(198, 211, 216, 0.4) 87%, transparent 93%);
2114: border-radius: 50%;
2115: background: radial-gradient(
2117: rgba(255, 255, 255, 0.95) 0%,
2118: rgba(214, 226, 232, 0.4) 38%,
2119: rgba(255, 255, 255, 0) 72%
2121: filter: blur(16px);
2123: .hero-art__shadow {
2127: border-radius: 50%;
2128: background: radial-gradient(
2130: rgba(120, 112, 98, 0.34) 0%,
2131: rgba(120, 112, 98, 0.12) 52%,
2132: rgba(120, 112, 98, 0) 78%
2134: filter: blur(12px);
2139: border-top: 1px solid var(--hairline);
2142: border-bottom: 1px solid var(--hairline);
2151: Scroll-driven animation does the same job with no JavaScript and no DOM
2153: `animation-timeline` support simply shows the content — there is no
2155: @supports (animation-timeline: view()) {
2158: animation: pearl-reveal-in linear both;
2159: animation-timeline: view();
2160: animation-range: entry 0% entry 55%;
2162: .js-motion .reveal-blur,
2163: .reveal-blur {
2164: animation: pearl-reveal-blur linear both;
2165: animation-timeline: view();
2166: animation-range: entry 0% entry 45%;
2173: opacity: 0;
2177: opacity: 1;
2182: @keyframes pearl-reveal-blur {
2184: opacity: 0;
2185: filter: blur(8px);
2189: opacity: 1;
2190: filter: blur(0);
2198: transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease,
2199: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
2203: transition: transform 90ms linear, box-shadow 300ms ease, background-color 200ms ease;
2205: @media (hover: none), (pointer: coarse) {
2215: border-radius: inherit;
2216: border: 1px solid var(--accent-ink);
2218: animation: pink-pulse 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
2223: opacity: 0.55;
2227: opacity: 0;
2231: opacity: 0;
2235: /* Hero reveal: blur(8px) → sharp, staggered per line/word.
2237: with JS disabled or reduced-motion on the content is plain and visible. */
2238: .js-motion .reveal-blur {
2239: opacity: 0;
2240: filter: blur(8px);
2243: .js-motion .reveal-blur[data-revealed='true'] {
2244: opacity: 1;
2245: filter: blur(0);
2247: transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
2258: transition: clip-path 900ms cubic-bezier(0.22, 1, 0.36, 1);
2266: background: var(--bg-elevated);
2267: border: 1px solid var(--hairline);
2268: transition: border-color 320ms ease;
2274: z-index: 0;
2276: background: linear-gradient(
2278: rgba(20, 20, 18, 0) 0%,
2279: rgba(20, 20, 18, 0.06) 50%,
2280: rgba(20, 20, 18, 0.16) 100%
2283: transition: transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
2285: .goal-tile:hover,
2286: .goal-tile:focus-visible {
2287: border-color: var(--accent-ink);
2289: .goal-tile:hover::before,
2290: .goal-tile:focus-visible::before {
2295: z-index: 1;
2298: transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
2300: .goal-tile:hover .goal-arrow,
2301: .goal-tile:focus-visible .goal-arrow {
2307: background: linear-gradient(
2309: rgba(20, 20, 18, 0.06) 0%,
2310: rgba(20, 20, 18, 0.02) 100%
2312: animation: skeleton-breathe 1900ms ease-in-out infinite;
2317: opacity: 0.35;
2320: opacity: 0.7;
2331: transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
2336: /* Ghost add-to-bag rises from the bottom edge on hover; on touch input there
2337: is no hover to wait for, so it is simply present. */
2340: opacity: 0;
2341: transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease;
2343: .group:hover .card-add,
2344: .group:focus-within .card-add {
2346: opacity: 1;
2351: transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
2353: .group:hover .card-micro {
2357: /* Hairline → ink rule on hover. */
2359: border-color: var(--hairline);
2360: transition: border-color 320ms ease;
2362: .group:hover .card-edge {
2363: border-color: var(--accent-ink);
2370: transition: transform 120ms linear;
2378: border: 1px solid var(--hairline);
2387: transition: color 200ms ease, background-color 200ms ease;
2389: .stepper button:hover:not(:disabled) {
2391: background: rgba(20, 20, 18, 0.04);
2393: .stepper button:disabled {
2400: border-left: 1px solid var(--hairline);
2401: border-right: 1px solid var(--hairline);
2402: background: transparent;
2411: z-index: 0;
2412: background: linear-gradient(
2414: rgba(20, 20, 18, 0.05) 0%,
2415: rgba(20, 20, 18, 0.015) 100%
2417: animation: skeleton-breathe 1900ms ease-in-out infinite;
2423: background-keyed without destroying the label text (see DOCUMENT_PANEL_SOURCES
2427: background: #FFFFFF;
2428: border: 1px solid var(--hairline);
2437: transition: none !important;
2442: animation: none;
2445: transition: none;
2447: opacity: 1;
2450: .group:hover .card-micro,
2452: .group:hover .card-edge,
2456: .goal-tile:hover .goal-arrow {
2457: transition: none;
2460: .reveal-blur,
2461: .reveal-blur[data-revealed='true'] {
2462: opacity: 1;
2469: transition: none;
2474: animation: none !important;
```

## app\layout.jsx
```
40: 'Professional Skin Script skincare with licensed aesthetician Emily Mitchener. Shop clinical actives and book a virtual consultation.';
47: { media: '(prefers-color-scheme: light)', color: '#EDEBE6' },
48: { media: '(prefers-color-scheme: dark)', color: '#EDEBE6' }
```

## app\not-found.jsx
```
22: className="border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
28: className="border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal"
```

## app\page.jsx
```
21: 'Professional Skin Script skincare from Dew Theory with Emily Mitchener. Shop clinical actives, build a routine, or book a 1:1 virtual consultation. Free shipping at $49+.',
26: 'Skin Script actives for home, a routine builder, and one-on-one virtual consultations with Emily Mitchener. Free shipping at $49+.',
37: 'Skin Script actives for home, a routine builder, and one-on-one virtual consultations with Emily Mitchener.',
77: <section className="border-b border-border bg-void py-8 sm:py-10" aria-label="How Dew Theory works">
91: <section className="border-b border-border bg-void" aria-labelledby="journal-teaser">
110: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
114: <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
119: className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-300 hover:bg-surface lg:p-8"
141: <section className="border-b border-border bg-void py-10 sm:py-12" aria-label="Browse the collection">
```

## app\about\page.jsx
```
51: Products are described with their real actives, real sizes and the concerns they
65: attacks it, so actives are introduced in order and at a pace your skin can hold.
76: <section className="mt-16 border-t border-border pt-12">
95: <li key={head} className="border-t border-hairline pt-5">
105: <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-border pt-10">
```

## app\account\page.jsx
```
77: <ul className="mt-6 border-t border-border">
81: className="flex flex-col gap-3 border-b border-border py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
106: <div className="mt-6 border border-border px-8 py-14 text-center">
116: <section className="mt-16 border-t border-border pt-10" aria-labelledby="account-details">
```

## app\admin\page.jsx
```
61: : 'bg-stone/30 text-forest/70 hover:bg-stone/50'
88: <Link href={item.href} className="text-sm font-medium text-sage-deep hover:underline shrink-0">
128: <Link href="/admin/integrations" className="text-sm text-sage-deep hover:underline">
159: <tr key={o.id} className="border-t border-chrome/15">
161: <Link href={`/admin/orders/${o.id}`} className="text-sage-deep hover:underline font-mono text-xs">
193: <tr key={j.id} className="border-t border-chrome/15">
197: <Link href={`/admin/orders/${j.order_id}`} className="text-sage-deep hover:underline text-xs">
207: <Link href="/admin/fulfillment" className="mt-2 inline-block text-sm text-sage-deep hover:underline">
```

## app\consultation\page.jsx
```
30: <header className="relative isolate overflow-hidden border-b border-border">
73: className="underline decoration-border underline-offset-4 hover:decoration-ink"
86: <ol className="mt-8 grid gap-px border border-border bg-border lg:grid-cols-3">
120: <div className="mt-14 border-t border-border pt-10">
```

## app\contact\page.jsx
```
38: <Link href="/shipping" className="underline decoration-border underline-offset-4 hover:decoration-ink">
44: <Link href="/returns" className="underline decoration-border underline-offset-4 hover:decoration-ink">
52: className="underline decoration-border underline-offset-4 hover:decoration-ink"
59: <Link href="/help" className="underline decoration-border underline-offset-4 hover:decoration-ink">
66: <div className="border-t border-border pt-8">
74: className="underline decoration-border underline-offset-4 hover:decoration-ink"
```

## app\faq\page.jsx
```
73: a: "Enter your code at checkout — active, valid codes apply automatically to your subtotal. If a code doesn't apply, it may be expired, inactive, or fully redeemed."
94: a: 'No. It is an educational starting point, not a diagnosis. Sensitive, reactive, or medical skin conditions deserve a virtual consultation with Emily.'
110: a: 'A Zoom-based session with Emily: a focused review of your skin, current products, and goals. You will complete a secure intake with private photo upload beforehand, then receive a personalized morning and evening routine afterward.'
190: <div className="mt-4 rounded-[3px] border border-border bg-white px-5 sm:px-8">
198: className="mt-16 flex flex-col gap-6 rounded-[3px] border border-border bg-surface-light p-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:p-10"
```

## app\favorites\page.jsx
```
62: <div className="border border-border px-8 py-16 text-center">
```

## app\help\page.jsx
```
33: <Link href="/shipping" className="underline decoration-border underline-offset-4">
45: <Link href="/returns" className="underline decoration-border underline-offset-4">
49: <Link href="/contact" className="underline decoration-border underline-offset-4">
62: <Link href="/virtual-consultation" className="underline decoration-border underline-offset-4">
66: <Link href="/booking-policy" className="underline decoration-border underline-offset-4">
75: a: 'No. The full catalogue is open and every product page lists its actives, size and the concerns it addresses. The consultation exists if you would rather not choose by yourself.'
85: className="underline decoration-border underline-offset-4"
101: Every product page lists its key actives with their function, and the{' '}
102: <Link href="/ingredients" className="underline decoration-border underline-offset-4">
119: <ul className="border-t border-border">
121: <li key={f.q} className="border-b border-border">
127: className="mt-1 shrink-0 font-body text-[1.1rem] leading-none text-muted transition-transform duration-300 group-open:rotate-45"
```

## app\how-it-works\page.jsx
```
52: intro="You do not need to know what a serum does, or which active to introduce first. Pick the level of help you want, and the rest follows."
55: <ol className="grid gap-px border border-border bg-border lg:grid-cols-3">
73: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
80: <section className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-3">
88: <Link href="/shipping" className="underline decoration-border underline-offset-4 hover:decoration-ink">
102: className="underline decoration-border underline-offset-4 hover:decoration-ink"
117: className="underline decoration-border underline-offset-4 hover:decoration-ink"
```

## app\ingredients\page.jsx
```
9: 'Every key active in the Skin Script catalogue, what it does, and which products contain it.',
13: description: 'Every key active in the catalogue, what it does, and where it appears.',
24: * Built entirely from `key_actives` in the catalogue — the name, the function
33: for (const active of product.key_actives || []) {
34: const name = typeof active === 'string' ? active : active?.name;
36: const fn = typeof active === 'object' ? active.function : null;
56: intro={`${items.length} key actives across the current catalogue. Each entry is taken from the product records themselves — what the active is, what it is there to do, and which products carry it.`}
63: emptyMessage="No active in the catalogue matches that. Try a shorter term, or browse the full collection."
66: <p className="mt-14 max-w-measure border-t border-border pt-8 font-body text-[0.9rem] leading-[1.7] text-muted">
```

## app\journal\page.jsx
```
9: 'Notes on building a routine that holds up — order of application, introducing actives, barrier care and daily protection.',
13: description: 'Notes on routines, actives and barrier care.',
31: <article className="border-b border-border pb-14">
33: <div className="refraction-field aspect-[4/3] w-full border border-border lg:aspect-auto lg:min-h-[22rem]" aria-hidden="true" />
49: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
60: className="border border-hairline px-3 py-1.5 font-body text-[0.7rem] uppercase tracking-eyebrow text-muted"
67: <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
72: className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-300 hover:bg-surface lg:p-8"
86: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
```

## app\privacy\page.jsx
```
116: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
122: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
128: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## app\returns\page.jsx
```
54: <a href="mailto:hello@dewtheory.studio" className="text-ink underline-offset-4 hover:underline">
65: Categories that cannot be returned (for example opened actives, certain hygiene-sensitive
100: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## app\routine\page.jsx
```
58: <div className="mt-16 border-t border-border pt-10" data-reveal>
61: className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## app\search\page.jsx
```
19: <Suspense fallback={<div className="h-24 border-b border-border" aria-hidden="true" />}>
```

## app\shipping\page.jsx
```
71: Catalog products are Skin Script actives sold through Dew Theory.{' '}
83: className="text-ink underline-offset-4 hover:underline"
102: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## app\shop\page.jsx
```
13: 'Shop Skin Script professional skincare — the same actives Emily uses in the studio. Free shipping at $49+ pre-discount. Cleansers, serums, moisturizers, SPF, and more.',
48: <header className="relative isolate overflow-hidden border-b border-border">
73: ' professional formulations — the same actives a licensed aesthetician uses in treatment.'}
78: <div className="border-b border-border bg-void py-8 sm:py-10">
94: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
104: className="inline-flex min-h-[40px] items-center border border-hairline px-4 font-body text-[0.7rem] uppercase tracking-eyebrow text-muted transition-colors hover:border-ink hover:text-ink"
```

## app\skin-concerns\page.jsx
```
53: <ul className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
58: className="group flex h-full min-h-[16rem] flex-col justify-between p-7 transition-colors duration-300 hover:bg-surface lg:min-h-[19rem] lg:p-9"
68: {family.blurb}
72: <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
```

## app\skin-quiz\page.jsx
```
58: <div className="mt-16 border-t border-border pt-10" data-reveal>
61: className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## app\virtual-consultation\page.jsx
```
11: 'Meet Emily by Zoom for a focused skin review. Secure intake, private photo upload, and a personalized morning and evening routine within 24-48 hours.',
35: body: 'A focused read of what is actually happening — not a generic routine pulled off a shelf.'
51: 'Barrier condition and how much active your skin is ready for',
74: title: 'Pause strong active products, when appropriate',
75: body: 'When possible, avoid strong active products for 24-48 hours before taking your photos and joining the consultation. This may include retinoids, exfoliating acids, benzoyl peroxide, scrubs, and strong masks. Do not stop a prescribed medication or prescription skincare treatment unless your prescribing clinician has told you to do so.'
98: a: 'The session length is shown in the booking details before you commit. Plan on a focused one-on-one review of your skin, products, and goals.'
127: className="spectral-wash relative border-b border-border"
149: Meet Emily for a focused review of your skin, current products, habits, and goals.
165: className="mt-6 max-w-xl border border-border bg-white/80 px-5 py-4 font-body text-sm font-normal text-charcoal"
191: <section className="border-b border-border bg-ivory" aria-labelledby="vc-benefits">
206: className="border border-border bg-white p-6 sm:p-7"
222: <section className="border-b border-border bg-surface-light" aria-labelledby="vc-cover">
237: className="flex gap-3 border border-border bg-white p-5 font-body text-sm font-normal leading-relaxed text-charcoal sm:p-6"
248: <section className="border-b border-border bg-ivory" aria-labelledby="vc-receive">
263: className="flex gap-3 border border-border bg-white p-5 font-body text-sm font-normal leading-relaxed text-charcoal sm:p-6"
277: <section id="book" className="border-b border-border bg-ivory" aria-labelledby="vc-book">
296: className="underline decoration-border underline-offset-2 hover:text-ink"
306: <section className="border-b border-border bg-surface-light" aria-labelledby="vc-prep">
324: className="border border-border bg-white p-5 sm:p-6"
339: <section id="faq" className="border-b border-border bg-ivory" aria-labelledby="vc-faq">
351: <div className="divide-y divide-border border-t border-border">
357: className="text-muted transition-transform group-open:rotate-45"
377: className="flex flex-col items-start justify-between gap-8 border border-border bg-white p-8 sm:p-10 lg:flex-row lg:items-center"
391: One focused conversation, then a plan you can actually follow.
403: className="inline-flex min-h-[44px] items-center justify-center px-4 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink/70 hover:text-ink"
```

## app\virtual-consultation\success\page.jsx
```
95: className="mt-5 max-w-xl border border-chrome/25 bg-pearl/50 px-5 py-4 font-body text-sm font-light leading-relaxed text-charcoal/80"
144: className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
150: className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
156: className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
```

## app\skin-concerns\[slug]\page.jsx
```
24: description: family.blurb,
28: description: family.blurb,
49: intro={family.blurb}
79: <div className="mt-16 border-t border-border pt-8">
87: className="border border-hairline px-3 py-1.5 font-body text-[0.72rem] text-muted"
96: <div className="border border-border px-8 py-16 text-center">
```

## app\shop\[id]\page.jsx
```
63: className="group border-b border-border py-4"
68: <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">
98: const actives = product.key_actives || product.active_ingredients || [];
178: <Link href="/" className="hover:text-ink">
184: <Link href="/shop" className="hover:text-ink">
192: className="hover:text-ink"
213: <span className="absolute left-4 top-4 z-[2] border border-border bg-white/95 px-3 py-1.5 font-label text-[0.58rem] font-normal uppercase tracking-lockup text-ink">
242: className="border border-border px-3 py-1.5 font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted"
255: {/* Benefit row — the first three recorded actives. Labels and copy come
258: {actives.length ? (
259: <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
260: {actives.slice(0, 3).map((active) => {
262: typeof active === 'string' ? active : active?.name || '';
264: const detail = typeof active === 'object' ? active.function : null;
281: <div className="mt-5 border border-border bg-surface-light px-4 py-3">
291: className="inline-flex min-h-[44px] items-center font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
316: {actives.length > 0 ? (
317: <AccordionSection title="Key actives">
319: {actives.map((a) => (
370: <section className="mt-16 border-t border-border pt-12" data-reveal-group="related">
382: Suggested by typical layering order (cleanser → actives → moisturizer → SPF).
395: className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
```

## app\journal\[slug]\page.jsx
```
46: <div className="border-b border-border">
58: className="font-body text-[0.9rem] text-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
85: <ul key={`list-${i}`} className="mt-6 space-y-3 border-l border-border pl-6">
119: className="group flex h-full flex-col justify-between gap-8 border border-border p-6 transition-colors hover:bg-surface"
130: <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
```

## app\consultation\results\page.jsx
```
32: const actives = (product.key_actives || [])
35: if (category.includes('exfoliant') || EVENING_ACTIVE.test(actives)) return 'PM';
141: <div className="border-b border-border pb-8">
152: className="border border-hairline px-3 py-1.5 font-body text-[0.72rem] uppercase tracking-eyebrow text-muted"
211: <div className="mt-20 border-t border-border pt-10">
221: className="underline decoration-border underline-offset-4 hover:decoration-ink"
232: className="underline decoration-border underline-offset-4 hover:decoration-ink"
```

## app\api\checkout\route.js
```
82: resolved.code === 'discount_not_found' || resolved.code === 'discount_inactive'
```

## app\api\discount\validate\route.js
```
12: const status = result.code === 'discount_not_found' || result.code === 'discount_inactive' ? 404 : 400;
25: active: result.discount.active
```

## app\api\admin\discounts\route.js
```
75: active: true,
```

## app\api\admin\import\route.js
```
75: key_actives: raw.key_actives || [],
81: active: raw.active !== false,
```

## app\api\admin\products\route.js
```
31: key_actives: result.product.key_actives || [],
```

## app\api\admin\products\[id]\route.js
```
61: // Soft-delete option via ?soft=1 → inactive + discontinued; hard delete is default
71: active: false,
91: /** PATCH stock_status and/or active only (quick toggles) */
102: const hasActive = Object.prototype.hasOwnProperty.call(body, 'active');
113: if (hasActive) after.active = Boolean(body.active);
119: before: { stock_status: before.stock_status, active: before.active },
120: after: { stock_status: after.stock_status, active: after.active }
```

## app\api\admin\discounts\[id]\route.js
```
19: active: typeof body.active === 'boolean' ? body.active : s.discount_codes[idx].active,
```

## app\api\admin\consultations\[id]\route.js
```
26: .filter((p) => p.active !== false && p.stock_status !== 'discontinued')
```

## app\api\admin\appointments\[id]\route.js
```
16: const transition = validateAppointmentStatusTransition(before.status, nextStatus);
17: if (!transition.ok) {
20: error: transition.error,
21: code: transition.code,
22: allowed: transition.allowed
24: { status: transition.status || 400 }
33: status: transition.to,
40: if (!transition.noop) {
```

## app\admin\analytics\page.jsx
```
112: <div key={label} className="border border-chrome/15 bg-pearl/40 px-4 py-3">
129: className="mt-1 block border border-chrome/30 bg-pearl/90 px-2 py-2"
138: className="mt-1 block border border-chrome/30 bg-pearl/90 px-2 py-2"
143: className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-pearl"
149: className="border border-chrome/30 px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-charcoal"
155: Range filter active{fromYmd ? ` from ${fromYmd}` : ''}
183: className="flex justify-between border-b border-chrome/15 py-2 font-body text-sm font-light"
202: className="flex justify-between border-b border-chrome/15 py-2 font-body text-sm font-light"
220: <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
236: <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
254: <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
271: <ul className="mt-4 divide-y divide-chrome/15 border-y border-chrome/15">
279: {d.uses_count} redemptions · {d.active ? 'active' : 'off'}
```

## app\admin\appointments\page.jsx
```
17: <ul className="mt-10 divide-y divide-chrome/20 border-y border-chrome/20">
```

## app\admin\consultations\page.jsx
```
63: ? 'border border-graphite/30 bg-pearl text-graphite'
64: : 'border border-transparent text-chrome hover:text-charcoal'
72: <ul className="mt-8 divide-y divide-chrome/20 border-y border-chrome/20">
78: className="font-display text-lg font-normal text-graphite hover:underline"
```

## app\admin\emails\page.jsx
```
26: <tr className="border-b border-chrome/25 font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
36: <tr key={em.id} className="border-b border-chrome/10">
66: className="border border-chrome/15 bg-pearl/50 px-4 py-3 font-body text-sm font-light"
82: className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
```

## app\admin\fulfillment\page.jsx
```
32: : 'Durable fulfillment jobs — owner queue / automation disabled.';
56: filter === f ? 'bg-forest text-ivory' : 'bg-stone/30 text-forest/70 hover:bg-stone/50'
99: <tr key={job.id} className="border-t border-chrome/15">
102: <Link href={`/admin/orders/${job.order_id}`} className="text-sage-deep hover:underline text-xs">
```

## app\admin\integrations\page.jsx
```
50: catalogProductCount: mapping.activeProducts,
```

## app\admin\orders\page.jsx
```
49: const active = status === s;
55: className={`border px-3 py-2 font-label text-[0.58rem] uppercase tracking-lockup ${
56: active
57: ? 'border-forest bg-forest text-ivory'
58: : 'border-chrome/30 text-muted hover:border-forest/40'
80: <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-chrome/15 pt-3">
84: <Link href={`/admin/orders/${o.id}`} className="font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep hover:underline">
```

## app\admin\products\page.jsx
```
17: Full CRUD. Retail auto ×2 on wholesale change. Inactive / discontinued stay off the shop.
23: className="border border-graphite/25 px-5 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
29: className="border border-graphite bg-graphite px-5 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
56: <div className="mt-4 flex flex-col gap-3 border-t border-chrome/15 pt-3">
60: active={p.active}
66: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
80: <tr className="border-b border-chrome/25 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
91: <tr key={p.id} className="border-b border-chrome/15 font-body text-sm font-light">
94: {p.active === false && (
113: active={p.active}
120: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-charcoal hover:underline"
```

## app\admin\system\page.jsx
```
70: <tr key={row.id || `${row.created_at}-${row.action}`} className="border-t border-chrome/15">
```

## app\admin\orders\[id]\page.jsx
```
60: <Link href="/admin/orders" className="hover:text-forest">← Orders</Link>
91: <Link href="/admin/fulfillment" className="mt-2 inline-block text-sm text-sage-deep hover:underline">
100: <ul className="mt-4 divide-y divide-chrome/20 border-y border-chrome/20">
134: <div className="flex justify-between border-t border-chrome/20 pt-2 font-label text-[0.7rem] uppercase tracking-lockup text-forest">
```

## app\admin\consultations\[id]\page.jsx
```
17: .filter((p) => p.active !== false && p.stock_status !== 'discontinued')
24: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
```

## app\account\login\page.jsx
```
27: <Suspense fallback={<div className="h-64 max-w-md border border-border" aria-hidden="true" />}>
```

## app\account\reset\page.jsx
```
21: <Suspense fallback={<div className="h-64 max-w-md border border-border" aria-hidden="true" />}>
```

## components\Accordion.jsx
```
13: <div className="divide-y divide-border">
28: className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-ink sm:py-6"
35: className={`flex size-7 shrink-0 items-center justify-center border border-border text-sm text-muted transition-transform duration-300 ${
36: isOpen ? 'rotate-45 border-ink/40 text-ink' : ''
```

## components\AddRoutineKit.jsx
```
27: disabled={status === 'adding' || !productIds.length}
28: className="btn-primary mt-6 w-full min-h-[44px] px-6 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup disabled:opacity-60 sm:w-auto"
```

## components\AddToCart.jsx
```
19: const discontinued = product.stock_status === 'discontinued' || product.active === false;
74: className={`cursor-pointer border px-5 py-3 font-label text-[0.68rem] font-light uppercase tracking-lockup transition-colors ${
76: ? 'border-graphite bg-graphite text-pearl'
77: : 'border-graphite/25 text-charcoal hover:border-graphite/60'
104: <p className="border border-chrome/30 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-chrome">
113: disabled={needsVariant && !variant}
114: aria-disabled={needsVariant && !variant}
115: className="btn-primary w-full min-h-[48px] px-8 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
128: className="inline-flex min-h-[44px] items-center justify-center border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60 sm:w-auto"
```

## components\AidesignerRuntime.jsx
```
4: * Noise Shimmer runtime intentionally disabled — third-party hero effects
```

## components\AmbientGlow.jsx
```
6: * Cursor-reactive ambient glow.
11: * Work is throttled to one write per animation frame and coalesced, and the
24: const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
38: el.dataset.active = 'true';
49: el.dataset.active = 'false';
```

## components\AnnouncementBar.jsx
```
36: className="hidden font-label text-[0.62rem] font-medium uppercase tracking-lockup text-muted underline-offset-2 hover:text-pink-bright hover:underline sm:inline"
```

## components\BookingFlow.jsx
```
240: className="mt-8 max-w-lg space-y-3 border border-chrome/20 bg-pearl/40 p-5"
255: Note any new actives, prescriptions, or reactions since your last visit so Emily can
272: className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
278: className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
284: className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
314: className="mt-8 border border-chrome/30 bg-pearl/60 p-5"
327: className="mt-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
369: className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
380: className="mt-10 border border-chrome/20 bg-pearl/40 p-6"
392: <div className="mt-10 border border-chrome/30 bg-pearl/60 p-6" role="alert">
404: className="sweep border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
410: className="sweep border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
417: <div className="mt-10 border border-chrome/20 bg-pearl/40 p-6" role="status">
432: className="sweep border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl"
438: className="sweep border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
465: const active = slot === iso;
471: aria-pressed={active}
472: className={`min-h-[44px] border px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup transition-colors ${
473: active
474: ? 'border-graphite bg-graphite text-pearl'
475: : 'border-graphite/25 text-charcoal hover:border-graphite/60'
490: disabled={!slot || slotsLoading || slotsLoadFailed}
492: className="sweep mt-12 min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-40"
510: disabled={status === 'loading'}
511: className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal disabled:opacity-40"
544: disabled={status === 'loading'}
547: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
553: <div className="border border-chrome/25 bg-pearl/40 p-5">
571: Calendar live sync is separate and only active once credentials are connected.
575: <div className="border border-chrome/30 bg-pearl/70 p-4" role="alert">
594: className="mt-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
604: disabled={status === 'loading' || submitting.current}
605: className="sweep w-full min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
```

## components\CardTilt.jsx
```
11: * This is a single listener mounted once in the layout: it finds the hovered
19: const activeRef = useRef(null);
26: const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
47: if (el !== activeRef.current) {
48: clear(activeRef.current);
49: activeRef.current = el;
70: clear(activeRef.current);
71: activeRef.current = null;
79: clear(activeRef.current);
```

## components\CartConfirmation.jsx
```
95: <div className="border border-chrome/30 bg-pearl/60 p-5">
140: className="mt-8 max-w-lg space-y-4 border border-chrome/20 bg-pearl/40 p-5 sm:p-6"
179: className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
185: className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
194: className="sweep border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl"
201: className="sweep border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
```

## components\CartView.jsx
```
115: // Empty field while typing — wait for blur; treat 0 as remove
143: document.getElementById(`guest-${first}`)?.focus();
322: <ul className="order-last min-w-0 divide-y divide-chrome/20 border-y border-chrome/20 lg:order-first">
352: className="break-words font-display text-lg font-normal text-graphite hover:underline sm:text-xl"
380: className="w-16 border border-chrome/30 bg-pearl/80 px-2 py-2 text-center font-body text-sm font-light text-charcoal"
385: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
416: <div className="flex justify-between gap-4 border-t border-chrome/20 pt-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-graphite">
438: disabled={codeLoading || checkoutLoading}
439: className="min-w-0 flex-1 border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light uppercase tracking-wide2 text-charcoal disabled:opacity-60"
443: disabled={codeLoading || !codeInput.trim() || checkoutLoading}
444: className="min-h-[44px] border border-graphite/25 px-4 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60 disabled:opacity-40"
453: className="mt-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
460: className="mt-2 border border-chrome/25 bg-pearl/60 px-3 py-2 font-body text-xs font-light text-charcoal/75"
471: className="mt-10 space-y-4 border-t border-chrome/20 pt-8"
492: disabled={checkoutLoading}
495: className={`w-full bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60 ${
496: invalid ? 'border border-promo/45' : 'border border-chrome/30'
523: disabled={checkoutLoading}
527: className="mt-2 w-full resize-y border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
537: className="border border-chrome/30 bg-pearl/70 p-4"
559: disabled={checkoutLoading || !items.length}
560: className="sweep w-full min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60"
566: <ul className="space-y-2.5 border border-chrome/20 bg-pearl/40 px-4 py-4">
621: <div className="mt-5 border-t border-chrome/15 pt-4">
636: <div className="mt-16 border-t border-chrome/15 pt-14" data-reveal-group="cart-routine">
```

## components\CategoryNav.jsx
```
62: className={`whitespace-nowrap px-3 py-3 font-label text-[0.62rem] font-normal uppercase tracking-lockup transition-colors xl:px-3.5 ${
63: current ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/5 hover:text-white'
```

## components\CategoryProductCarousel.jsx
```
202: reduceMotion ? 'transition-none' : 'transition-[transform,opacity] duration-500 ease-out'
222: return { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 };
226: return { transform: 'translateX(-95%) scale(0.88)', opacity: 0.72, zIndex: 2 };
228: return { transform: 'translateX(-20%) scale(1)', opacity: 1, zIndex: 3 };
232: return { transform: 'translateX(-115%) scale(0.88)', opacity: 0.72, zIndex: 2 };
234: return { transform: 'translateX(15%) scale(0.88)', opacity: 0.72, zIndex: 2 };
237: return { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 };
```

## components\CompleteRoutine.jsx
```
11: * Consolidates EmilyPairsWith sequence blurbs + routine complements into one block.
31: // Prefer sequence blurbs when available; otherwise fall back to complement cards.
39: className="mt-16 border-t border-border pt-12"
59: {pairs.map(({ product: p, step, blurb }) => (
63: className="group flex h-full gap-4 rounded-[2px] border border-border bg-white p-4 transition-[border-color,box-shadow] hover:border-ink/30 hover:shadow-card"
77: <p className="mt-1 font-display text-lg font-normal text-ink group-hover:text-charcoal">
81: {blurb}
104: className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
```

## components\Concierge.jsx
```
67: buttonRef.current?.focus();
90: 'fixed bottom-[5.5rem] right-4 z-40 transition-opacity duration-300 lg:bottom-8 lg:right-8 ' +
91: (visible || open ? 'opacity-100' : 'pointer-events-none opacity-0')
101: className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[8px] border border-border bg-white shadow-[0_24px_60px_-32px_rgba(30,43,34,0.5)]"
114: <ul className="divide-y divide-border">
120: className="group flex min-h-[56px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ivory"
135: className="text-muted transition-transform group-hover:translate-x-0.5"
151: className="btn-primary inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-3 font-label text-[0.62rem] font-normal uppercase tracking-lockup shadow-[0_14px_34px_-18px_rgba(30,43,34,0.65)]"
```

## components\ContactForm.jsx
```
50: <ol className="mt-6 space-y-2 border border-chrome/20 bg-pearl/40 p-4">
61: className="mt-8 font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
83: disabled={loading}
86: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
100: disabled={loading}
103: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
115: disabled={loading}
118: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
137: disabled={loading}
140: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal disabled:opacity-60"
144: <div className="border border-chrome/30 bg-pearl/70 p-4" role="alert">
155: disabled={loading}
156: className="sweep min-h-[48px] border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:cursor-not-allowed disabled:opacity-60"
```

## components\EmilyNote.jsx
```
21: className={`border border-border bg-sage-soft/40 px-4 py-4 sm:px-5 ${className}`.trim()}
43: className={`border border-border bg-surface-light px-4 py-4 sm:px-5 ${className}`.trim()}
70: return 'Seal water-based layers. If you are using actives, moisturizer comes after — not before.';
72: return 'Use after cleanse to prep absorption. Keep the rest of the routine gentle if your barrier feels reactive.';
```

## components\EmilyPairsWith.jsx
```
21: <section className="mt-16 border-t border-chrome/15 pt-14" aria-labelledby="emily-pairs-heading">
36: {pairs.map(({ product: p, step, blurb }) => (
40: className="group flex h-full gap-4 rounded-[2px] border border-chrome/15 bg-surface p-4 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
54: <p className="mt-1 font-display text-lg font-normal text-graphite group-hover:text-charcoal">
58: {blurb}
72: className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
```

## components\Footer.jsx
```
87: className="font-body text-[0.9rem] font-normal text-muted transition-colors duration-200 hover:text-ink"
98: <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
```

## components\FreeShippingMeter.jsx
```
22: className={`border border-border bg-surface-light p-4 ${className}`.trim()}
36: className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
48: className={`h-full rounded-full transition-[width] duration-500 ease-out ${
```

## components\GlobalSearch.jsx
```
25: const [activeIndex, setActiveIndex] = useState(-1);
61: if (autoFocus) inputRef.current?.focus();
68: inputRef.current?.blur();
92: const target = activeIndex >= 0 ? flat[activeIndex] : flat[0];
120: aria-activedescendant={
121: activeIndex >= 0 && flat[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined
133: className="w-full rounded-[2px] border border-border bg-surface-light py-2.5 pl-9 pr-3 font-body text-sm text-ink placeholder:text-muted/80 focus:border-ink focus:bg-white focus:outline-none"
142: className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[60] max-h-[min(70vh,28rem)] overflow-y-auto rounded-[2px] border border-border bg-white shadow-card-hover"
160: <div key={group} className="border-b border-border last:border-0">
167: const active = idx === activeIndex;
174: aria-selected={active}
177: className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors ${
178: active ? 'bg-dew-soft' : 'hover:bg-surface-light'
196: <div className="border-t border-border px-4 py-2.5">
200: className="font-label text-[0.62rem] uppercase tracking-lockup text-ink underline-offset-2 hover:underline"
```

## components\Hero.jsx
```
15: * restrained refraction field (light through glass, not a gradient panel).
19: * MotionRoot only when motion is enabled), so with JS disabled or
32: root.querySelectorAll('[data-reveal-blur]').forEach((el) => {
43: // transition runs — otherwise the browser collapses both states into a
44: // single paint and the blur-to-sharp never renders.
59: className="relative isolate overflow-hidden border-b border-border bg-void"
63: bloom behind the bottle, and a soft shadow beneath it. Decorative. */}
72: className="hero-art__shadow"
77: className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent to-void"
85: data-reveal-blur
86: className="reveal-blur font-body text-micro font-medium uppercase tracking-eyebrow text-muted"
93: data-reveal-blur
94: style={{ transitionDelay: '80ms' }}
95: className="reveal-blur block text-[clamp(2.6rem,6.2vw,5.25rem)] uppercase"
100: data-reveal-blur
101: style={{ transitionDelay: '180ms' }}
102: className="reveal-blur block text-[clamp(2.6rem,6.2vw,5.25rem)] uppercase"
109: data-reveal-blur
110: style={{ transitionDelay: '280ms' }}
111: className="reveal-blur mt-6 max-w-md font-body text-[0.74rem] font-medium uppercase leading-[1.85] tracking-[0.1em] text-muted"
117: data-reveal-blur
118: style={{ transitionDelay: '380ms' }}
119: className="reveal-blur mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
156: data-reveal-blur
157: style={{ transitionDelay: '520ms' }}
158: className="reveal-blur mt-6 flex w-full items-baseline justify-between gap-4 border-t border-hairline pt-4 transition-opacity hover:opacity-70"
```

## components\Icons.jsx
```
9: * Every icon is decorative by default (`aria-hidden`). Interactive elements
21: focusable: 'false'
```

## components\IntakeForm.jsx
```
200: 'mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40';
591: <div className="border border-chrome/20 bg-pearl/40 px-4 py-4">
638: disabled={submitting}
639: className="sweep btn-primary min-h-[44px] w-full px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:opacity-60 sm:w-auto"
```

## components\KeyActives.jsx
```
2: * Key actives list — renders only catalog-provided name/function pairs.
6: actives = [],
8: heading = 'Key actives',
11: const list = Array.isArray(actives) ? actives.filter((a) => a?.name) : [];
```

## components\LegalDocLinks.jsx
```
24: className="text-ink underline underline-offset-2 hover:text-dew focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
41: className="text-dew underline underline-offset-2 hover:text-dew-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
```

## components\LegalPageShell.jsx
```
50: className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## components\LegalPdfActions.jsx
```
21: className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew underline-offset-4 hover:text-dew-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
29: className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-ink/70 underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
38: className="font-label text-[0.66rem] font-normal uppercase tracking-lockup text-ink/70 underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dew"
```

## components\MembershipInterestForm.jsx
```
59: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
75: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
85: disabled={status === 'loading'}
86: className="sweep btn-primary min-h-[44px] px-8 py-3 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:opacity-60"
```

## components\MotionRoot.jsx
```
29: * Nav frost + IntersectionObserver scroll reveals (CSS transitions only).
111: * [data-reveal] is `opacity: 0`, a missed callback ships invisible content —
```

## components\Nav.jsx
```
18: * Existing behaviour is preserved: accessible mobile drawer with focus trap and
87: firstLinkRef.current.focus();
105: menuBtnRef.current?.focus();
109: const focusable = panelRef.current.querySelectorAll(
110: 'a[href], button:not([disabled]), input'
112: if (!focusable.length) return;
113: const first = focusable[0];
114: const last = focusable[focusable.length - 1];
115: if (e.shiftKey && document.activeElement === first) {
117: last.focus();
118: } else if (!e.shiftKey && document.activeElement === last) {
120: first.focus();
151: className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
153: ? 'border-b border-border bg-void/90 backdrop-blur-xl supports-[backdrop-filter]:bg-void/75'
154: : 'border-b border-transparent bg-transparent'
161: className="nav-logo relative flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
186: className="nav-link relative whitespace-nowrap font-label text-[0.62rem] font-medium uppercase tracking-lockup text-ink transition-opacity duration-200 hover:opacity-70 xl:text-[0.68rem]"
203: className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
211: className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60 sm:inline-flex"
219: className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
239: className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60 lg:hidden"
251: <div id="site-search" className="border-t border-border bg-void px-5 py-4 sm:px-6 lg:px-10">
253: <Suspense fallback={<div className="h-12 border-b border-border" />}>
266: className="max-h-[min(100dvh-5rem,42rem)] overflow-y-auto overscroll-contain border-b border-border bg-void lg:hidden"
276: className="border-b border-border py-4 font-display text-[1.5rem] font-normal leading-none text-ink"
290: className="border-b border-border py-3 font-body text-sm text-charcoal last:border-0"
```

## components\PageShell.jsx
```
21: <header className="border-b border-border">
```

## components\PdpMediaStage.jsx
```
39: el.style.setProperty('--stage-shadow', (0.35 + p * 0.4).toFixed(3));
```

## components\PdpMobilePurchaseBar.jsx
```
17: const discontinued = product?.stock_status === 'discontinued' || product?.active === false;
38: className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-18px_rgba(30,43,34,0.25)] backdrop-blur-md lg:hidden"
61: disabled={oos}
63: className="btn-primary shrink-0 px-5 py-3 font-label text-[0.62rem] uppercase tracking-lockup disabled:cursor-not-allowed disabled:opacity-45"
```

## components\ProductCard.jsx
```
12: * product — not the frame — is the object. On hover the hairline turns pink, the
17: * This stays a server component: the only interactive node is the add-to-bag
54: className="product-card card-edge group flex h-full flex-col overflow-hidden rounded-card border bg-surface"
58: className="flex flex-1 flex-col focus-visible:outline-none"
60: <div className={`relative bg-void ${oos ? 'opacity-55' : ''}`}>
72: <span className="absolute left-3 top-3 z-[2] border border-border bg-void/85 px-2.5 py-1 font-body text-[0.55rem] font-medium uppercase tracking-eyebrow text-ink backdrop-blur-sm">
84: <span className="absolute bottom-3 left-3 z-[2] border border-pink/40 bg-void/85 px-2.5 py-1 font-body text-[0.5rem] font-medium uppercase tracking-eyebrow text-pink-bright backdrop-blur-sm">
119: <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3.5">
```

## components\ProductGallery.jsx
```
38: const [active, setActive] = useState(0);
42: const current = images[Math.min(active, Math.max(n - 1, 0))] || productImageSrc(product);
47: const activeAlt = documentPanel ? documentPanelAlt(product) : alt;
73: className={`relative overflow-hidden rounded-[2px] border border-border ${
81: alt={activeAlt}
86: priority={priority && active === 0}
90: <img src={current} alt={activeAlt} className="h-full w-full object-cover" />
96: className="absolute left-2 top-1/2 z-[2] -translate-y-1/2 border border-border bg-white/90 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-ink"
104: className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 border border-border bg-white/90 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-ink"
116: const selected = i === active;
124: className={`relative overflow-hidden rounded-[2px] border ${
125: selected ? 'border-ink' : 'border-border'
144: Image {active + 1} of {n}
```

## components\ProductImage.jsx
```
36: } ${framed ? 'rounded-[2px] border border-chrome/15 bg-surface' : 'bg-pearl'} ${className}`}
41: className="absolute inset-0 bg-gradient-to-b from-pearl via-ivory/80 to-pearl"
```

## components\ProductRail.jsx
```
37: * bar that reports real scroll position rather than a decorative animation.
75: const arrowClass = (disabled) =>
76: `inline-flex h-11 w-11 items-center justify-center border transition-colors duration-200 ${
77: disabled
78: ? 'cursor-not-allowed border-border text-muted/40'
79: : 'border-border text-ink hover:border-pink hover:text-pink-bright'
93: disabled={atStart}
102: disabled={atEnd}
129: <div className="mt-4 h-px w-full bg-border" aria-hidden="true">
131: className="block h-px bg-pink transition-[width] duration-200 ease-out"
```

## components\QuickAdd.jsx
```
18: const discontinued = product?.stock_status === 'discontinued' || product?.active === false;
42: disabled={oos}
54: className="btn-primary w-full px-3 py-2.5 font-body text-[0.62rem] font-medium uppercase tracking-lockup transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
```

## components\RoutineBuilder.jsx
```
15: * Interactive AM/PM routine builder — catalog products only.
86: className="inline-flex rounded-[2px] border border-border bg-white p-1"
103: className={`min-h-[44px] px-6 py-2.5 font-label text-[0.68rem] font-normal uppercase tracking-lockup transition-colors ${
106: : 'text-muted hover:text-ink'
122: className="overflow-hidden rounded-[2px] border border-border bg-white"
130: : 'border border-border text-muted'
180: disabled={!options.length}
189: className="min-h-[44px] px-4 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
198: <div className="border-t border-border bg-dew-surface px-4 py-4 sm:px-6">
205: className={`flex gap-3 rounded-[2px] border p-3 text-left transition-colors ${
207: ? 'border-dew bg-white'
208: : 'border-border bg-white hover:border-dew/40'
237: <div className="mt-10 flex flex-col gap-6 rounded-card border border-border bg-surface-light p-8 sm:flex-row sm:items-center sm:justify-between">
256: disabled={!selectedProducts.length || status === 'adding'}
257: className="min-h-[48px] border border-white/30 bg-white px-8 py-3.5 font-label text-[0.68rem] font-normal uppercase tracking-lockup text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
267: className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew-soft hover:text-white"
```

## components\RoutinePlacement.jsx
```
23: className={`mt-16 border-t border-border pt-12 ${className}`}
49: ? 'flex min-h-[48px] min-w-[7.5rem] flex-col justify-center border border-pink/50 bg-pink-wash px-3 py-2'
50: : 'flex min-h-[48px] min-w-[7.5rem] flex-col justify-center border border-border px-3 py-2'
```

## components\RoutinePosition.jsx
```
11: const activeCategory = product.category;
12: const inOrder = ROUTINE_ORDER.includes(activeCategory);
16: className={`border border-border bg-white px-4 py-5 sm:px-5 ${className}`.trim()}
41: const active = cat === activeCategory;
46: className={`inline-flex rounded-[2px] border px-2.5 py-1.5 font-label text-[0.55rem] uppercase tracking-lockup transition-colors ${
47: active
48: ? 'border-ink bg-ink text-ivory'
49: : 'border-border bg-surface-light text-muted hover:border-ink/40 hover:text-ink'
51: aria-current={active ? 'step' : undefined}
```

## components\Rule.jsx
```
11: className="h-px w-8 shrink-0 bg-current opacity-45 sm:w-16"
```

## components\ScrollTop.jsx
```
21: className="fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-4 z-30 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center border border-chrome/25 bg-surface/95 font-label text-[0.58rem] font-normal uppercase tracking-lockup text-charcoal shadow-card transition-opacity hover:border-graphite/40 lg:bottom-8 lg:right-8"
```

## components\SearchResults.jsx
```
30: <form action="/search" method="get" role="search" className="border-b border-border pb-4">
40: className="w-full border-0 bg-transparent py-3 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-normal text-ink placeholder:text-muted/70 focus-visible:outline-none"
61: <div className="mt-10 border-t border-border pt-10">
64: Try a product name, an active, or a concern such as dehydration, congestion or uneven
89: <ul className="mt-5 border-t border-border">
91: <li key={item.id} className="border-b border-border">
94: className="flex flex-col gap-1 py-5 transition-opacity hover:opacity-70 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
112: <div className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
121: className="border border-hairline px-6 py-5 font-body text-[0.7rem] font-medium uppercase tracking-lockup text-ink transition-colors hover:bg-surface"
```

## components\ShopGrid.jsx
```
30: className="mt-6 rounded-[2px] border border-border bg-white p-10 text-center sm:mt-8"
90: const activeCount = countActiveFilters(state) + (q ? 1 : 0);
113: * Price is committed on blur or Enter rather than on every keystroke — a
141: <div className="rounded-[2px] border border-border bg-white p-10 text-center" role="status">
152: <div className="rounded-[2px] border border-border bg-white p-10 text-center" role="status">
155: All listed items are currently discontinued or inactive.
308: if (e.key === 'Enter') e.currentTarget.blur();
310: className="min-h-[44px] w-20 border border-border bg-transparent px-3 py-2 font-body text-sm text-ink"
326: if (e.key === 'Enter') e.currentTarget.blur();
328: className="min-h-[44px] w-20 border border-border bg-transparent px-3 py-2 font-body text-sm text-ink"
371: <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
374: {activeCount ? ` · ${activeCount} filter${activeCount === 1 ? '' : 's'}` : ''}
383: Filter{activeCount ? ` (${activeCount})` : ''}
392: className="min-h-[40px] rounded-[2px] border border-border bg-white px-3 py-2 font-body text-sm text-ink"
411: className="inline-flex items-center gap-2 rounded-full border border-dew/30 bg-dew-soft px-3 py-1.5 font-label text-[0.58rem] uppercase tracking-lockup text-dew-dark"
421: className="font-label text-[0.58rem] uppercase tracking-lockup text-muted underline-offset-2 hover:text-ink hover:underline"
432: {activeCount > 0 ? (
436: className="mt-8 font-label text-[0.62rem] uppercase tracking-lockup text-dew underline-offset-2 hover:underline"
469: <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[8px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card-hover">
```

## components\SkinQuiz.jsx
```
86: className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
87: i < step ? 'bg-dew' : i === step ? 'bg-dew/60' : 'bg-border'
123: className={`group flex min-h-[72px] w-full flex-col items-start rounded-[3px] border px-5 py-5 text-left transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6 ${
125: ? 'border-dew bg-dew text-white shadow-card'
126: : 'border-border bg-white text-ink shadow-card hover:-translate-y-0.5 hover:border-dew/50 hover:shadow-card-hover'
161: disabled={step === 0}
162: className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-ink/70 transition-colors hover:text-ink disabled:opacity-30"
202: className="rounded-[3px] border border-promo/25 bg-promo/5 px-5 py-4 font-body text-sm font-normal leading-relaxed text-ink/85"
216: <div className="mt-12 flex flex-col gap-6 rounded-[3px] border border-border bg-white p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
237: className="inline-flex min-h-[44px] items-center font-label text-[0.66rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
249: <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-8">
253: className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-ink/70 hover:text-ink"
259: className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-muted hover:text-ink"
281: className="group flex gap-4 rounded-[3px] border border-border bg-white p-4 transition-shadow hover:shadow-card-hover sm:gap-5 sm:p-5"
295: <p className="mt-1 font-display text-lg font-normal text-ink group-hover:text-ink/80 sm:text-xl">
```

## components\StickyCtaBar.jsx
```
26: className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-18px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden"
```

## components\Stub.jsx
```
18: className="sweep inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
```

## components\TextFilterList.jsx
```
41: <div className="border-b border-border pb-4">
50: className="w-full border-0 bg-transparent py-3 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-normal text-ink placeholder:text-muted/70 focus-visible:outline-none"
61: <ul className="mt-6 border-t border-border">
63: <li key={it.key} className="border-b border-border">
70: className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-ink"
```

## components\TrustStrip.jsx
```
9: * Facts: Skin Script professional actives, virtual consult with Emily, $49 / $7 shipping.
13: id: 'actives',
15: body: 'Professional actives for home — the same line Emily uses in treatment.'
27: className={`grid gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-3 ${className}`.trim()}
```

## components\VirtualConsultationCheckout.jsx
```
78: disabled={loading}
81: className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40 disabled:cursor-not-allowed disabled:opacity-60"
98: disabled={loading}
101: className="mt-2 w-full border border-chrome/25 bg-pearl/60 px-4 py-3 font-body text-sm font-light text-charcoal outline-none focus:border-graphite/40 disabled:cursor-not-allowed disabled:opacity-60"
105: <div className="border border-chrome/20 bg-pearl/40 px-4 py-4">
117: className={`flex items-start gap-3 ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
122: disabled={loading}
135: <ul className="mt-6 space-y-2.5 border border-chrome/20 bg-pearl/40 px-4 py-4">
158: <div className="mt-5 border border-chrome/30 bg-pearl/70 p-4" role="alert">
170: disabled={!canSubmit}
171: className="sweep btn-primary mt-8 w-full min-h-[48px] px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup disabled:cursor-not-allowed disabled:opacity-50"
```

## components\admin\AdminLoginForm.jsx
```
61: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
78: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
98: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light tracking-[0.2em] text-charcoal"
113: disabled={loading}
114: className="w-full border border-graphite bg-graphite px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
```

## components\admin\AdminNav.jsx
```
30: const active = item.exact
33: return active
35: : 'text-forest/80 hover:bg-sage/20 hover:text-forest';
42: className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-sage-deep/25 font-label text-[0.62rem] uppercase tracking-lockup text-forest lg:hidden"
71: className="w-full rounded-sm px-3 py-2.5 text-left font-label text-[0.64rem] font-light uppercase tracking-lockup text-muted hover:text-forest lg:w-auto"
```

## components\admin\AdminPageHeader.jsx
```
11: <header className="mb-8 border-b border-sage-deep/15 pb-6">
30: className="mt-4 flex flex-wrap gap-2 rounded-sm border border-sage-deep/20 bg-ivory/80 px-4 py-3 font-label text-[0.62rem] uppercase tracking-lockup text-forest"
33: <span>RPA {automation.rpaEnabled ? 'enabled' : 'disabled'}</span>
```

## components\admin\AdminShell.jsx
```
20: <header className="border-b border-sage-deep/15 bg-ivory/90 backdrop-blur-sm">
```

## components\admin\AppointmentStatusForm.jsx
```
56: disabled={terminal}
57: className="border border-chrome/30 bg-pearl/90 px-2 py-2 font-body text-xs font-light disabled:opacity-60"
69: disabled={loading || terminal || status === current}
70: className="border border-graphite/25 px-3 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-50"
```

## components\admin\CatalogSyncPanel.jsx
```
109: <tr key={row.product_id} className="border-t border-chrome/15">
112: <td className="py-2">{row.sync_enabled ? 'enabled' : 'disabled'}</td>
133: className="mt-2 block w-full max-w-xs border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light text-charcoal"
145: disabled={loading}
147: className="border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
153: disabled={loading}
155: className="border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
168: <div className="mt-8 space-y-4 border-t border-chrome/20 pt-6">
```

## components\admin\ConsultationDetail.jsx
```
88: className="mt-1 block border border-chrome/30 bg-pearl px-3 py-2 text-sm"
101: disabled={busy}
103: className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup text-pearl"
114: className="mt-1 w-full border border-chrome/30 bg-pearl px-3 py-2 text-sm"
122: disabled={busy || !note.trim()}
127: className="mt-2 border border-chrome/40 px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
133: <ul className="space-y-2 border-t border-chrome/15 pt-4">
220: className="mt-1 w-full border border-chrome/30 bg-pearl px-3 py-2 text-sm"
233: <div key={i} className="mt-3 grid gap-2 border-t border-chrome/10 pt-3 sm:grid-cols-2">
235: className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
259: className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
268: className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
283: className="border border-chrome/30 bg-pearl px-2 py-2 text-sm"
319: disabled={busy}
321: className="border border-chrome/40 px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup"
327: disabled={busy}
329: className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.62rem] uppercase tracking-lockup text-pearl"
```

## components\admin\CsvImport.jsx
```
137: className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-2 py-2 font-body text-sm font-light"
153: <div className="glass-1 border border-chrome/30 p-5" role="status">
176: <tr className="border-b border-chrome/25 font-label text-[0.6rem] font-light uppercase tracking-lockup text-chrome">
185: <tr key={p.id + i} className="border-b border-chrome/15 font-body font-light">
197: className="w-24 border border-chrome/30 px-2 py-1"
209: disabled={loading}
210: className="border border-graphite/30 px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
217: disabled={loading}
218: className="border border-graphite bg-graphite px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
```

## components\admin\DiscountManager.jsx
```
59: async function toggle(id, active) {
64: body: JSON.stringify({ active: !active })
69: setMsg(data.discount.active ? 'Activated' : 'Deactivated');
115: className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light uppercase"
121: className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
133: className="border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
140: className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
147: className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
154: className="w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
168: disabled={loading}
169: className="border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
175: <ul className="divide-y divide-chrome/20 border-y border-chrome/20">
189: {c.active ? 'active' : 'inactive'}
212: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
218: onClick={() => toggle(c.id, c.active)}
219: className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
221: {c.active ? 'Deactivate' : 'Activate'}
226: <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-chrome/15 pt-3">
235: className="mt-1 block w-24 border border-chrome/30 bg-pearl/90 px-2 py-2"
246: className="mt-1 block w-24 border border-chrome/30 bg-pearl/90 px-2 py-2"
251: disabled={loading}
253: className="border border-graphite bg-graphite px-4 py-2 font-label text-[0.6rem] font-light uppercase tracking-lockup text-pearl"
```

## components\admin\ManualFulfillmentPanel.jsx
```
22: <div className="flex flex-wrap items-start justify-between gap-2 border-b border-chrome/15 py-2">
30: disabled={text === '—'}
31: className="shrink-0 rounded-sm border border-sage-deep/25 px-2 py-1 font-label text-[0.58rem] uppercase tracking-lockup text-forest disabled:opacity-40"
117: <ul className="mt-2 divide-y divide-chrome/15 border-y border-chrome/15">
142: className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
153: className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
163: className="mt-1 w-full border border-chrome/30 bg-pearl/90 px-3 py-2 font-body text-sm"
174: disabled={Boolean(loading)}
176: className="rounded-sm border border-forest bg-forest px-4 py-2.5 font-label text-[0.62rem] uppercase tracking-lockup text-ivory disabled:opacity-60"
```

## components\admin\MetricCard.jsx
```
5: <div className={`glass-1 p-5 ${href ? 'transition hover:border-sage-deep/40' : ''} ${className}`}>
```

## components\admin\OrderStatusForm.jsx
```
91: className="mt-4 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
101: disabled={loading}
102: className="mt-4 border border-graphite bg-graphite px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
129: disabled={fulfilling}
131: className="mt-4 border border-graphite/25 px-6 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
```

## components\admin\ProductForm.jsx
```
25: active: product?.active !== false
53: active: Boolean(form.active),
106: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
127: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
144: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
159: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
172: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
188: className="mt-2 w-full border border-chrome/30 bg-pearl/90 px-3 py-3 font-body text-sm font-light"
202: checked={form.active}
203: onChange={(e) => setField('active', e.target.checked)}
218: disabled={loading}
219: className="border border-graphite bg-graphite px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-pearl disabled:opacity-60"
227: disabled={loading}
228: className="border border-chrome/40 px-8 py-3 font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal disabled:opacity-60"
```

## components\admin\ProductStockToggle.jsx
```
8: export default function ProductStockToggle({ productId, stockStatus, active }) {
27: disabled={loading}
29: className="border border-chrome/30 bg-pearl/90 px-2 py-1.5 font-body text-xs font-light"
41: checked={active !== false}
42: disabled={loading}
43: onChange={(e) => patch({ active: e.target.checked })}
```

## components\admin\SystemStatusBadge.jsx
```
4: healthy: 'bg-sage/25 text-forest border-sage-deep/30',
5: attention: 'bg-stone/80 text-forest border-sage-deep/20',
6: degraded: 'bg-stone text-forest border-promo/30',
7: critical: 'bg-promo/15 text-forest border-promo/40',
8: disabled: 'bg-stone/50 text-muted border-chrome/30',
9: not_configured: 'bg-ivory text-muted border-chrome/25',
10: unknown: 'bg-stone/40 text-muted border-chrome/25'
19: className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-label text-[0.58rem] font-light uppercase tracking-lockup ${style} ${className}`}
```

## components\consultation\Questionnaire.jsx
```
18: 'group relative flex min-h-[6.25rem] w-full items-center justify-center border px-5 py-5 text-center transition-colors duration-200 focus-visible:outline-none lg:min-h-[6.75rem]';
106: className="h-px bg-ink transition-[width] duration-500"
142: ? 'border-ink bg-[rgba(201,183,154,0.16)]'
143: : 'border-hairline bg-surface/70 hover:border-ink/50')
174: disabled={!hydrated || selectedList.length === 0}
175: className="btn-primary inline-flex min-h-[56px] items-center justify-center gap-3 px-10 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed sm:min-w-[16rem]"
```

## components\customer\AccountAuthForms.jsx
```
14: 'mt-2 w-full border border-border bg-surface px-4 py-3 font-body text-[0.95rem] text-ink placeholder:text-muted/60 focus-visible:outline-none';
16: const SEG_ON = 'min-h-[48px] flex-1 px-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup transition-colors bg-ink text-void';
17: const SEG_OFF = 'min-h-[48px] flex-1 px-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup transition-colors bg-transparent text-ink hover:bg-surface';
104: <div role="group" aria-label="Account action" className="flex border border-border">
186: <p role="alert" className="mt-6 border-l-2 border-promo pl-4 font-body text-[0.9rem] text-promo">
192: <p role="status" className="mt-6 border-l-2 border-ink pl-4 font-body text-[0.9rem] text-ink">
199: disabled={busy}
200: className="btn-primary mt-8 inline-flex min-h-[54px] w-full items-center justify-center px-8 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
208: <Link href="/shop" className="underline decoration-border underline-offset-4 hover:decoration-ink">
214: className="underline decoration-border underline-offset-4 hover:decoration-ink"
```

## components\customer\FavoriteToggle.jsx
```
59: disabled={busy}
62: className="inline-flex min-h-[44px] items-center gap-2 border border-border px-4 font-body text-[0.66rem] font-medium uppercase tracking-lockup text-ink transition-colors hover:border-ink disabled:cursor-not-allowed"
```

## components\customer\ResetPasswordForm.jsx
```
8: 'mt-2 w-full border border-border bg-surface px-4 py-3 font-body text-[0.95rem] text-ink focus-visible:outline-none';
57: <div className="max-w-md border border-border p-8">
104: <p role="alert" className="mt-6 border-l-2 border-promo pl-4 font-body text-[0.9rem] text-promo">
111: disabled={busy}
112: className="btn-primary mt-8 inline-flex min-h-[54px] w-full items-center justify-center px-8 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
```

## components\customer\SignOutButton.jsx
```
26: disabled={busy}
27: className="btn-ghost inline-flex min-h-[48px] items-center px-7 py-3 font-body text-[0.66rem] font-medium uppercase tracking-lockup disabled:cursor-not-allowed"
```

## components\home\BestSellers.jsx
```
18: className="border-b border-border bg-ivory py-16 sm:py-20"
38: className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
```

## components\home\ConcernTiles.jsx
```
23: label: 'Sensitive + Reactive',
25: note: 'Calm first, actives second'
36: <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="concern-heading">
47: Start with how your skin feels today — then browse Skin Script actives matched to that
57: className="group flex h-full flex-col border border-border bg-white p-5 transition-colors hover:border-forest hover:bg-sage/20 sm:p-6"
59: <p className="font-display text-xl leading-snug text-forest group-hover:text-sage-deep">
```

## components\home\ConsultPromo.jsx
```
9: className="border-b border-border bg-forest text-ivory py-14 sm:py-16"
32: className="inline-flex min-h-[48px] items-center justify-center border border-ivory/40 bg-transparent px-9 py-4 font-label text-[0.72rem] uppercase tracking-lockup text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
37: Prefer to browse first? Shop Skin Script actives anytime — free shipping at $49+.
```

## components\home\DewEdit.jsx
```
10: body: 'Thin to thick keeps actives where they belong. Cleanser first, SPF last by day.',
16: body: 'More is not better. Space acids so the barrier can keep up — especially if you are reactive.',
28: body: 'Serums deliver targeted actives. Moisturizers seal and support. Most plans need both roles.',
47: <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="edit-heading">
64: className="font-label text-[0.65rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
75: className="group flex h-full flex-col border border-border bg-white p-6 transition-colors hover:border-forest hover:bg-sage/15"
77: <h3 className="font-display text-xl text-forest group-hover:text-sage-deep">
```

## components\home\Education.jsx
```
6: title: 'The order that makes actives work',
33: <section className="border-b border-border bg-ivory" aria-labelledby="education">
51: className="group flex flex-col justify-between border border-border bg-white p-7 transition-colors hover:border-sage-deep"
```

## components\home\FeaturedProductStory.jsx
```
29: className="spectral-field border-b border-border"
44: className="object-contain drop-shadow-[0_30px_48px_rgba(30,43,34,0.20)]"
72: className="border border-border bg-white/70 px-3 py-1.5 font-label text-[0.55rem] font-normal uppercase tracking-lockup text-muted"
```

## components\home\FinalConsultationCta.jsx
```
11: className="flex flex-col items-start justify-between gap-8 border border-border bg-white p-8 sm:p-10 lg:flex-row lg:items-center"
37: className="inline-flex min-h-[44px] items-center justify-center px-4 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink/70 hover:text-ink"
```

## components\home\HowConsultationWorks.jsx
```
27: <section className="border-b border-border bg-ivory" aria-labelledby="how-consultation-works">
41: className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
47: <ol className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
```

## components\home\MeetEmily.jsx
```
9: <section id="about" className="border-b border-border bg-surface-light" aria-labelledby="meet-emily">
22: actives — the same line she uses in treatment — and helps clients build calm,
38: className="inline-flex min-h-[44px] items-center font-label text-[0.65rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
48: className="relative hidden aspect-[4/5] max-w-sm overflow-hidden bg-gradient-to-br from-ivory via-sage-soft to-sage-surface lg:block"
```

## components\home\NewsletterSignup.jsx
```
9: <section className="section-stone border-b border-border py-14 sm:py-16" aria-labelledby="touch-heading">
```

## components\home\PersonalizationHub.jsx
```
32: body: 'Bring your questions to a focused one-on-one review and get a morning and evening plan written for your skin.',
42: className="border-b border-border bg-ivory"
64: className="mt-10 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3"
91: className="transition-transform group-hover:translate-x-1"
```

## components\home\PhilosophyBand.jsx
```
6: <section className="section-sage border-b border-border py-16 sm:py-20" aria-labelledby="philosophy-heading">
20: Professional actives, sequenced with care. Look at the barrier first. Change one
```

## components\home\QuizPromo.jsx
```
8: <section className="border-b border-border bg-stone/50 py-14 sm:py-16" aria-labelledby="quiz-heading">
39: <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-border bg-border" data-reveal>
```

## components\home\RoutineJourney.jsx
```
5: { id: 'treat', label: 'Treat', hint: 'Targeted actives' },
12: * Interactive routine journey visual — links to /routine.
16: <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="journey-heading">
48: className="group flex h-full flex-col border border-border bg-white p-5 transition-colors hover:border-forest hover:bg-stone/40 sm:p-6"
53: <span className="mt-3 font-display text-2xl text-forest group-hover:text-sage-deep">
```

## components\home\ShopByConcern.jsx
```
16: * the bottom on hover, and an arrow that slides. The grid arrives as one
17: * horizontal clip-path wipe — a different transition from the hero's blur.
44: <section className="border-b border-border bg-void" aria-labelledby="shop-by-goal">
58: <ul className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
69: {family.blurb}
71: <span className="mt-8 inline-flex items-center gap-2 font-body text-[0.65rem] font-medium uppercase tracking-eyebrow text-muted transition-colors duration-300">
```

## components\home\WaysToStart.jsx
```
9: <section className="border-b border-border bg-ivory" aria-labelledby="ways-to-start">
35: A focused skin review with Emily by Zoom, then a personalized morning and evening
39: <span className="mt-8 inline-flex items-center gap-2 font-label text-[0.65rem] font-medium uppercase tracking-lockup text-ink transition-colors group-hover:text-pink-bright">
49: className="flex min-h-[22rem] flex-col justify-between border border-border bg-white p-7 text-forest sm:p-9"
69: <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
75: className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew hover:text-dew-dark"
```

## lib\appointment-status.js
```
6: * Terminal states have no further transitions.
76: error: `Cannot transition from "${current}" to "${next}"`,
77: code: 'status_transition_invalid',
```

## lib\catalog-sync.js
```
52: key_actives: draft.key_actives || [],
57: active: draft.active !== false,
84: active: draft.active !== false,
96: Boolean(existing.active) === Boolean(next.active)
166: reason: 'sync_disabled',
241: key_actives: match.key_actives,
258: active: validated.product.active
352: key_actives: row.product.key_actives || [],
```

## lib\checkout.js
```
65: if (product.active === false || product.stock_status === 'discontinued') {
```

## lib\concerns.js
```
19: blurb:
32: blurb: 'Dullness, patchiness and the pigment that lingers after everything else has settled.',
38: blurb: 'Water loss, tightness and the absorption problem that follows a tired barrier.',
42: 'dryness from active ingredients',
47: slug: 'sensitive-reactive',
49: blurb: 'Reactivity, flushing and a barrier that needs less, not more.',
55: blurb: 'Texture and expression lines, addressed early rather than aggressively.',
61: blurb: 'Chapping, vertical lines and the thin skin that shows dehydration first.',
67: blurb: 'The step that protects every result the rest of the routine earns.',
```

## lib\consultation-questions.js
```
25: { value: 'sensitive-reactive', label: 'Sensitivity' },
44: prompt: 'How does your skin usually react to a new active?',
51: { value: 'unsure', label: 'I have not used actives yet' }
62: { value: 'actives', label: 'Serum or treatment' },
177: out.add('sensitive-reactive');
```

## lib\csv-import.js
```
21: ingredients: ['ingredients', 'key_actives', 'actives'],
111: key_actives: row[map.ingredients]
120: active: true
```

## lib\discounts.js
```
10: * @param {{ type: 'percentage'|'fixed', value: number, active?: boolean, code?: string } | null} code
14: if (!code || code.active === false) {
39: * Checks active, expires_at, max_uses — pure function for unit tests.
58: return { ok: false, error: 'Code not found or inactive', code: 'discount_not_found' };
61: if (match.active === false) {
62: return { ok: false, error: 'Code not found or inactive', code: 'discount_inactive' };
87: active: match.active !== false,
```

## lib\email.js
```
157: '• Note any new actives, prescriptions, or reactions since your last visit.',
```

## lib\journal.js
```
25: dek: 'The sequence matters more than the shelf. Thinnest to thickest, water before oil, actives where they can actually work.',
40: 'Serum or treatment — this is where actives live, on clean skin, closest to the surface.',
41: 'Moisturiser — to hold water in and support the barrier the actives just worked on.',
52: p: 'Two habits cause most of the trouble. The first is layering several actives at once and then treating the resulting irritation as a reason to add a soothing product — which is a third layer on a problem caused by the first two. The second is skipping moisturiser because a serum "already feels like enough". A serum is a treatment; it is not a barrier.'
55: p: 'If you are rebuilding a routine, start with the boring parts — cleanse, moisturise, protect — and add one active at a time.'
60: slug: 'introducing-an-active',
63: title: 'Introducing an active without wrecking your barrier',
67: p: 'A new active rarely fails because the percentage was too low. It fails because it was introduced every day, alongside two other new things, on skin that had no chance to adapt.'
96: p: 'When something goes wrong, the fix is almost always subtraction: remove the new active, keep the barrier steps, and wait. Adding products to calm a reaction you caused with products is how a two-step problem becomes a six-step routine.'
```

## lib\product-admin.js
```
100: const active = b.active !== false && b.active !== 'false' && b.active !== 0;
112: key_actives: Array.isArray(b.key_actives) ? b.key_actives : b.key_actives || [],
117: active,
```

## lib\product-image.js
```
58: * noir background key cannot separate panel from background without blackening
61: * text so a screen reader is not told they show a black studio background.
93: * with a synthesised warm contact shadow, for the pearl/ivory editorial system
```

## lib\routine-kits.js
```
24: 'A brightening serum path with daily SPF when the barrier is ready for actives.',
43: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
```

## lib\routine.js
```
75: * @param {Array<{ id: string, category?: string, active?: boolean, stock_status?: string }>} products
83: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
113: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
```

## lib\search.js
```
120: const actives = Array.isArray(p.key_actives)
121: ? p.key_actives.map((a) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
135: ...actives,
```

## lib\services.js
```
57: 'No treatment — a read only. Barrier, actives, order of operations. Applied toward a facial booked the same day.',
```

## lib\shop-filters.js
```
115: * Human label for the price filter's active chip.
296: * Count active filter dimensions (excludes sort).
```

## lib\shop.js
```
8: if (product.active === false) return false;
```

## lib\skin-quiz.js
```
15: 'This quiz builds a simple home sequence from our Skin Script collection. It is not a medical diagnosis. Sensitive, reactive, or medical skin conditions deserve an in-person or virtual read with Emily.';
56: { value: 'sensitive', label: 'Easily reactive', hint: 'Redness, sting, heat' }
63: subtitle: 'One primary focus keeps the routine simple — Emily’s rule.',
91: value: 'active',
92: label: 'Ready for actives',
152: } else if (pace === 'steady' || pace === 'active') {
179: // —— Mandelic (actives) — careful gates ——
181: pace === 'active' ||
192: (concern === 'aging' && pace === 'active');
195: // Prefer PM for actives; AM only if not teen/sensitive
205: 'Teen skin: actives are optional. If anything stings or peels, pause and keep cleanse → hydrate → moisturize → SPF.'
235: if (isMature || isDry || concern === 'aging' || pace === 'active') {
263: headline = 'Soften, seal, protect — then decide on actives.';
265: 'Reactive skin is not “difficult.” It is informative. We listen before we polish.';
294: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
367: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
413: blurb: pairBlurb(product, s.p)
430: if (a === 'Exfoliant' && b === 'SPF') return 'Morning SPF is required on days you use brightening actives.';
433: if (b === 'Mask') return 'Use the mask on quieter nights when you are not pushing strong actives.';
447: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
473: ((p) => p && p.active !== false && p.stock_status !== 'discontinued');
```

## lib\skin-script-discount-guard.js
```
20: if (!discount || discount.active === false) return { ok: true };
```

## lib\spectral.js
```
15: blurb: 'Quench tightness and flaking without heaviness.',
16: accent: '#4F8583',
17: soft: '#E4EFEE',
19: 'rgba(143, 185, 184, 0.34)',
20: 'rgba(185, 169, 214, 0.22)',
21: 'rgba(237, 237, 230, 0.9)'
26: 'dryness from active ingredients',
33: blurb: 'Calm reactive, easily irritated skin.',
34: accent: '#55755D',
35: soft: '#E5EEE7',
37: 'rgba(143, 174, 150, 0.32)',
38: 'rgba(214, 196, 154, 0.22)',
39: 'rgba(237, 237, 230, 0.9)'
46: blurb: 'Even out tone and lift a flat-looking surface.',
47: accent: '#B47F5E',
48: soft: '#F6E7DD',
50: 'rgba(226, 182, 154, 0.34)',
51: 'rgba(216, 175, 168, 0.24)',
52: 'rgba(214, 196, 154, 0.2)'
59: blurb: 'Clear buildup, congestion, and excess oil.',
60: accent: '#4F8583',
61: soft: '#E4EFEE',
63: 'rgba(143, 185, 184, 0.32)',
64: 'rgba(143, 174, 150, 0.22)',
65: 'rgba(237, 237, 230, 0.9)'
78: blurb: 'Support for fine lines and early signs of aging.',
79: accent: '#7A6AA6',
80: soft: '#EEE9F6',
82: 'rgba(185, 169, 214, 0.32)',
83: 'rgba(216, 175, 168, 0.22)',
84: 'rgba(237, 237, 230, 0.9)'
91: blurb: 'Close every morning routine with mineral SPF.',
92: accent: '#A38F5F',
93: soft: '#F2ECDA',
95: 'rgba(214, 196, 154, 0.36)',
96: 'rgba(143, 185, 184, 0.18)',
97: 'rgba(237, 237, 230, 0.9)'
108: accent: '#7A6AA6',
109: soft: '#EEE9F6',
111: 'rgba(185, 169, 214, 0.32)',
112: 'rgba(143, 185, 184, 0.24)',
113: 'rgba(237, 237, 230, 0.9)'
119: accent: '#A8756D',
120: soft: '#F3E6E3',
122: 'rgba(216, 175, 168, 0.32)',
123: 'rgba(226, 182, 154, 0.24)',
124: 'rgba(237, 237, 230, 0.9)'
130: accent: '#55755D',
131: soft: '#E5EEE7',
133: 'rgba(143, 174, 150, 0.32)',
134: 'rgba(216, 175, 168, 0.22)',
135: 'rgba(237, 237, 230, 0.9)'
141: accent: '#5B7356',
142: soft: '#E4E8E0',
144: 'rgba(147, 168, 144, 0.28)',
145: 'rgba(214, 196, 154, 0.22)',
146: 'rgba(237, 237, 230, 0.9)'
152: accent: '#A38F5F',
153: soft: '#F2ECDA',
155: 'rgba(214, 196, 154, 0.36)',
156: 'rgba(143, 185, 184, 0.18)',
157: 'rgba(237, 237, 230, 0.9)'
166: accent: '#5A655C',
167: soft: '#E5E2D9',
169: 'rgba(147, 168, 144, 0.22)',
170: 'rgba(214, 196, 154, 0.16)',
171: 'rgba(237, 237, 230, 0.9)'
228: * lives in the label, blurb, and catalog concern (real data); the *material* is
232: * as the accent dot, the hairline, and the hover wash.
237: * pearl, and the washes are reflected light (champagne / ice) at low opacity.
242: accent: '#141412',
243: soft: '#F4F2ED',
244: wash: ['rgba(201, 183, 154, 0.18)', 'rgba(198, 211, 216, 0.14)', 'rgba(237, 235, 230, 0)']
```

## lib\store.js
```
34: active: p.active !== false
100: active: true,
```

## lib\admin\dashboard.js
```
39: const catalog = readStore().products?.filter((p) => p.active !== false) || [];
45: activeProductCount: catalog.length,
```

## lib\admin\metrics.js
```
22: const mappings = await commerceListSupplierMappings({ activeOnly: false });
24: const catalog = readStore().products?.filter((p) => p.active !== false) || [];
25: const activeProducts = catalog.length;
32: if (activeProducts > 0 && verified < activeProducts) {
50: catalogProductCount: activeProducts,
116: const mappings = await commerceListSupplierMappings({ activeOnly: true });
117: const catalog = readStore().products?.filter((p) => p.active !== false) || [];
130: activeProducts: catalog.length,
```

## lib\admin\status.js
```
8: DISABLED: 'disabled',
18: disabled: 'Disabled',
31: disabled: 1,
```

## lib\ai\map-catalog-rows.js
```
30: active: r.active !== false,
```

## lib\commerce\d1-backend.js
```
70: active INTEGER NOT NULL DEFAULT 1,
358: async listSupplierMappings({ activeOnly = true } = {}) {
360: const sql = activeOnly
361: ? 'SELECT * FROM supplier_mappings WHERE active = 1'
374: supplier_size, variant, expected_wholesale_price, verified, verified_at, active, updated_at
385: active=excluded.active,
398: mapping.active === false ? 0 : 1,
```

## lib\commerce\file-backend.js
```
221: async listSupplierMappings({ activeOnly = true } = {}) {
223: return Object.values(db.supplier_mappings).filter((m) => !activeOnly || m.active !== 0);
```

## lib\customers\auth.js
```
66: * Returns null whenever anything is missing, expired, malformed or non-active —
75: if (!customer || customer.status !== 'active') return null;
105: if (!customer || customer.status !== 'active') {
122: if (!customer || customer.status !== 'active') {
139: if (!customer || customer.status !== 'active') {
```

## lib\customers\schema.js
```
25: status TEXT NOT NULL DEFAULT 'active',
```

## lib\customers\store.js
```
167: export async function createCustomer({ email, name, passwordHash, status = 'active' }) {
```

## lib\dropship\fulfill-order.js
```
355: return { ok: false, skipped: true, code: 'auto_fulfill_disabled' };
```

## lib\fulfillment\state-machine.js
```
124: const err = new Error(`Invalid fulfillment transition ${from} → ${to}`);
125: err.code = 'invalid_state_transition';
```

## lib\suppliers\types.js
```
17: * @property {Array} [key_actives]
21: * @property {boolean} [active]
```

## lib\suppliers\skin-script\csv-feed-adapter.js
```
43: key_actives: [],
47: active: row.active !== false && row.active !== 'false' && row.active !== '0',
```

## lib\suppliers\skin-script\mapping.js
```
17: if (row && row.active !== 0 && row.verified === 1) {
34: active: row.active !== 0
54: if (!mapping || mapping.active === 0) {
120: active: 1
137: active: mapping.active === false ? 0 : 1
```

## lib\suppliers\skin-script\mock-adapter.js
```
28: key_actives: p.key_actives || [],
32: active: p.active !== false,
```

## lib\suppliers\skin-script\rpa-adapter.js
```
71: const err = new Error('SKIN_SCRIPT_RPA_ENABLED is false — kill switch active');
72: err.code = 'rpa_disabled';
```