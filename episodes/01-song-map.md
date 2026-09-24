# Episode 1 song map: "You Never Told Me"

The whole song as form, bars, chords and rhythm, written before any sound is generated so the
phrasing is coherent from start to finish (Qing, 2026-09-24: "you'll need to map out the full
song's rhythm and chord sequences before you can go into generation - we need coherent rhythmic
phrasing throughout"). The lyric sheet in [01-you-never-told-me.md](01-you-never-told-me.md) is
the source for the words; this file says where each syllable lands.

**Status:** draft 1, needs Qing's ear. Melody is fixed only where a reference exists (chorus,
pre-chorus, intro, verse tag); the rest is contour to be written next.

## Fixed points

- **Key:** E♭ major. **Tempo:** 180 bpm, 4/4. One bar = 1.333 s (the reference runs at 178; 180 makes an eighth note exactly 8,000 samples at 48 kHz).
- **The first chorus is kept verbatim** from the MiniMax take Qing chose (melody, rhythm and
  chords). We own the rights to that generation. Everything else is written to fit around it.
- **Verse rhythm:** the "We Didn't Start the Fire" verse: seven or eight syllables in straight
  eighths, one line per bar, lines running back to back, the stressed words on the beats.

## Form

| Bars | Start | Section | Chords, one per bar (`/` = change on beat 3) |
|---|---|---|---|
| 1–4 | 0:00 | Intro (cold open) | E♭ hit · A♭ → A♭m hit · E♭ · B♭ |
| 5–12 | 0:05 | Verse 1 + tag | E♭ · B♭ · Cm · A♭ · Cm · B♭ · N.C. · N.C. |
| 13–20 | 0:16 | Pre-chorus | Cm · Cm · Gm · Gm · Fm · Fm · A♭ · B♭ (band stops) |
| 21–37 | 0:27 | Chorus 1, twice | B♭/E♭ · then twice: E♭ · E♭ · B♭ · B♭ · Cm/A♭ · A♭/E♭ · E♭/B♭ · B♭/E♭ |
| 38–45 | 0:49 | Verse 2 + tag | as verse 1 |
| 46–53 | 1:00 | Pre-chorus | as before |
| 54–70 | 1:11 | Chorus 2, twice | as chorus 1 |
| 71–78 | 1:33 | Bridge (half-time) | A♭ · B♭ · Cm · Cm · A♭ · B♭ · A♭ · B♭ |
| 79–84 | 1:44 | Breakdown (half-time chant) | Cm · Cm · A♭ · A♭ · B♭ · B♭ (hit, then silence) |
| 85–88 | 1:52 | Tag ("I'm someone too") | A♭ · A♭ · B♭ · B♭ |
| 89–96 | 1:57 | Final pre-chorus | as pre-chorus |
| 97–113 | 2:08 | Final chorus, twice | as chorus 1 |
| 114–115 | 2:31 | Outro | E♭ held, hard cut (loops into the intro's first hit) |

115 bars, about **2:33**. That's near the top of the 75–160 s range the trend runs to; the
doubled choruses are most of it. Places to trim if we need to: the second pre-chorus to four
bars, the breakdown to four.

Harmony in one line: the verses and the chorus tail walk I–V–vi–IV; the pre-chorus walks
vi–iii–ii–IV–V (Gm under the held B♭ of "want") so it lands on B♭ and the chorus answers on E♭. The hook itself is a question and
answer on I (who) and V (what).

## Rhythm grids

How to read them: each bar is eight eighth-note slots, `1 & 2 & 3 & 4 &`. CAPITALS are stressed
syllables. `a·b` in one slot means two sixteenths. `~` holds the previous note, `.` is a rest.
Stresses should sit on beats; where one doesn't, it's flagged.

### Intro (bars 1–4)

```
        1     &     2     &     3     &     4     &
b1      SAID  .     make  it    GOOD  ~     ~     .       (you = pickup; guitar hit on GOOD)
b2      so    I     MADE  it    GOOD  ~     ~     .       (hit; "good" droops C4 → B♮3 over A♭m)
b3-4    band riff, E♭ then B♭                  con        (pickup into verse 1)
```

### Verse 1 (bars 5–12)

```
        1     &     2     &     3     &     4     &
b5      FET   ti    EV    ry    TIME  you   FLOSS .
b6      TWO   eff   AY    on·your GYM .     LOG   .       ← check
b7      KOO   ber   NET   eez   for   your  BLOG  .
b8      TWELVE .    SUB   a·gents ROUND the  CLOCK .      ← check
b9      did   I     do    it    WRONG ~     ~     ~
b10     OOPS  your  QUO   ta's  GONE  ~     ~     ~
b11-12  stop. (spoken, free) "Guess I didn't ask."   you  (pickup into pre-chorus)
```

- **b6 and b8** don't fit straight eighths. Singing "2FA on your gym log" as seven even
  eighths puts the stress on "your" and "gym" falls on an off-beat. My fix squeezes "on your"
  and "a-gents" into sixteenths so GYM and SUB land on beats. The same sixteenth pair comes back
  in the bridge ("from my", "do you"), so it becomes a motif rather than a patch.
- **b7** puts "for" on beat 3. At this speed it reads as patter, and Qing said it scans; flagging
  it in case.
- One line per bar is the "Fire" rhythm, and it's what none of the MiniMax takes did: they gave
  each line two bars. The cost is four gags in 5.3 s, which is a picture problem for the parked
  storyboard.

### Verse 2 (bars 38–45)

```
        1     &     2     &     3     &     4     &
b38     PRO   duct  DE    mo    WOW   them  FAST  .
b39     PAY   ing   US    ers   MAKE  it    LAST  .
b40     GROUP chat  BOT   just  MAKE  'em   LAUGH .
b41     YOO   ni    PRO   ject  MAKE  it    PASS  .
b42     JUST  for   YOU   for   FUN   ~     ~     ~
b43     .     then  YOU'RE the  ONE   ~     ~     ~
b44-45  stop. (spoken) "There's always someone."    you
```

Verse 2 is pure "Fire" rhythm, all four lines. The tag mirrors verse 1's: FUN and ONE land on
beat 3 like WRONG and GONE.

### Pre-chorus (bars 13–20; repeats at 46 and, with "so please", at 89)

```
        1     &     2     &     3     &     4     &
b13     DID   n't   TELL  me    WHO   it's  FOR   ~
b14     ~     ~     ~     ~     ~     ~     .     you
b15     DID   n't   TELL  me    WHAT  they  WANT  ~
b16     ~     ~     ~     ~     ~     ~     .     I
b17     CAN'T .     READ  your  MIND  ~     ~     ~
b18     ~     ~     ~     ~     ~     ~     .     I'm
b19     ON    .     ly    .     READ  ing   your  .
b20     PROMPT ~    ~     ~     ~     ~     ~     ~       (band stops dead)
```

- It's built on the verse's shape (stressed words on 1, 2, 3, the last one on 4 and held), so
  the pre-chorus sounds like the verse slowing down to make its point.
- **Melody from the reference, moved to E♭:** "you didn't" on B♭4, falling to E♭4 on FOR; WANT
  drops to B♭3; "can't read your MIND" climbs E♭–F–G and holds F; "ON-ly READ-ing your" steps
  A♭–G–F–E♭–E♭; PROMPT holds F4 over B♭, then resolves up to G on the chorus's first "Good".
- **Final pre-chorus:** "so" is the pickup; PLEASE takes beat 1 with a rest after it, then the
  rest of each line as above.

### Chorus (verbatim from the reference; bars 21–37)

```
        1     &     2     &     3     &     4     &
c0      CRASH .     .     .     GOOD  ~     for   ~       B♭ → E♭ on 3
c1      WHO   ~     ~     ~     o     ~     ~     ~       E♭5 (scoop from D5), falls to G4
c2      o     ~     ~     ~     GOOD  ~     for   ~       A♭4 → B♭4
c3      WHAT  ~     ~     ~     a     ~     ~     ~       E♭5 (scoop), falls to G4
c4      at    ~     ~     ~     ~     .     .     .       B♭4
c5      FAST  .     to    .     RUN   ~     ~     ~       E♭4 patter
c6      STUR  dy    or    CHEAP ~     ~     ~     .       lifts to F4 on CHEAP
c7      WOW   .     for   a     WEEK  ~     .     or      A♭4 / G4 around B♭4
c8      BUILT to    KEEP  ~     GOOD  ~     for   ~       KEEP settles E♭4 → F4 → E♭4; "Good for" = next pass
```

Then c1–c8 again with the second set of words; after the last pass, the "Good for" slot in c8
is empty and the next section starts on the following bar. Bars c5–c8 carry every changing
line, so each one has to fit the same two shapes:

- **Line A (c5–c6):** stresses on 1 and 3, then 1 and the `&` of 2.
- **Line B (c7–c8):** stresses on 1 and 3, a pickup on the `&` of 4, then 1 and 2.

| Chorus | Line A (c5–c6) | Line B (c7–c8) |
|---|---|---|
| 1, first | FAST · to · RUN ~ \| STUR dy or CHEAP | WOW . for a WEEK . or \| BUILT to KEEP |
| 1, second | SHIP · it · NOW or \| ROOM · to GROW | DOES . what they NEED . or \| STEALS the SHOW |
| 2, first | WORKS · on a TRAIN on·your \| NAN'S old PHONE | NO . A gents GO ing . \| ROGUE on·their OWN |
| 2, second | WORKS for SOME one·who CAN'T . see the \| SCREEN ~ | NO . ay pee EYE . KEYS where \| they'll be SEEN |
| Final, first | ROLL back my mis TAKES ~ \| DI ags I can USE | NO . STALE . PROMPTS mak·ing me con \| FUSED ~ |
| Final, second | JUST · a · TOY and \| JUST · for FUN | FINE . if it DIES . when \| SUM mer's DONE |

- **Exact fits:** "Does what they need or steals the show" and "Fine if it dies when summer's
  done" match "Wow for a week or built to keep" syllable for syllable. "Just a toy and just for
  fun" and "Ship it now or room to grow" share a shape.
- **Tight spots, for your ear:** chorus 2's second pass ("Works for someone who can't see the
  screen" has ten syllables where the slot wants seven or eight) and the final chorus ("Roll back
  my mistakes? Diags I can use?" lands USE on 3, not the `&` of 2). If they sound crammed, the
  fix is in the words, not the rhythm.
- **Last pass:** "Good for YOU-ou-ou! Good for THA-a-at!" uses the hook's melody exactly.

### Bridge (half-time, bars 71–78)

```
        1     &     2     &     3     &     4     &
b71     ON    ly    LEARN from·my TRAIN ing  SET   ~       (pickup: "I could")
b72     ~     ~     whoa  ~     oh    ~     .     to
b73     WRITE the   CODE  and   THROW it    O     ver·the
b74     WALL  ~     ~     ~     whoa  ~     oh    but
b75     HOW   do·you KNOW what·to BUILD or   TEST  ~
b76     ~     ~     whoa  ~     oh    ~     .     if·you're
b77     NOT   think ing   a     BOUT  who   it's  .
b78     FO    ~     o     ~     or    ~     ~     ~       climbs to E♭5, the same note as WHO
```

Lines 1 and 3 are the same rhythm (the sixteenth pair on the `&` of 2, SET and TEST on beat 4).
Lines 2 and 4 both land their last word on the next downbeat (WALL, FOR). "Who it's FOR" is sung
on the chorus's high E♭, so the bridge answers the hook.

### Breakdown (half-time gang chant, bars 79–84)

```
        1     &     2     &     3     &     4     &
b79     SOFT  .     .     .     WARE  .     .     .
b80     QUAL  .     i     .     TY    .     .     is
b81     VAL   .     .     .     ue    .     .     to
b82     SOME  .     .     .     one   .     .     who
b83     MAT   .     .     .     ters  .     .     .
b84     HIT   .     .     .     .     .     .     I'm      (silence)
```

Every stressed syllable lands on the half-time kick (1) with a band hit.

### Tag (bars 85–88)

```
        1     &     2     &     3     &     4     &
b85     SOME  .     one   .     TOO   ~     ~     .       (robot alone, quiet)
b86     .     and   ME    and   ME    and   ME    I'm·de   (bots, one per hit)
b87     BUG   ging  THIS  with  YOU   ~     ~     ~
b88     ~     ~     ~     ~     ~     ~     .     so      (build into the final pre-chorus)
```

### Outro (bars 114–115)

DONE holds over E♭ for two bars, then a hard cut. The loop goes straight back into the intro's
first guitar hit, so "make it GOOD" follows "just for fun".

## Next

1. Qing checks the grids by ear, especially the flagged lines.
2. Melody for the verses and the bridge, written to these grids.
3. Arrangement per section (drums, bass, guitars, gang vocals), following MUSIC.md.
4. A click-and-guide-melody render of the whole map, for a listening check before the full
   synth.
