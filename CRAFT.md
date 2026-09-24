# Video craft brief

Research pass 2026-09-24. Learning-science findings are the strongest evidence; X-specific numbers
come from marketers and are weak.

## Principles
1. **Misconception first, then refute it.** Muller (Veritasium PhD): clear explanations raised
   confidence but not learning; stating then refuting the wrong belief produced learning.
2. **Concrete before abstract** (Sanderson/3B1B). The green tick on a broken app before "Goodhart".
3. **Sound-off first.** X autoplays muted; captions are the primary track. Captions = narration;
   other on-screen text limited to highlighted keywords (resolves Mayer's redundancy principle).
4. **First frame is the hook and the thumbnail.** Tension, not a title card.
5. **Retention is the constraint, not idea count** (Qing 2026-09-24: more than one idea is fine if
   people keep watching for both). Short is still the default — Guo/Kim/Rubin 2014 (edX): shorter,
   faster, more enthusiastic held better; Fireship "100 seconds" is the dev-audience benchmark. A
   second idea needs its own hook: a new open loop before the first one closes.
6. **Fixed internal structure** per episode: misconception → concrete failure → concept named →
   what you'd say to your agent.
7. **Fixed visual vocabulary:** one glyph/colour per concept, stable across the series.
8. **Standalone episodes, continuity via running app + recurring characters.**
9. **In-group texture:** real-looking agent screens ("✅ All tests pass", "I've fixed the issue!").
10. **Design for replies:** close on a debatable question; author replies (X ranking weighted replies
    far above watch time in the 2023 release; current weights are learned and unpublished).
11. **Format:** master 9:16, responsive layouts so 16:9 and 1:1 render from the same source; keep
    bottom ~400px and right ~140px clear of UI. Clean per-platform exports, no watermarks.

## Sources
Muller thesis notes: https://www.bobvanvliet.com/notes/designing-effective-multimedia-for-physics-education/
Guo, Kim & Rubin 2014: https://dl.acm.org/doi/10.1145/2556325.2566239
Mayer 2021: https://www.sciencedirect.com/science/article/abs/pii/S2211368121000231
X 2023 ranking weights: https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md
X vertical player: https://wersm.com/x-goes-all-in-on-vertical-video-with-a-new-immersive-player/
Fireship format: https://read.engineerscodex.com/p/how-fireship-became-youtubes-favorite

## Open decisions
Aspect ratio master · voice (human / synthetic / text-only) · length cap · characters and running
app · visual vocabulary · how much episodes reference each other · episode order (foundation vs
strongest hook first) · takeaway format · success metric · toolchain (multi-aspect + burned captions).
