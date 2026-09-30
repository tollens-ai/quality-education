The selected take has **62 sung phrases, 31 couplets and 397 timed display words**. Caption text
matches its embedded lyrics. The three refrains contain the same six phrases, and the
breakdown contains eight. The captions restore the episode sheet's punctuation and use
“Connect once more: still gone? Explore!” as requested. Each occurrence of “second-guess”
is one display word with one interval; splitting the compounds yields 400 lexical components.

The supplied generation brief describes a 1930s Broadway comic song with brushed drums,
walking bass, piano, muted brass and clarinet, a nimble baritenor opening and a spacious refrain.
That description is the brief, not a verified instrumental transcription. This report uses
signal measurements, speech models and visual inspection of vocal spectrograms. It contains
no claimed human listening review or audio-model description.

The measured quarter-note pulse is **98.936 BPM**, with a median beat of 0.606451 seconds
and a median 4/4 bar of 2.425802 seconds. The nominal 132 BPM in the brief does not describe
this performance's detected pulse. There are 305 pulse positions and 77 indexed bars.
The pulse tracker was run on combined mix, bass and drum onset envelopes, then locally
smoothed across 17 beats. Median and 90th-percentile differences between its raw and smoothed
positions are 6.5 and 19.9 ms; these measure tracker jitter, not absolute timing accuracy.

The 4/4 grouping follows the musical direction. Bar phase is inferred from instrumental
accents: the chosen phase scores 1.715 against 1.615 for the phase two beats away.
The quarter pulses have stronger support than the exact bar numbering. Beats inside rests
and the quiet final tail are tracker interpolations. A constant pulse starting at the first
beat drifts from the measured positions by −0.422 to +0.517 seconds across the take.
Animation should follow the explicit beat events for time-local accents.

The container duration is **185.232 seconds**; the decoded mix is 185.200 seconds.
The renderer timeline is **193.232 seconds**, including the eight-second end card.
Stem separation added a 23.039 ms delay relative to the decoded mix, measured by correlation
between the mix and the sum of the separated stems. Vocal estimates, transient events and
stem curves were corrected by that amount.

| Sung section | First word | Vocal end | Mean mix frame level |
|---|---:|---:|---:|
| Opening | 3.030 | 14.507 | −31.6 dBFS |
| Verse 1 | 15.314 | 44.046 | −25.3 dBFS |
| Refrain 1 | 44.054 | 60.610 | −21.9 dBFS |
| Verse 2 | 63.826 | 82.992 | −23.3 dBFS |
| Refrain 2 | 83.000 | 99.161 | −20.8 dBFS |
| Bridge | 99.958 | 131.524 | −23.0 dBFS |
| Breakdown | 131.828 | 151.882 | −21.9 dBFS |
| Refrain 3 | 153.745 | 170.951 | −19.4 dBFS |
| Outro | 171.334 | 183.989 | −21.6 dBFS |

The quiet prelude ends at the first word at 3.030. The interlude after the first refrain runs
60.610–63.826. The instrumental tag runs 183.989–185.232; the end card runs
185.232–193.232. Section boundaries follow sung phrases; instrumental gaps are separate
entries in the song map. Couplets preserve two phrase rows and their original ordering.

Word onsets use two torchaudio forced aligners: MMS_FA and the English wav2vec2
large LV-60k model. Each line was aligned with its neighbours on the separated vocal at
normal speed and at 0.8 and 0.65 playback rates, with pitch retained. A normal-speed
full-mix pass supplied two further estimates. All 397 words have all eight estimates.
The median estimate is checked against nearby vocal-energy onsets. Normal-speed consensus
is retained where slowing smears a boundary and the normal-speed models agree.

Across all words, the median interquartile spread of those estimates is **21.5 ms**;
the 90th percentile is **39.2 ms**. Four words exceed 120 ms. These agreement figures
are confidence indicators, not proof of millisecond precision. Typical onset uncertainty
remains about 50–100 ms, with greater uncertainty at connected vowels and very short words.

| Difficult boundary | Retained onset | Review |
|---|---:|---|
| “I” in “I aim to pass” | 40.900 | Normal-speed consensus; connected vowels limit visual certainty. |
| “aim” | 41.117 | Normal-speed consensus; slower MMS estimates spread into “I”. |
| First refrain's final “it” | 46.168 | Short vowel between “test” and the measured silence. |
| Final “Who sees the logs?” | 174.544 | Clear vocal onset after silence; slower MMS estimates fell in the preceding “net” tail. |

Phrase tails use the separated voice's energy decay, with harmonic traces inspected for the
long holds. “Seen!” lasts **10.638–14.507** and the final “yet” lasts
**179.968–183.989**. Speech transcription cuts these holds short. Stem leakage and reverb
can soften an endpoint, so phrase tails have roughly 0.1–0.2 seconds of uncertainty.
Between connected words, the following word's onset provides a stable interval boundary;
measured gaps remain gaps.

Independent medium.en transcriptions were run on the full mix and on the vocal stem.
The mix matches 397 of 400 lyric components and substitutes “calls” for “cause”,
“drama's” for “dramas”, and “flag's” for “flags”. The stem matches 390 of 400 and has
additional omissions and substitutions. These are ASR disagreements; the exported words
follow the selected take's supplied lyric text. Matched ASR starts are approximately 62 ms
early against the final mix-timeline estimates, with a 181 ms 90th-percentile absolute gap.

[audio.json](audio.json) contains exact 20 Hz, 50 ms RMS dBFS curves for the mix and four estimated
stems, plus weighted spectral-flux transient events. Its 398 drum, 253 bass, 263 other and
595 vocal events are acoustic peaks, not individually identified instruments or syllables.
Separation leakage limits their interpretation. The mean frame levels in the table are
arithmetic means of dB values, not integrated loudness measurements.

Mechanical verification passes: exact lyric coverage against embedded metadata; 62 matching
SRT blocks; every word has a finite, positive, non-overlapping interval; strictly increasing
onsets; three identical refrains; the eight-phrase breakdown; 31 couplets; matching audio and
film durations; and a full-timeline 50 ms sweep through the shared stage. A 30 fps
frame-floor render contains 5,796 frames and runs 193.200 seconds.
