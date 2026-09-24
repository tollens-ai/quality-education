# Episode 1 song map: "You Never Told Me"

The whole song as form, bars, chords and rhythm, worked out before any sound is generated so the
phrasing hangs together from start to finish (Qing, 2026-09-24: "you'll need to map out the full
song's rhythm and chord sequences before you can go into generation - we need coherent rhythmic
phrasing throughout"). The lyric sheet in [01-you-never-told-me.md](01-you-never-told-me.md) is
the source for the words; this file says where each syllable lands.

**The grids and the form table are generated** from the score, `music/ep01/score.mjs`, by
`node music/ep01/grids.mjs --write`. Don't edit them by hand: change the score and regenerate, so
the map always matches what's rendered. The notes around them are hand-written.

**Status:** draft 2, reworked with Qing's corrections of 2026-09-24 night. Needs Qing's ear.

## Fixed points

- **Key:** E♭ major. **Tempo:** 180 bpm, 4/4. One bar is 1.333 s. The reference takes run at
  178; 180 makes an eighth note exactly 8,000 samples at 48 kHz.
- **The first chorus is taken verbatim** from the MiniMax take Qing chose: melody, rhythm and
  chords. We own the rights to our MiniMax generations. Everything else is written to fit it.
- **The pre-chorus rhythm** comes from the other take Qing marked: its first two lines run
  straight into each other, which contrasts with the chorus, the part that soars.
- **The verse rhythm** is the "We Didn't Start the Fire" verse: straight eighths, one line per
  bar, lines back to back. At that speed the template wins over a bent stress ("2FA on YOUR gym
  LOG", "TWELVE sub A gents").
- **Leaps are seasoning.** The hook's leap to the high E♭ only lands if the rest of the melody
  moves mostly by step, so E♭5 is kept for the hook, the bridge's FOR that answers it, and the
  final DONE; "oops" takes the fifth, not the octave (Qing). `music/ep01/leaps.mjs` checks this:
  outside the chorus, the only leap of five semitones or more is the bridge's FOR.
- **Syncopation where the genre wants it:** key words pushed onto the `&` and held over the beat
  (the chorus's CHEAP, the tag's TOO and YOU, the bridge's SET and TEST, the intro's GOOD). The
  verse and pre-chorus stay straight, so the pushes stand out.

## Form

<!-- grid:form -->
| Bars | Start | Section |
|---|---|---|
| 1–4 | 0:00 | Intro |
| 5–12 | 0:06 | Verse 1 |
| 13–18 | 0:16 | Pre-chorus |
| 19–35 | 0:24 | Chorus 1 |
| 36–43 | 0:47 | Verse 2 |
| 44–49 | 0:58 | Pre-chorus 2 |
| 50–66 | 1:06 | Chorus 2 |
| 67–74 | 1:28 | Bridge |
| 75–80 | 1:39 | Breakdown |
| 81–84 | 1:47 | Tag |
| 85–90 | 1:52 | Final pre-chorus |
| 91–107 | 2:00 | Final chorus |
| 108–109 | 2:23 | Outro |

109 bars, about **2:26** at 180 bpm.
<!-- /grid -->

Harmony (v2, after the harmony pass in [MUSIC.md](../MUSIC.md#harmony)): the verses and the
chorus tail walk I–V–vi–IV. The pre-chorus climbs IV–vi–ii–IV–V: A♭–Cm–Fm–A♭–B♭sus4–B♭, always
moving forward, with the sus4 under "reading your" resolving for PROMPT. The hook is a question
and answer on I (who) and V (what). The palette's borrowed chords are used three times, each for a
reason:
- A♭ to A♭m, the "plagal sigh": comic in the intro ("so I made it good"), meant in the tag ("I'm
  someone TOO").
- D♭ (♭VII) ends the final pre-chorus, so the last chorus arrives by a new route.
- C♭–D♭–E♭ (♭VI–♭VII–I), the fanfare, under the held high DONE: E♭ belongs to all three chords.
`HARMONY=v1` renders the earlier plain version for comparison.

## Rhythm grids

How to read them: each bar is eight eighth-note slots, `1 & 2 & 3 & 4 &`. CAPITALS are stressed
syllables. `a·b` in one slot is two sixteenths. `~` holds the previous note, `.` is silence. A
leading `-` continues the previous word on a new note ("who-o-o"). Chords are per bar; `A · B`
means the chord changes on beat 3, and `E♭/G` is a chord over a different bass note. Extra rows
under a bar are the spoken voice, the gang vocals and the bots.

### Intro

The first GOOD is pushed onto the `&` of 2 with a guitar stab; the second droops (C4 to B♮3 over
A♭m). In bars 3 and 4 the lead guitar plays the hook, so it's heard at 0:03 rather than 0:24.

<!-- grid:Intro -->
```
bar       1      &      2      &      3      &      4      &      chords
b0        .      .      .      .      .      .      .      you    
b1        SAID   make   it     GOOD   ~      ~      ~      .      E♭
b2        so     I      MADE   it     GOOD   ~      ~      .      A♭ · A♭m
b3        .      .      .      .      .      .      .      .      E♭
b4        .      .      .      .      .      .      .      con    B♭
```
<!-- /grid -->

### Verse 1

"Did I do it WRONG?" then four counts of silence; OOPS gets space of its own; GONE lands on the
downbeat and "guess I didn't ask" is spoken on counts 6 7 8 as the pickup into the pre-chorus,
which starts on the `&` of 1 (Qing).

<!-- grid:Verse 1 -->
```
bar       1      &      2      &      3      &      4      &      chords
b5        FET    ti     EV     ry     TIME   you    FLOSS  .      E♭
b6        TWO    eff    AY     on     YOUR   gym    LOG    .      B♭
b7        KOO    ber    NET    eez    for    your   BLOG   .      Cm
b8        TWELVE sub    A      gents  ROUND  the    CLOCK  .      A♭
b9        did    I      do     it     WRONG  ~      ~      ~      Cm
b10       .      .      .      .      .      .      .      .      Cm
b11       OOPS   ~      .      your   QUO    ~      ta's   ~      B♭
b12       GONE   ~      .      .      .      .      .      .      E♭
  spoken  .      .      GUESS  I      DID    n't    ASK    ~      
```
<!-- /grid -->

### Pre-chorus

Each of the first two lines runs from the `&` of 1 to the next downbeat, and the next line starts
straight after: "…WHO it's | FOR you DIDn't TELL me WHAT they | WANT". MIND is pushed onto beat 4
and held over the bar line. The band stops dead on PROMPT.

**Six bars** (Qing compared 5, 6 and 8 by ear on 2026-09-25: "current one is best!"). The score
still renders the others with `PC_BARS=5|8`.

**The third chord is now Fm** (ii) in harmony v2, replacing the Gm that Qing wasn't keen on. The
research in MUSIC.md explains why the Gm stalled: the build went strong, weak, weak before
restarting. `PC_CHORD3` still renders alternatives (E♭/G, B♭, Gm).

<!-- grid:Pre-chorus -->
```
bar       1      &      2      &      3      &      4      &      chords
b13       .      you    DID    n't    TELL   me     WHO    it's   A♭
b14       FOR    you    DID    n't    TELL   me     WHAT   they   Cm
b15       WANT   ~      ~      ~      ~      ~      .      I      Fm
b16       CAN'T  ~      .      .      READ   your   MIND   ~      A♭
b17       ~      I'm    ON     ly     READ   ing    your   .      B♭sus4
b18       PROMPT ~      ~      ~      ~      ~      ~      ~      B♭
```
<!-- /grid -->

### Chorus 1

The hook leaps to E♭5 on WHO and WHAT, scooping up from below. The tail's changing lines all fit
two shapes: line A lands on 1 and 3, then 1 and the pushed `&` of 2; line B lands on 1 and 3,
with a pickup on the `&` of 4, then 1 and 2. In the second pass the gang doubles the hook.

<!-- grid:Chorus 1 -->
```
bar       1      &      2      &      3      &      4      &      chords
b19       .      .      .      .      GOOD   ~      for    ~      B♭ · E♭
b20       WHO    ~      ~      ~      -o     ~      ~      ~      E♭
b21       -o     ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    (who)  -o     .      .      .      .      .      .      
b22       WHAT   ~      ~      ~      -a     ~      ~      ~      B♭
b23       -at    ~      ~      ~      ~      .      .      .      B♭
  gang    (what) -at    ~      .      .      .      .      .      
b24       FAST   .      to     .      RUN    ~      ~      ~      Cm · A♭
b25       STUR   dy     or     CHEAP  ~      ~      ~      .      A♭ · E♭
b26       WOW    .      for    a      WEEK   ~      .      or     E♭ · B♭
b27       BUILT  to     KEEP   ~      GOOD   ~      for    ~      B♭ · E♭
b28       WHO    ~      ~      ~      -o     ~      ~      ~      E♭
  gang    WHO    ~      ~      ~      -o     ~      ~      ~      
b29       -o     ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    -o     ~      ~      ~      GOOD   ~      for    ~      
b30       WHAT   ~      ~      ~      -a     ~      ~      ~      B♭
  gang    WHAT   ~      ~      ~      -a     ~      ~      ~      
b31       -at    ~      ~      ~      ~      .      .      .      B♭
  gang    -at    ~      ~      ~      ~      .      .      .      
b32       SHIP   .      it     .      NOW    ~      ~      or     Cm · A♭
b33       ROOM   .      to     GROW   ~      ~      ~      .      A♭ · E♭
b34       DOES   .      what   they   NEED   ~      .      or     E♭ · B♭
b35       STEALS the    SHOW   ~      ~      ~      .      .      B♭ · E♭
```
<!-- /grid -->

### Verse 2

<!-- grid:Verse 2 -->
```
bar       1      &      2      &      3      &      4      &      chords
b36       PRO    duct   DE     mo     WOW    them   FAST   .      E♭
b37       PAY    ing    US     ers    MAKE   it     LAST   .      B♭
b38       GROUP  chat   BOT    just   MAKE   'em    LAUGH  .      Cm
b39       YOO    ni     PRO    ject   MAKE   it     PASS   .      A♭
b40       JUST   for    YOU    for    FUN    ~      ~      ~      Cm
b41       .      .      .      .      .      .      .      .      Cm
b42       .      .      .      then   YOU'RE ~      the    ~      B♭
b43       ONE    ~      .      .      .      .      .      .      E♭
  spoken  .      .      .      there's AL     ways   SOME   one    
```
<!-- /grid -->

### Pre-chorus 2

<!-- grid:Pre-chorus 2 -->
```
bar       1      &      2      &      3      &      4      &      chords
b44       .      you    DID    n't    TELL   me     WHO    it's   A♭
b45       FOR    you    DID    n't    TELL   me     WHAT   they   Cm
b46       WANT   ~      ~      ~      ~      ~      .      I      Fm
b47       CAN'T  ~      .      .      READ   your   MIND   ~      A♭
b48       ~      I'm    ON     ly     READ   ing    your   .      B♭sus4
b49       PROMPT ~      ~      ~      ~      ~      ~      ~      B♭
```
<!-- /grid -->

### Chorus 2

<!-- grid:Chorus 2 -->
```
bar       1      &      2      &      3      &      4      &      chords
b50       .      .      .      .      GOOD   ~      for    ~      B♭ · E♭
b51       WHO    ~      ~      ~      -o     ~      ~      ~      E♭
b52       -o     ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    (who)  -o     .      .      .      .      .      .      
b53       WHAT   ~      ~      ~      -a     ~      ~      ~      B♭
b54       -at    ~      ~      ~      ~      .      .      .      B♭
  gang    (what) -at    ~      .      .      .      .      .      
b55       WORKS  .      on     a      TRAIN  ~      on     your   Cm · A♭
b56       NAN'S  .      old    PHONE  ~      ~      ~      .      A♭ · E♭
b57       NO     .      A      gents  GO     ~      ~      ing    E♭ · B♭
b58       ROGUE  on·their OWN    ~      GOOD   ~      for    ~      B♭ · E♭
b59       WHO    ~      ~      ~      -o     ~      ~      ~      E♭
  gang    WHO    ~      ~      ~      -o     ~      ~      ~      
b60       -o     ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    -o     ~      ~      ~      GOOD   ~      for    ~      
b61       WHAT   ~      ~      ~      -a     ~      ~      ~      B♭
  gang    WHAT   ~      ~      ~      -a     ~      ~      ~      
b62       -at    ~      ~      ~      ~      .      .      .      B♭
  gang    -at    ~      ~      ~      ~      .      .      .      
b63       WORKS  for    SOME   one·who CAN'T  ~      ~      ~      Cm · A♭
b64       .      see    the    SCREEN ~      ~      ~      .      A♭ · E♭
b65       NO     .      ay     pee    EYE    .      KEYS   where  E♭ · B♭
b66       they'll be     SEEN   ~      ~      ~      I      could  B♭ · E♭
```
<!-- /grid -->

### Bridge

Half-time for four bars, then straight eighths building to FOR, which is sung on the hook's high
E♭ with a crash: the song's mid-peak. Lines 1 and 3 share a rhythm and push SET and TEST onto the
`&` of 4. Every "whoa-oh" sits on beats 3 and 4 of a line's second bar.

<!-- grid:Bridge -->
```
bar       1      &      2      &      3      &      4      &      chords
b67       ON     ly     LEARN  from·my TRAIN  ing    .      SET    A♭
b68       ~      ~      ~      ~      .      .      .      to     B♭
  gang    .      .      .      .      whoa   ~      oh     ~      
b69       WRITE  the    CODE   and    THROW  it     O      ver·the Cm
b70       WALL   ~      ~      ~      .      .      .      but    Cm
  gang    .      .      .      .      whoa   ~      oh     ~      
b71       HOW    do·you KNOW   what·to BUILD  or     .      TEST   A♭
b72       ~      ~      ~      ~      .      .      .      if·you're B♭
  gang    .      .      .      .      whoa   ~      oh     ~      
b73       NOT    ~      THINK·ing a      BOUT   ~      who    it's   A♭
b74       FOR    ~      ~      ~      -o     ~      -or    ~      B♭
  gang    .      .      .      .      whoa   ~      oh     ~      
```
<!-- /grid -->

### Breakdown

A half-time gang chant, sung twice: "SOFT-ware QUAL-i-ty is VAL-ue to SOME-one who MAT-ters",
with the stresses on the half-time kick (1) and snare (3). The second MAT lands on a band hit,
then silence, and "I'm someone too" answers it.

<!-- grid:Breakdown -->
```
bar       1      &      2      &      3      &      4      &      chords
b75       .      .      .      .      .      .      .      .      Cm
  gang    SOFT   .      ware   .      QUAL   i      ty     is     
b76       .      .      .      .      .      .      .      .      A♭
  gang    VAL    .      ue     to     SOME   .      one    who    
b77       .      .      .      .      .      .      .      .      B♭
  gang    MAT    .      ters   .      .      .      .      .      
b78       .      .      .      .      .      .      .      .      Cm
  gang    SOFT   .      ware   .      QUAL   i      ty     is     
b79       .      .      .      .      .      .      .      .      A♭
  gang    VAL    .      ue     to     SOME   .      one    who    
b80       .      .      .      .      .      .      .      I'm    B♭
  gang    MAT    .      ters   .      .      .      .      .      
```
<!-- /grid -->

### Tag

TOO and YOU are pushed onto the `&` and held. The bots' "and ME!" rises up the A♭ chord, one
stab each.

<!-- grid:Tag -->
```
bar       1      &      2      &      3      &      4      &      chords
b81       SOME   one    .      TOO    ~      ~      ~      .      A♭ · A♭m
b82       .      .      .      .      .      .      .      I'm·de A♭
  bots    .      and    ME     and    ME     and    ME     .      
b83       BUG    ging   THIS   with   .      YOU    ~      ~      B♭
b84       .      .      .      .      .      .      .      .      B♭
```
<!-- /grid -->

### Final pre-chorus

It starts quiet (bass and a heartbeat kick) and builds. PLEASE lifts to B♭4.

<!-- grid:Final pre-chorus -->
```
bar       1      &      2      &      3      &      4      &      chords
b85       .      so     PLEASE ~      tell   me     WHO    it's   A♭
b86       FOR    ~      PLEASE ~      tell   me     WHAT   they   Cm
b87       WANT   ~      ~      ~      ~      ~      .      I      Fm
b88       CAN'T  ~      .      .      READ   your   MIND   ~      A♭
b89       ~      I'm    ON     ly     READ   ing    your   .      B♭sus4
b90       PROMPT ~      ~      ~      ~      ~      ~      ~      D♭
```
<!-- /grid -->

### Final chorus

The gang doubles the hook in both passes. The last pass answers the hook ("Good for YOU! Good
for THAT!") and DONE lifts to the high E♭.

<!-- grid:Final chorus -->
```
bar       1      &      2      &      3      &      4      &      chords
b91       .      .      .      .      GOOD   ~      for    ~      D♭ · E♭
b92       WHO    ~      ~      ~      -o     ~      ~      ~      E♭
  gang    WHO    ~      ~      ~      -o     ~      ~      ~      
b93       -o     ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    -o     ~      ~      ~      GOOD   ~      for    ~      
b94       WHAT   ~      ~      ~      -a     ~      ~      ~      B♭
  gang    WHAT   ~      ~      ~      -a     ~      ~      ~      
b95       -at    ~      ~      ~      ~      .      .      .      B♭
  gang    -at    ~      ~      ~      ~      .      .      .      
b96       ROLL   back   my     mis    TAKES  ~      ~      ~      Cm · A♭
b97       DI     ags    I      can    USE    ~      ~      .      A♭ · E♭
b98       NO     .      STALE  .      PROMPTS mak·ing me     con    E♭ · B♭
b99       FUSED  ~      ~      ~      GOOD   ~      for    ~      B♭ · E♭
b100      YOU    ~      ~      ~      -ou    ~      ~      ~      E♭
  gang    YOU    ~      ~      ~      -ou    ~      ~      ~      
b101      -ou    ~      ~      ~      GOOD   ~      for    ~      E♭
  gang    -ou    ~      ~      ~      GOOD   ~      for    ~      
b102      THAT   ~      ~      ~      -a     ~      ~      ~      B♭
  gang    THAT   ~      ~      ~      -a     ~      ~      ~      
b103      -at    ~      ~      ~      ~      .      .      .      B♭
  gang    -at    ~      ~      ~      ~      .      .      .      
b104      JUST   .      a      .      TOY    ~      ~      and    Cm · A♭
b105      JUST   .      for    FUN    ~      ~      ~      .      A♭ · E♭
b106      FINE   .      if     it     DIES   ~      .      when   E♭ · B♭
b107      SUM    mer's  DONE   ~      ~      ~      ~      ~      B♭ · E♭
```
<!-- /grid -->

### Outro

DONE rings over E♭, then a hard cut; the loop goes straight back into the intro's first stab.

<!-- grid:Outro -->
```
bar       1      &      2      &      3      &      4      &      chords
b108      ~      ~      ~      ~      ~      ~      ~      ~      C♭ · D♭
b109      ~      ~      .      .      .      .      .      .      E♭
```
<!-- /grid -->

## How it's checked

- `music/ep01/audit.mjs`: stresses on beats, melody against the chords, range, overlaps.
- `music/check/prosody.py`: checks where each word's natural stress lands, using a pronouncing
  dictionary and not the score's own capitals. Calibrated first against Qing's past verdicts
  from LYRICS.md (13 of 13 agree), then run on every line of the song. It's a floor, not an ear.
- `music/ep01/guide.mjs` and `karaoke.mjs`: a click-and-guide render with a page that lights up
  each syllable as it plays, for Qing's ear.
