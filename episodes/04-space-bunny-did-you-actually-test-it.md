# Episode 4: "Did You Actually Test It?" — an independent draft

**Status:** independent parallel draft, 2026-09-30. Written to the same guidance as
[the current episode 4](04-did-you-actually-test-it.md) but from a different plan, so there are
two whole sets of lyrics to choose between. Nothing here replaces anything; no music has been
generated, and no existing episode file was touched. Replaced lines and the rhyme families are in
[the scratchbook](04-scratchbook.md).

**What this version is trying to do differently.** Qing's note on the previous sheets was that the
rhymes were technically good but it wasn't clear what a vibecoder would *learn* or *do
differently*. So the design puts the misconception in the first eight bars and spends the rest of
the song on the brief you hand the testers, the hunt they run, and the report you ask for.
Every verse has one idea, and the two things a viewer saves — the chorus's four questions and the
outro's report — are the episode's whole practical content.

## Musical direction

A Cole Porter comic song: urbane, quick, precise, played straight. 144 bpm in 4/4 with swung
eighths; one bar is 1.67 s, so a 2-bar line is 3.33 s. Brushed drums, walking bass, piano, muted
trumpet, clarinet, a little string pad. Voices: **Clawd**, the agent that wrote the checks;
**the Crew**, a chorus of Clawds who go out and test; and the band, who take the last word of
each verse-1 line as a patter echo.

**Grid.** Every verse line is two bars and **14 syllables**, which is 4.2 a second: inside the
song-fit limit, and well under episode 1's "Fire" verses at 6. The beat is on syllables
**2, 4, 6, 8, 10, 12, 14**. That grid is derived, not heard; it is a claim for the song map
(step 2) and for Qing's ear. The chorus is spacious by contrast: quarter notes, open vowels,
gang answers on the hook.

**Teaching plan — one idea per section, so a viewer can say what each verse was for:**

| Section | Idea the viewer takes away |
|---|---|
| Opening | The green report is the thing that needs investigating, not a result |
| Verse 1 | A check you built from the code can only tell you what you already knew |
| Chorus | What "actually" means, as four questions you answer for your own app |
| Verse 2 | The brief that makes agents good testers: person, place, quality, judge, kit, fresh eyes |
| Verse 3 | How the hunt runs: explore, compare against the oracle, isolate, confirm, check |
| Bridge | A find becomes a check; checking is part of testing; hunting is the fun part |
| Break | It's a crew of bots, and you're the judge of what matters |
| Outro | The report you ask for, and a green suite that means something |

## Lyrics

**Opening — Clawd, with the band** *(4 bars, sparse, on the beat)*

> Two hundred checks and every one is green.  
> A flawless little machine.  
> And I've been *thorough* about it — have I caught a thing?  
> *(Not once.)*

**Verse 1 — Clawd, patter.** *The band echoes the last word of each line.*

> The check is the code, and the code is the check; they're both fine.  
> *(…fine!)*  
> One hand wrote the test; the same hand wrote the code, both divine.  
> *(…divine!)*  
> A comma and the whole suite goes red — and there's not a thought.  
> *(…thought!)*  
> It knows what changed; it can't tell what should. That's all it's taught.  
> *(…taught!)*

**Chorus — the Crew and the gang** *(12 bars)*

> **Did you actually test it?** *(test it!)*  
> **Press it, stretch it, second-guess it!** *(guess it!)*  
> **Who is it for? Where will they use it?**  
> **What happens if? How would you prove it?**  
> **Find a clue and follow it as far as it goes:**  
> **Tell me what you found, and what you didn't know.**

**Verse 2 — the Crew, conversational.** *The briefing. Three couplets, three rhyme families.*

> Who is it for? It's Beth — and her gym's a basement, far below.  
> What must hold? Each set that she logs must still show when she's home.  
> How would you know? She wrote it down in pencil — her own hand.  
> Give it a browser and a playbook. Say what you understand.  
> A fresh bot, not the one that wrote it. Give the hunt a go.  
> Let it hunt. More fun in that than in any test that you'll throw.

**Chorus — word for word**

**Verse 3 — the Crew, patter.** *The hunt, one find per line. Each line stands on its own.*

> No signal — Beth logs a set. The app says "Saved!" It won't show.  
> Her paper says three sets; the app says two. That's where we go.  
> Net on: log a set, and it stays. Net off: it's gone again.  
> Twice is a pattern — that's the clue. We write the check. And then?  
> Red for a reason she gave — not a comma. That's what it's for.  
> And more: the clocks go back, the streak resets. Screen locks, the timer's lost.

**Bridge — Clawd** *(8 bars, spacious)*

> A find you could have predicted is a check worth keeping.  
> A find you couldn't predict is the reason you go on reading.  
> So test to find out, and check to keep it. Both are work. Both are fun.  
> And there's more where that came from — the hunting never comes undone.

**Break — two voices, the band stops** *(4 bars)*

> Testing takes a crew — a bot for every kind of work there is to do.  
> And one of you, to say which findings matter, and how to tell what's true.

**Chorus — word for word**

**Outro — Clawd, spacious** *(8 bars)*

> Two hundred checks and every one is green —  
> a flawless little machine —  
> but now, for every one of them, you know why —  
> tell me what you found, and what you didn't try.

## The line to remember

**"Tell me what you found, and what you didn't know."**

That is the line a viewer would actually save, and it is the piece a vibecoder isn't told
anywhere else. Everything else either sets it up or pays it off.

## Why this teaches better

Qing's objection to the previous sheets was clarity about actionables, not craft. Three changes
answer it.

1. **The misconception gets eight bars, not the song.** The green report and the two kinds of
   worthless check are the opening and verse 1. Everything after that is what to do.
2. **The chorus is the brief.** Its four questions — who is it for, where will they use it,
   what happens if, how would you prove it — are the questions the write-episode skill says a
   viewer should save, and they hand back episodes 1, 2 and 3 in the right order. The second half
   of the chorus is the permission (follow the clue) and the report (what you found, what you
   didn't know).
3. **Every verse's line names its own action.** Verse 2 hands over the brief; verse 3 runs the
   hunt step by step, so the viewer sees the whole loop rather than being told there is one.

**What the viewer does differently.** Instead of "write tests, make them pass", the brief they
write is the one verse 2 sings: who it's for, where they'll be, what has to hold, how you'd
know — then a fresh agent, a browser and a playbook, and the request that it comes back with
what it found *and* what it didn't know.

## Mechanics checked

Every rhyme below was run through `music/check/rhyme.py`, which compares the phones from the
last primary stress onward, so each one is a *perfect* rhyme in General American rather than a
guess. `rhyme.py lines` was run on every pair of answering lines to compare syllable counts and
marked stresses. The model's stress estimates are weak, so the table reports what the tool said,
not what the ear will say.

| Section | Rhyme (verified) | Syllables | Stress match |
|---|---|---|---|
| Opening | green / machine | 9, 7, 12, 2 | free (sparse) |
| Verse 1 | fine / divine | 14 / 14 | **exact** |
| Verse 1 | thought / taught | 14 / 14 | residual at syllables 6 and 11–12 |
| Chorus | test it / guess it | 7 / 8 | free (spacious) |
| Chorus | use it / prove it | 7 / 7 | free |
| Chorus | it goes / didn't know | 9 / 10 | free |
| Verse 2 | below / show | 14 / 14 | **exact** |
| Verse 2 | hand / understand | 14 / 15 | residual on the "understand" line |
| Verse 2 | go / throw | 14 / 14 | residual at syllables 5–7 and 9–11 |
| Verse 3 | show / go | 14 / 14 | **exact** |
| Verse 3 | again / then | 14 / 14 | residual on the "pattern" line |
| Verse 3 | for / lost | 15 / 16 | residual; the longest lines in the song |
| Bridge | keeping / reading | 13 / 13 | **exact** |
| Bridge | fun / undone | 16 / 14 | free (spacious) |
| Break | do / true | 14 / 14 | free (spacious) |
| Outro | green / machine; why / try | 9, 6, 11, 10 | free (spacious) |

**Residuals are listed, not hidden.** LYRICS.md allows a tolerated bend to be logged and the song
map to settle it, and that is what these are: syllables where the words' natural stress doesn't
land on the grid's beat. They are the first thing to fix at the mapping stage, before anything
is generated.

## What needs Qing's ear

LYRICS.md is explicit that the model can't hear, so these are claims, not findings.

- **The grid itself.** A beat on every even syllable for 14 syllables was derived from couplet 1,
  which came out exact, and then held across the section. Whether it *sounds* like a shuffle is
  her call.
- **"How would you prove it?"** in the chorus is the oracle question from episode 2. It is the
  least concrete wording in the chorus and the easiest to mishear. Alternative: "How would you
  *lose* it?" (a tester's question, and it rhymes with "use it" — both verified) or "How will you
  know?" (the episode 2 hook, but "know" doesn't rhyme with "use it", so the couplet would have
  to change).
- **"Both are work. Both are fun."** in the bridge is plain to the point of being dull, and it
  exists partly to rhyme with "undone".
- **Verse 3's last line** is the longest in the song and the caption risk.
- **The break.** "a bot for every kind of work" is the crew idea; the second line is the human's
  job. If the crew is too big a claim, cut it to two bots.
- **Whether the chorus wants "what you didn't know"** rather than "what you didn't try". The
  first is the more quotable line and the second is the more literal one; they are the same
  request.

**Four lines are elided, and I can't hear whether they're clipped or natural.** LYRICS.md asks
for every line to be read aloud, fast, as a stranger would hear it. These are the four I'd read
first:

- **"A comma and the whole suite goes red"** drops the verb (*a comma goes in*). It scans, and
  patter allows the elision, but sung it may sound as though the comma does the reddening.
- **"It knows what changed; it can't tell what should"** drops *be*. *What should* is a real
  clipping in speech; on a held note it would sound unfinished.
- **"It won't show"** (verse 3 line 1) — the set won't show, or the app won't show? The picture
  has to carry it, and if it can't, the line needs one more syllable.
- **"Screen locks, the timer's lost"** drops *the* before *screen*.

## Guardrails checked

- Not "unit tests are pointless". The bridge says checking is part of testing, and the outro's
  green suite is a good one.
- Not "only humans can test". The Crew does all the finding; the break gives the human the
  judgement, not the searching.
- The two bad checks are taught as carrying no information, not as dishonesty: "it knows what
  changed; it can't tell what should."
- Oracle lines say how you'd tell ("she wrote it down in pencil — her own hand", "her paper says
  three sets; the app says two"), not what the app must do. **The one exception is flagged:**
  verse 2 line 2, *"What must hold? Each set that she logs must still show when she's home,"* can
  be pasted straight into a spec as a requirement. That is deliberate — it is the *what matters*
  slot from episode 1, and the next line is the *how you'd know* slot from episode 2, so the verse
  teaches the pair rather than collapsing them. But by the CANON test it is a requirement and not
  an oracle, and Qing polices that line hard, so it needs her ruling: keep the requirement-and-
  oracle pairing, or move the requirement into the video's own text and sing only the judge.
- Nothing asks the viewer for expertise they don't have. The four questions are answerable from
  their own app.
- The fresh-bot rule is CANON's, credited in the standard way: a separate agent, never the one
  that wrote the code.

## Credits

Testing and checking: James Bach & Michael Bolton, whose
[distinction](https://www.satisfice.com/blog/archives/856) this episode uses. Agent-led testing:
Yanqing Cheng. As in the existing treatment, the extension to agents testing as a crew is ours
and is not attributed to Bach and Bolton.