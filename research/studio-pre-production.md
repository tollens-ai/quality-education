# How studios catch problems early, and what transfers to a one-shot video

Researched 2026-09-25 for episode 1's storyboard. "(checked)" means the quote was matched word for
word against the page text; "(unchecked)" means only a tool extract or search snippet was seen,
so treat it as a paraphrase. The MrBeast quotes were checked against two public transcriptions of
the leaked PDF, not the PDF itself. The process built from this is the
[storyboard guide](../.claude/skills/write-episode/storyboard.md).

**Main finding.** In all three kinds of studio, the cheap step is a full-length, low-fidelity run
against the real audio, watched by fresh eyes and then rebuilt. For us the renderer can be the
animatic, so that step costs almost nothing. The one-shot rule makes it more important.

## Practices, most transferable first

1. **Story reel or animatic on the real track, rebuilt many times** (Pixar, Disney, Bluey, The
   Simpsons). Disney's Mark Kennedy: "We re-do our work over and over so other departments won't
   have to" and "We typically do 7 screenings in total" (both checked) [Kennedy]. Bluey's creator
   iterates animatics: "re-record, cut and change around" (checked) [WorldScreen]; its producer:
   "The animatic is the recipe that everyone refers back to" (checked) [ABC]. Al Jean: the
   animatic "reveals what works and what doesn't", and "Once it's in color, the cost of changing
   too much is prohibitive" (both checked) [Fox]. It catches pacing, clarity and dead air, which
   only show over time. **For us:** a browser page drawing grey-box frames from the song's time,
   with captions and the real take, rebuilt after every round of notes.
2. **Package first** (MrBeast, Paddy Galloway). "YOU MUST KNOW THE TITLE AND THUMBNAILS OF THE
   VIDEOS YOU ARE MAKING! How can you know how to start your video if you don't even know what
   expectations the viewers have of you?" (checked) [Jarvis]. A great idea "has to be easy to
   convey in a title thumbnail" (checked) [Creator Science]. Veritasium's "legitbait", where the
   video delivers what the title promises, is our truth constraint (unchecked; from a
   machine-translated summary) [Veritasium; GIGAZINE]. **For us:** kill any concept that can't
   be stated in one title line and one muted first frame.
3. **Score the song before drawing** (Gondry, OK Go, anime). Gondry "plotted out the
   synchronization of the song on graph paper before creating the video" (checked) [Star Guitar].
   OK Go's "The One Moment" ran from "a master sheet 25 columns wide and nearly 400 rows long"
   (checked) [NFS]. Anime storyboard sheets (e-konte) carry a cut number, notes and dialogue for
   every cut (unchecked) [Sakuga]. It catches sections with no visual idea and repeats nobody
   planned for. **For us:** a beat file the renderer reads, so score and video can't drift apart.
4. **Every beat has a job, and the video escalates** (MrBeast). "you must always know what minute
   mark the content you are working on is"; a planned "3 minute re-engagement"; "Stop telling
   people what they will be watching and start showing them" (all checked) [Jarvis/Willison].
   **For us:** scale minutes to seconds and label every 3-second window: hook, escalation,
   re-engagement or payoff. An empty label is a swipe risk.
5. **Fresh-eyes screenings whose notes carry no authority** (Pixar Braintrust). Catmull: "early on,
   all of our movies suck" (checked) [Pixar Post]. The director "does not have to follow any of
   the specific suggestions" (unchecked) [Collider]. Reels were shown to the whole studio every six
   months (partly checked) [First Round]. **For us:** new subagents for every screening, giving
   notes on problems, not fixes.
6. **Board artists write, then pitch to the room** (Adventure Time). Board teams get two weeks from
   a bare outline: "They're basically directing… writing all the jokes" (checked); then notes, and
   two more weeks (unchecked) [Daily Beast]. Pixar's "plussing" builds on an idea rather than
   blocking it (unchecked; secondary source) [Intense Minimalism]. **For us:** the gag room, as
   parallel subagents with different lenses, then a plussing round.
7. **A mark for every joke** (The Simpsons). Writers mark "a check mark for a joke that gets a
   laugh, an 'X' for one that falls flat" (unchecked) [Fox]. **For us:** check/X every gag in the
   animatic. A model saying it laughed isn't evidence of a laugh, so use it to rank and leave the
   final call to a human.
8. **Many cheap concepts, few full treatments** (music-video commissioning). A concept document
   "no more than one page long", narrowed to "1-5 ideas" before a full treatment; a treatment is
   "(1) text outlining the video concept and how it will be executed and (2) images and reference
   videos" (checked) [MV Guidelines]. Prism Prize jurors read treatments while the song plays
   (unchecked) [Prism].
9. **Look frames in parallel with story.** Buck: "initial look frames for the pitch", then
   "storyboards and a boardomatic, where we figured most things out" (checked) [Motionographer].
   **For us:** three stills from the real code at key moments, to catch a look that can't be read
   on a phone.
10. **Truth pass and QA at fixed gates** (Kurzgesagt). Scripts take about a "dozen drafts"
    (checked) [Kurzgesagt]; QA runs "after the sketch phase, finalization of the storyboards and
    after the first render with final timing" (checked) [Kurzgesagt Medium].
11. **Study outliers before you ideate.** Galloway's outlier gets "3 or 4 times more than the
    average at minimum"; ask "What about the packaging made it an outlier?" (both checked)
    [Creator Science].
12. **A model as test audience, with a known blind spot.** Gemini samples video at "1 frame per
    second" by default, and "fast action sequences might lose detail" (checked) [Gemini docs]. No
    source validates model audiences; treat them as a smoke test.
13. **After release, learn.** Shorts analytics show viewed against "swiped away" (checked) [YT
    Shorts], but "You are not able to A/B test Shorts" (checked) [YT T&C]. Log each drop against
    its beat as a hypothesis.

## One-shot videos

**Most famous one-shots are joined sections.** "This Too Shall Pass" was built in sections
"triggered when the machine passed certain gates, to account for small changes in timing"; it took
about 60 takes, many failing "at the start of the song's chorus" (checked), and has a hidden cut
through a curtain [TTSP]. "Upside Down & Inside Out" smoothed the joins between weightless periods
with morphs (checked) [OK Go FAQ]. "Weapon of Choice" isn't a single shot [WoC].

**The central device maps the song to space.**
- Around the World: each dancer group is an instrument, "the robots represent the vocals… the
  mummies represent the drum machine" (checked) [AtW].
- Star Guitar: the passing landscape is the score. The often-quoted "the drum with the houses" was
  only seen in a snippet (unchecked).
- Come Into My World: one loop that gains a copy of everything each time; the song was reshaped
  into "four loops of approximately one minute long" (checked) [befores & afters].
- Powers of Ten: "one power of ten per 10 seconds" (checked) [Powers].
- Bluey's creator prefers "single shots for as long as possible, only cutting when absolutely
  necessary" (checked) [AC Mag].

**They tested cheaply first.** Gondry modelled Star Guitar's scenery with "oranges, forks, tapes,
books, glasses and tennis shoes" (checked). The Eameses made a 1968 "Rough Sketch" of Powers of
Ten. OK Go spent a week of "test flights to figure out which ideas would work" (checked). *1917*'s
camera path was reportedly mapped from overhead and rehearsed in fields (unchecked).

**What transfers.** One spatial rule mapped from the song, so repeats and choruses show up in
space; sections built as functions of song time between fixed handoff states; the most attention
on the seams, where a cut would normally refresh attention; an overhead camera-path map with
timestamps. What doesn't: the cost of a physical take. In code a rerun is free, so the risk moves
from execution to attention. No evidence was found that one-shots improve retention.

## Gaps

Primary Pixar and Randy Nelson pages were blocked, Paddy Galloway's retention posts are on X, the
Star Guitar mapping quote has no primary source, and model test audiences are our proposal, not a
sourced practice.

## Sources

- Kennedy: http://storystruggles.blogspot.com/2021/01/mark-kennedy-disney-story-process.html
- WorldScreen: https://worldscreen.com/tvkids/joe-brumm-talks-blueys-success/
- ABC: https://www.abc.net.au/news/2019-12-02/i-took-my-toddler-to-see-where-bluey-is-made-ludo-studio/11742386
- Fox: https://www.foxnews.com/story/simpsons-gets-ready-for-16th-season.amp
- Pixar Post: https://pixarpost.com/2014/03/the-pixar-braintrust-excerpt-from-ed.html
- Collider: https://collider.com/pixar-braintrust-details-ed-catmull-inside-out/
- First Round: https://review.firstround.com/lessons-from-pixar-why-software-developers-should-be-story-tellers/
- Intense Minimalism: https://intenseminimalism.com/2015/pixars-plussing-technique-of-giving-feedback/
- Daily Beast: https://www.thedailybeast.com/this-is-how-an-episode-of-cartoon-networks-adventure-time-is-made/
- Sakuga: https://blog.sakugabooru.com/glossary/storyboard/
- Motionographer: https://motionographer.com/2012/03/26/interview-buck-good-books-metamorphosis/
- Kurzgesagt: https://kurzgesagt.org/what-we-do?visit=videos
- Kurzgesagt Medium: https://medium.com/@Kurzgesagt/how-research-and-factchecking-work-at-kurzgesagt-f5b239188255
- MV Guidelines: https://static1.squarespace.com/static/5b9170e2c258b4ff66f30981/t/5d38e18684eee2000124c481/1564008838776/Pitching+Process+-+GUIDELINES+AND+BEST+PRACTICES+FOR+MUSIC+VIDEO+PROJECTS+(2019.07.24).pdf
- Prism: https://www.prismprize.com/mvp-labs-takeaways-winter-2023
- Willison: https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/
- Jarvis: https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/
- Creator Science: https://podcast.creatorscience.com/paddy-galloway-2/
- Veritasium: https://www.veritasium.com/videos/2021/8/17/we-need-to-talk-about-clickbait
- GIGAZINE: https://gigazine.net/gsc_news/en/20210830-clickbait-effective/
- YT T&C: https://support.google.com/youtube/answer/13861714
- YT Shorts: https://support.google.com/youtube/answer/12942217
- Gemini docs: https://ai.google.dev/gemini-api/docs/video-understanding
- Star Guitar: https://en.wikipedia.org/wiki/Star_Guitar
- befores & afters: https://beforesandafters.com/2026/03/24/olivier-gondry-on-the-making-of-kylie-minogues-come-into-my-world/
- AtW: https://en.wikipedia.org/wiki/Around_the_World_(Daft_Punk_song)
- TTSP: https://en.wikipedia.org/wiki/This_Too_Shall_Pass_(OK_Go_song)
- OK Go FAQ: https://okgo.net/2016/02/11/upside-down-inside-out-faq/
- NFS: https://nofilmschool.com/2016/11/ok-go-the-one-moment-slow-motion-music-video
- WoC: https://en.wikipedia.org/wiki/Weapon_of_Choice_(song)
- Powers: https://en.wikipedia.org/wiki/Powers_of_Ten_(film_series)
- AC Mag: https://acmag.com.au/2021/09/01/bluey/
- 1917 (unchecked): https://www.esquireme.com/culture/film-and-tv/43387-heres-how-1917-was-filmed-to-look-like-one-continuous-shot
