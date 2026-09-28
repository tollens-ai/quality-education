# Episode 2 video, v1: "The Garage"

The first video for episode 2, made to the take Qing chose on Suno, "How Will I Know". One
auteur made it, with no reviewer committee, following the
[music-video skill](../.claude/skills/music-video/SKILL.md). The renderer is
[video/ep02/garage/](../video/ep02/garage/README.md).

## Qing's brief (2026-09-28, verbatim)

> hey so I ended up paying for suno and, uh, the genre took a sharp left turn. it's now... kind of
> experimental post-paramour?

> I'll paste you the lyrics as they ended up at the end, but obviously the captions need to be spot
> on so you need to transcribe all the backing vocals as is. also I know the heuristics line is
> slightly mangled but the rest is so strong that well just let the lyrics cover that problem.

> do you remember the successful process from last time? lyric - text focused, strong, hand drawn
> artistic style, (doesn't have to be the same as last time), careful attention to artistry and
> detail, solo auteur no committee at least on the artistry.

> btw one minor nit on last time is the texture that ended up over everything, not everyone liked,
> so we should think hand drawn more for the line art style than as a uniform texture over the
> colouring

> I still want a boy band of claudes but now they have to be like, playing guitar and drumming and
> stuff in the instrumentals

> I would actively prefer a different art style of your choice - to go with the new genre!

## Qing's notes on v1 (2026-09-28, verbatim)

> I saw the thumbnail of the episode 2 attempt from last night [...] and it just looks WAY too
> much like episode 1 - so if people see that thumbnail they won't click it. what happened to
> doing something completely different?

> noooooooooo my number 1 problem is that the font looks the samr

> like i don't think the plan to reuse any assets works at all.

> it has to FEEL different. this video just doesn't match the genre.

> for me it's cool and kooky and alternative and slightly shocking, nothing like the cutesy and
> bubblegum and childish vibe of episode 1. I'd imagine, like, geometric and anime like the steins
> gate intro or something? and way more typography-focused with text appearing exactly word by
> word aligned with the timing and moving and animated animated in a proper animated lyric video
> way (though this is actually general feedback - episode 1 would have been better if it had this
> too)

> I think "motion design" is one of the key words I'm looking for btw.

> also i realise I forgot to whack effort up to max last night - you should refuse to do me the
> final video unless effort is set to max

Gemini's description of the take, with where it disagrees with the measurements, is in
[music/ep02/listening-notes.md](../music/ep02/listening-notes.md).

What went wrong: v1's renderer was episode 1's, copied and restyled. The alphabet was the same
file, and the people, crowds and props were copied unchanged. The feel stayed episode 1's too: a
cosy picture book at a boy band's pace, set to a 136 bpm pop-punk take. v2 is drawn from a blank
page, and the rest of this file describes v1 until v2 replaces it.

## The world

ASYNC, a boy band of five Clawds, practise in a garage with the roller door shut. Everything they
know about the people they built apps for comes in as notes pushed under the door: "broken". That
is the lesson's starting point: an agent that can only be told it's wrong, never how to tell for
itself. Verse 1 is the four disasters, on one long zine page. Verse 2 is the band building a way
to tell for each: a load cannon fired on every merge, a bandmate who puts on Gran's cardigan, a
torch on every family's padlock, and the one no check could find, Dave and Sue, which arrives as
a note under the door. The bridge is the garage turned fairground: the oracle booth, the rules on
a hamster wheel, a map drawn by thumb, a checklist that goes green. In the last pre-chorus light
comes under the door; on the last chorus it rolls up, and the people it was all for are standing
in the driveway. The band shows its check report, asks "do you love it?", and they answer.

## The band

Five types, as every boy band has, each introduced on a "HELLO my name is" sticker in the intro,
and each with an instrument for the instrumentals:

| Member | Look | Plays |
|---|---|---|
| The heart-throb | frosted-tip quiff | lead vocal, rhythm guitar |
| The older one | suit, tie, grey side parting, moustache; Gran's cardigan in verse 2 | lead guitar |
| The builder | hard hat, tool belt | bass |
| The sensitive one | teal beanie, a fringe over one eye | keytar |
| The bad boy | backwards cap, leather, a gold chain | drums, with ASYNC on the kick |

They play the intro (one close-up a bar), the solo after chorus 1 (guitar, then drums), the drum
break before the bridge and the outro. In every other shot the band sings, harmonises or pops up
from the bottom of the frame for the backing vocals.

## The look

Cut paper and marker, a pop-punk zine; the style's reference is
[style-cut-paper-and-marker.md](../.claude/skills/music-video/references/style-cut-paper-and-marker.md).
Flat paper colour with no texture over it, after Qing's note on episode 1; the hand-drawn quality
lives in the line, a felt-tip outline that wobbles, boils on twos and overshoots where a loop
closes. Pieces stand off the page on hard shadows, held with tape. Each shot takes one strong
ground: the garage's night purple, a flat colour field, a sunburst.

## The lettering

Every sung word is lettered as it's sung, in the film's marker capitals. Most lines are strips of
torn paper, slapped down a word at a time, taped to the garage door or across the top of a panel.
The line to remember, "I want you to love it, so give me something I can prove!", is held as one
sticker-lettered block on a sunburst in every chorus. The title is a ransom note. Backing vocals
("oooh", "ohhh", "ooh-ooh", "oh yeah") ride on paper chips above the band's heads as they pop up;
the echoes ("for myself?", "something else") go in speech bubbles or to the harmonising four;
the four "I love it"s fill a comic page one panel at a time.

## The captions: what the take sings

The captions follow the take, not only the sheet. The take was separated (Demucs for the vocal,
then a karaoke model for lead against backing) and transcribed with Whisper, and every backing
vocal was checked on the backing stem for loudness, voicing and pitch. The timed file is
[music/ep02/captions.srt](../music/ep02/captions.srt); the backing spans are in
[music/ep02/backing.json](../music/ep02/backing.json).

Where the take differs from Qing's sheet:

- **After chorus 1, the hook is sung again:** "So give me something I can prove!"
- **"(something else)" is echoed twice** in the first two pre-choruses, once in the third.
- **Four "I love it"s,** not three.
- **A wordless "ooh"** over the last instrumental.
- **No backing is audible** after verse 1's fourth line, verse 2's third line or chorus 2's third
  line, where the sheet has "(oooh)", "(ohhh)" and "(ooh-ooh)". Those captions are left out.
- **The heuristics line** is captioned as written ("And even only heuristics I'd be"), as Qing
  asked, though the take slurs it.

## How it was checked

- **Motion:** no still second anywhere (`video/lib/motion.py`).
- **Words:** the typography audit rendered the film every 0.1 s and judged all 487 sung words
  for size, time on screen, contrast, cover, tilt, reading order and the phone apps' UI zone.
  The first run flagged 73; the causes were signs counted as lyrics, emphasis colours that
  blended into their paper, a pop-up clock bug that un-wrote words across cuts, cuts that came
  too soon after a line's last word, and back-to-back "I love it"s. After the fixes, the last run
  flagged three edge cases in the UI zone, which were then moved; every word is lettered while
  it's sung, and every line reads in sung order.
- **Craft:** 1080 stills of every shot, looked at six at a time, and the master's own frames.
- **The master:** 1080 x 1920 at 30 fps, 174.8 s, 5,245 frames decoded.

## Where it falls short

- **The backing vocals rest on measurement, not ears.** The places to listen for are listed in
  the report to Qing: chorus 1 and 3 may also have the "ooh-ooh"s the sheet gives only to
  chorus 2, and the closing vocalise may not be an "ooh".
- **The end card** ("How will your agent know?", with four answers) is teaching the song doesn't
  sing. Its wording is a claim for Qing to check.
- **Choruses 1 and 2 share most of their shots,** with chorus 2 varied (the new checks on the
  clipboard, the guide half written).
- The chunky picture-book people and the band are episode 1's, recoloured; the band's costumes
  are new.
