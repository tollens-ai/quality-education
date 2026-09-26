# Episode 1 video, v2: "The Mobile"

The second attempt at the video for "Good for Who?". The first is archived in
[archive/ep01-video-v1/](../archive/ep01-video-v1/README.md).

**Priorities** (CRAFT.md, "Decided"): teaching and beauty are both conditions for release, and
holding attention ranks below them.

## The idea

**A cut-paper music video, after Matisse's *Jazz* and Calder's mobiles.** Gouache-painted paper,
cut by hand with scissors and pinned to a warm white wall. The palette is Matisse blue, Calder
red, yellow and black, with Clawd's orange.

**The lesson is a mobile.** Quality is value to someone who matters, and a Calder mobile shows it
exactly:
- Every kind of "good" (fast, sturdy, cheap, wow, lasting) is a weight on the mobile.
- Adding one tips the others, so they're trade-offs, not a menu.
- Where the mobile comes to rest depends on who hangs at the other end.

Until someone says who it's for, the "who" plate is blank: the mobile hangs lopsided toward
"what", and its bars wander without settling. When a real person hangs there, the top bar levels
and each trade-off bar tilts toward what that person values. Chorus 2 cycles through the eight
people from verse 2, and each one tips the bars differently. In the final chorus, your answers
settle it.

**An art film, not a feed video.** The rules this version follows:
- **The camera is calm.** It holds still or drifts slowly. The objects move, not the camera, and
  scenes change with a hard cut on a downbeat.
- **One read at a time.** Each shot has a single subject.
- **No spoilers.** No word appears on screen before it's sung, and that includes labels on props.
- **The frames are beautiful to look at.** Paper grain, scissor edges and soft shadows, with shapes
  that hold steady from frame to frame instead of flickering.
- **The lyrics are cut-paper words,** big at the hooks and quiet elsewhere.

## Scenes

| Time | Section | Picture |
|---|---|---|
| 0:00 | Intro | A blue *Jazz* plate. A blank scrap is pinned up, and *make it good* writes itself in your handwriting as it's sung. Clawd, cut from orange paper with its eyes cut out as holes, stands beside its own sheet of orange paper and throws its arms up on "made it good!". |
| 0:04 | Verse 1 | One plate per line, each a plain little app buried under an orange over-build: confetti cannons firing stars and seaweed at a flossing checkbox; a padlock and chains on a gym log; helm wheels stacking up behind a tiny blog; twelve mini Clawds dancing a ring round a clock. |
| 0:15 | "Did I do it wrong?" | The bare wall. Clawd close up and worried, with the last confetti drifting down. |
| 0:17 | "quota's gone" | Clawd's sheet of orange paper, now lace: every build was cut from it. It unpins and falls. "Guess I didn't ask!": Clawd peeks over the lace, sheepish. |
| 0:21 | Pre-chorus | A huge ultramarine profile: your head, solid paper, with the lyrics inside it. Clawd holds up the scrap. On "prompt" the band stops and the scrap is all there is. |
| 0:27 | Chorus 1 | The mobile arrives plate by plate as each word is sung: a blank person on "who", a disc on "what", then one bar per trade-off. With no "who", it hangs lopsided and never settles. |
| 0:51 | Verse 2 | Eight people, each on their own colour plate, each with a small mobile tipped by the thing they value, labelled as it's sung. On the instrumental, all eight hang on the wall at once, with Clawd in the middle. |
| 1:16 | Pre-chorus 2 | The profile again, pushing in slightly. |
| 1:23 | Chorus 2 | The full mobile. Its "who" plate flips over to become each of the eight people in turn, and the bars rebalance for each. |
| 1:47 | Bridge | Night, in Matisse's *Icarus* palette: deep blue, yellow stars. Clawd on towers of other people's code (the training set). Paper planes thrown over a black wall. On "who it's for" the wall sinks and the eight people are there, lighting up in their colours. |
| 2:09 | Break | The definition pinned up word by word, the biggest type in the film, with a plain credit. "(matters, matters, matters)": the people pinned under it. "I'm someone too!": Clawd gets Icarus's red heart. "And me!": the other agents' official marks on white cards. "Debugging this with you": your blue hand and Clawd hold the scrap together. |
| 2:28 | Final pre-chorus | The plea: your hand takes the scrap, turns it over to the blank side, and a pen arrives. |
| 2:41 | Final chorus | Each question is answered on the card just after it's sung, while the mobile below takes the weights and comes to rest. The "who" plate flips to you, mid-set, labelled "me". |
| 3:05 | Outro | Summer: the wall warms and leaves blow through. Clawd joins in on "just a toy". On "gone" the last line is written, and the mobile blows away. The brief stays, centred, with Clawd and the sun. |

**Spoiler rule applied to the brief:** "fine if it's gone after summer" is written onto the scrap
only when the outro sings it, not in the final chorus.

## Liner notes

**What it is.** A 3:20 cut-paper music video, 1080×1920 at 30 fps. Every frame is drawn in code
(Canvas 2D, a pure function of the song's time) by Claude Opus; the code is in
`video/ep01/mobile/`. The song is our lyrics, sung by a MiniMax generation Qing chose.

**How it was checked.**
- **Truth:** a fresh fact-checker read the pictures, labels, weights and brief against CANON and
  the teaching plan's guardrails. It found no false claims. It did find that the mobile's weights
  were all pinned to the tilt limit, so the balance barely changed between people and never
  levelled out. The weights were redone: a real person now levels the top bar, a snappy demo and a
  group-chat bot let "fast" win, and a uni project is neutral between wow and keep.
- **Clarity and beauty:** a fresh viewer went through the whole preview at 2 frames a second and
  said, scene by scene, what they thought was happening. What changed as a result:
  - plates now grow and shrink with their weight, so the balance is visible
  - the mobile sways less once someone is chosen
  - the verse-2 recap is a line-up, not a grid of posters
  - wires and stars keep clear of the lyrics
  - backing vocals take their own line
  - a leaf swarm in the outro was cut
- **Spoilers:** no word appears on screen before it's sung. That includes the labels on plates.
  The brief's "fine if it's gone after summer" is written only when the outro sings it.

**Where it falls short.**
- **No human has watched it at speed yet.** The checks were models looking at frames. Motion
  comfort, timing and feeling need Qing's eye, and the model can't hear the song.
- **Clawd reads as a box, not a crab, to people who don't know the mascot.**
- **The other agents' marks are small and some won't be recognised.** Molty, Muse, Grok and the
  OpenAI Blossom are shown as provided, on plain cards.
- **The final chorus asks for two reads at once:** the sung question at the top and the answer
  being written below it.
- **It's long for X:** 3:20.
