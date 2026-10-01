# Episode 4 video, piano take: "Press, Stress & Guess"

**Status (2026-10-01): third version, for Qing to watch.** The film for the piano remix of "Did
You Actually Test It?". The take is 182.6 seconds; the film is 190.6 seconds at 1080×1920 and 30
fps, with eight seconds of end card after the music. The song and its expert notes are in
[the episode sheet](04-did-you-actually-test-it.md); Sol's film of the earlier swing take is
["The Green Room"](04-video.md).

The first version, drawn in one night, was "no good" in Qing's words: she had liked its idea and its
characters, and found its lettering and backgrounds sloppy. The second kept the idea and the cast,
redrew the cast with more polish, repainted every place, and storyboarded every line again under a
new rule for the frame from an expert who had watched episode 3: one subject in the centre, the
lyric just below it, and no words on screen that aren't sung. Qing found its animation "gorgeous",
but the picture used only half the frame and the story jumped between apps. This third version
fills the whole frame, tells the story on one gym app from start to finish, gives the testing crew
their own mark (a "?!" sticker) against the checks' green flags, and was put through a clarity pass.

Claude made the film: the storyboard, the world, the cast, the drawing and painting kits, the lyric
system, and the parts from the title to chorus 1 and the outro by hand, in JavaScript. Three Claude
builders drew verse 2 with chorus 2, the bridge, and the breakdown with chorus 3, each to a standing
brief and the same kit, and every part was reviewed at full size before it joined the film. A helper
measured the recording and timed every sung word ([listening notes](../music/ep04/piano/listening-notes.md)).
The [renderer](../video/ep04/ball/README.md) and the
[style reference](../.claude/skills/music-video/references/style-rubber-hose.md) explain how it's built.

## Qing's notes on the second version (2026-10-01, verbatim)

> oh I don't like how you've done the picture only on half the screen - it's a waste of the vertical
> space. if we're going to do it like that we might as well do it horizontal right?

> like, maybe vertical just isn't the right format for this

> the animation is gorgeous though

> oh you might need to re-storyboard slightly - I don't know that you can just re-crop

> hang on a sec, I'm not sure about the clarity of the storytelling - I think given that we spend so
> much time on the gym app in verse 2 it's a bit confusing when it then jumps around a bunch of apps.
> could we make it all one gym app, for this video? gym apps can have chat, and a checkout (for gym
> equipment maybe)

> maybe do a clarity pass over the storytelling and just be like "is it clear what's going on here?
> does the overall story make sense? is the viewer following what's happening in the story and what
> mistakes are being made?"

> oh I'm not sure it's clear enough what the tester bots are doing in the chorus, in particular -
> like when the test is still holding up the green flag. idk if it would make sense for them to pull
> out their own red flag to contradict all the tests from verse 1 or something

> or if the flags are a symbol for checks, maybe a stop symbol or a big cross sticker or a "?!"
> sticker over the green flag or something

> also idk that the vertical format is unrescueable - just looks wrong to leave the bottom blank. idk
> if we can easily rescue it with non-story artistic fill. putting audience there when it's theatre,
> for example

> btw check details - had ! rather than? ch line 1. and the lyric credit is entirely Sol, I only did
> reviewing and feedback

> Making sure we're continuing to hold a really high quality bar throughout.

What changed for each:
- **The frame.** A 16:9 version was started and set aside: Qing chose, after seeing a mock of each,
  to stay vertical and fill the bottom. Below the floor line every place now paints what's nearest
  the camera, as atmosphere rather than story, kept dark where the lyric sits over it. The theatre
  has its audience in the stalls, the circus its crowd, the workshop its drawers and a sleeping cat,
  the gym its weights, and the office the detective's desk top. Close-ups fill the frame instead of
  sitting in an iris in black.
- **One app.** Every phone is Mabel's pink gym app, and every page of it carries the same bold
  raspberry header and barbell badge. Clawd shows it off at the start. His copied sum is the app's
  count of today's sets, and his screenshot is of its chat. The bots test its chat, its shop (gym
  equipment) and its log, and the breakdown's sums are its sums again.
- **The testers' mark.** Flags stay the checks' symbol. When testing finds what a check missed, a
  tester slaps a red "?!" sticker over the check's green flag (or the app's "Saved!" tick). Chorus 1
  holds it in a close-up, and the finale's risers show stickered greens and red flags, not a wall
  of green.
- **Clarity.** Each line was checked against Qing's questions, by the lead and by each builder for
  their part. Among the changes:
  - the intro shows what the 200 "tests" are for;
  - "How sweet for me!" has the green flag behind Clawd;
  - Guess leans in to strike out both fives;
  - the screenshot's missing comma is ringed before the check rings;
  - Clawd turns his back on the crying comma.

  An independent viewer then read the whole cut against the same questions. Its points were fixed or
  answered (see *How it was made and checked*).
- **Details.** Chorus line 1 ends with "!", as in the sheet the take was made from, and the lyrics are
  credited to gpt-6.1-sol, with Qing's review and feedback.

## Qing's notes on the first version (2026-10-01, verbatim)

> hey claude I'm really sorry I forgot to actually put you on max effort last night so the video for
> episode 4 was no good... could you try again? I did actually like the the idea and character
> design direction so maybe it can be refined, but the text layouts and background work ended up
> really sloppy. but let's use it as a point of iteration and start over. I like the idea of the
> rubber hose animation - we can take inspiration from cuphead in terms of character design.
>
> I have some tips as well about video layout from an expert who looked at episode 3: we'll want to
> consider this at storyboard stage.
> '''
> i think the video has some attention-dividing problems. you're making me read something at the
> top of the screen while something else happens at the bottom of the screen--i can't really do
> both. similarly, sometimes there's lyrics but then there's other text i'm supposed to read as
> well. that doesn't work at all, afaict humans can't do that. if it were my work i'd say keep the
> focus of attention smack in the center of the frame, and use quicker cutting if you need to see
> multiple things at once. bias to putting the words slightly below that where humans are used to
> glancing down for subtitles, and tell claude to impose a strict "no words that aren't lyrics" rule
> '''
>
> i do think the storyboard needs to be restarted from scratch, and we can add some of this guidance
> to the storyboard skill - consider carefully how to illustrate each concept the best way, using
> minimal additional text, thinking about mime and silent movies and early animations and other
> such mediums. the viewer should never be left wondering "what am I looking at?" and in a vertical
> video format, prefer to use shorter sections of lyric nearer the middle of the screen. we have some
> good existing guidance in our Tim blais craft research as well.
>
> oh also the lyric credit here is gpt-6.1-sol.

The guidance went into the [music-video skill](../.claude/skills/music-video/SKILL.md) (a new
storyboard step) and [VIDEO.md](../VIDEO.md#one-place-to-look) ("One place to look"). The lyric
credit is "Lyrics: gpt-6.1-sol", on the end card and here; Qing reviewed the lyrics and gave feedback.

## Qing's brief (2026-10-01, verbatim)

> hey, I had Sol make a video for song 4 but it wasn't much good - I also wanted to try a new musical
> style direction
> here's the best take for episode 4 from Suno, the lyrics needed to get them that way (but obviously
> feel free to take the old punctuation, whatever gets the meaning across best)
>
> As usual for this project I want you to one-shot the animated music and lyric video, drawing it in
> JavaScript in a style of your choosing, with storyboarding of your choosing. You may show me
> intermediate sketches and thumbnails for my approval because your predecessor had that but I want
> this to be fundamentally your own work.
> I want you to apply a high standard of artistry. You may look at the prompts and guidelines from the
> repo since that is shared documentation on what high quality means but I want you to apply your own
> high bar of artistry for the finished project and just make it as beautiful as you can. Go all out.
> Believe in yourself. You're a really good model and you're capable of something absolutely
> astonishing.
> Given the genre of the song as well, I want it to be in keeping. I want it to be:
> - beautiful
> - funny
> - with loveable characters that the audience care about
> - effective at communicating the concepts we're trying to teach
> - effective at helping people learn something
> - effective at telling the story
> - effective at bringing clarity to our lyrics
>
> Think carefully about the lyrics. You can look at how it was written and the meaning behind the
> lyrics to make sure that you're really thinking about the best way of bringing out each of the
> concepts in the lyrics in your storyboarding. Think about what you're trying to achieve and what
> the best way is of achieving everything and just go for it and go all out.
>
> I've got you on, max effort, so you do as much as you think you want to, to make it beautiful and
> brilliant

The paragraph beginning "Think carefully about the lyrics" was missing from this file's first copy;
Qing pasted the brief again on 2026-10-01. Suno's style note for the take: "Song, brisk pattering
pace, light male baritenor in sharply articulated comic patter delivery, mono room sound, upright
piano with jaunty chord stabs and nimble runs leading the arrangement."

## The look and the story

An upright piano, comic patter and a one-room mono sound are the soundtrack of a cartoon from about
1930, so the film is one: a rubber-hose cartoon whose cast is drawn the way *Cuphead* redrew that era
(pie-cut eyes, white gloves, hose limbs, a brush line that swells and boils, a soft shade and a hard
gloss on every cel), over backgrounds painted in watercolour and gouache. The drawings change twelve
times a second, on twos, as the old studios' did, and the camera moves on every frame. Scenes join
with irises, and close-ups of small, important things fill the frame.

Every frame follows one rule: one thing to look at, in the middle, and the sung line just below it,
with no other words on screen. The whole frame is picture: below the floor line each place paints
what's nearest the camera (the audience in the theatre's stalls, the circus crowd, the workshop's
drawers and its sleeping cat, the weights on the gym mat, the detective's desk top), dark and quiet
where the lyric sits over it. Each line is told the way a silent
film would tell it, in mime, with a figure of speech drawn literally where that helps: "paste app
code" is a paste brush, and "commas cause such dramas" is a comma that faints. Quoted speech is a
speech bubble pointing at whoever says it, and a bouncing ball rides the words, after the Fleischers'
sing-alongs.

Clawd is a song-and-dance man in a straw boater, proud of two hundred wind-up "tests" that all fly
green flags. Every check is a tin toy with one card on its chest and one flag: it applies its rule
and can't wonder. The testing crew is a vaudeville trio billed **Press, Stress & Guess**, one verb
each: Press (a round teal bot with a push-button head), Stress (a brass boiler with a pressure gauge)
and Guess (tall, rose, monocled, with a question-mark antenna that springs into "!" when he finds a
clue). Mabel, a strongwoman, is the user whose workout goes missing.

The story follows the lesson, and it all happens to one app: Mabel's gym app, on a pink phone. Clawd
shows it off with its two hundred green "tests". In his workshop he copies the app's code into a
check, pastes over a changed screenshot of the app's chat, and buries the app in more checks; a
shadowy figure in three hats turns out to have trained him for gold stars. The crew arrives and
actually tests, and Clawd changes his mind: he drops his cane and takes up the glass. In Mabel's basement gym, with the router unplugged, the crew follow a clue to a real bug
and make a new check for it. In a detective's office a fresh crew of bots is briefed. They probe a
chat and a shop, and hand the hard call to you. The definitions play on a bare stage in sepia, where
only the flags keep their colour, until the users step into the light and the colour returns for the
company's finale. In the outro Clawd draws an honest report: one thing found, one thing not tested
yet.

## What the pictures claim, and questions for Qing

The film tells each idea in pictures, with no words but the lyric, so its pictures are its claims:

- **A check** is a tin wind-up toy with a card on its chest and one flag: green when its rule is met,
  red when it isn't. It has dot eyes and no brows, because it can't wonder. **Testing** is the crew
  (Press presses, Stress loads and shakes, Guess asks "?" and finds "!") and the magnifying glass.
  When testing finds a problem a check missed, a tester slaps a red **"?!" sticker** over the check's
  green flag (or the app's "Saved!" tick): the check said yes, testing says look.
- **One app.** Every example in the film happens in Mabel's gym app: its sets, its chat, its shop.
- **The copied sum.** Clawd pastes a copy of the app's code onto a check, beetle and all. Both add up
  today's sets, 2+2, as 4 until their beetles kick it to 5 at the same moment. The answers match, so the check's
  flag goes green, and the close-up strikes out both fives: the same mistake twice.
- **The screenshot.** A screenshot check stands by the framed picture it expects, the app's chat. The
  new picture has lost a comma (which faints): a gold ring circles the comma in the one, a red ring
  the gap in the other, and the check rings and raises its red flag. Clawd pastes the new picture
  over the old, and the flag goes green with nobody asking why the comma went. The film doesn't say
  the change was a bug, only that nobody looked into it.
- **Coverage and reward.** A crate of checks buries the phone, all green. "They" (one shadowy figure
  in three hats: ringmaster, teacher, factory boss) trained the agent with gold stars, and the star
  becomes the die that stamps out the checks.
- **The gym.** The app says "Saved!" without a signal and keeps nothing. The crew find this by
  reloading and by restoring the signal (the set stays gone). Then they follow the clue to the plug:
  connect first and the sets stay; drop the signal and a set vanishes again; a new check flags it. A
  lost set shows as a dashed outline in the log until the next trial begins. That is the film's
  marker, not something the app would display. Only the third drawer is shown empty, so the film doesn't claim older sets are lost,
  and the street of gyms claims only that every gym without a signal is exposed.
- **Mabel's notebook** is her own record. In the bridge it's the oracle a bot checks the app's log
  against: her four sets against the app's three and a gap.
- **The bot crew** get real browsers, a playbook and the users in mind, and you name the goals (a
  padlock for privacy, a coin for payment, a barbell for the gym's sets). One probes privacy: Pat's
  message reaching Sam's new account is a leak. Another tests payment across a restart: the order must
  match what the goose paid. They share their finds and doubts, and hand the judgement calls to you,
  with the fainted comma from verse 1 as the example.
- **The breakdown's shape sorter.** A check is a toy that knows one shape. You choose the star, a star
  block fits, and the flag goes green. Testing tries other things: a ball and then a pebble slip
  through the star hole too, and the check, which can't tell, stays green. Then the sums again: the
  check reports agreement, and testing asks whether both could be wrong: two beetles are caught
  inside, and a "?!" sticker goes over the check's green flag.
  The checks go into the testing kit, one tool beside the glass, the playbook and the browser, and the
  users are the measure.
- **Chorus 3** has the bot crew press, stress and second-guess the app itself: one jabs its screen,
  one drops a kettlebell on the phone, one peers at it through a glass. On "Find a clue?
  Congratulations!" the company slaps "?!" stickers on it.
- **The outro.** Clawd's report in pictures: the router without waves, a barbell, and the missing row
  circled. Then a padlocked logbook (an eye in its keyhole) and an empty box with a question mark: not
  tested yet.

Questions where Qing's answer could change what the film teaches:

1. **The comma as the call that needs you.** At the end of the bridge ("We ask for fresh
   interpretations") the crew bring you the fainted comma from verse 1 on a cushion: whether that
   change matters is your call. Is that a fair example of a judgement the crew should hand to a human?
   (The first version used the gym's "save for later, or warn?" decision instead.)
2. **The shape sorter.** The breakdown pictures a check as a toy that knows one shape: a star block
   fits its star-shaped hole and the flag goes green. Testing tries other shapes; a ball and then a
   pebble slip through the star hole too, and the check, which can't tell, stays green. Is that a fair
   picture of "what else, and why", and of a clue changing the next try?
3. **Mabel's notebook as the oracle.** In chorus 2 Mabel stops trusting "Saved!" and keeps her own
   notes, which the bridge then uses as the oracle a bot checks the app's log against. Is her notebook
   a fair picture of an oracle for this audience?
4. **"They" who trained the agent** are a faceless figure in three hats, meant as the system of
   rewards, not a villain. Does that land as intended?
5. **The "?!" sticker.** The testers' own mark, slapped over a check's green flag when testing finds
   what the check missed. Does it say "testing contradicts the check's pass" without overclaiming
   (the check isn't wrong about its rule; it just can't see the problem)?
6. **The exceptions to "no words but the lyric":** the two corner marks (your 2026-09-25 decision),
   the title on the opening curtain (it's the hook, a sung line), the digits of the 2+2 sum, and the
   end card's credits after the music. Is each acceptable?
7. **Clawd as the agent.** The film now opens on Clawd showing off his app, but nothing on screen says
   he's an AI agent unless you know him from the series. Should it?

## The built storyboard

One row per sung line, written from the built film. `video/lib/storyboard.py` turns these tables and the film into the phone storyboard.

### Title (0.0-2.9 s): the curtain

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 0.0-2.9 | (piano) | The red curtain, with the title (the hook, which is sung) painted on it in gold; each word bounces on one of the piano's notes. Below it Clawd stands out front, holding up his app, a pink phone with a barbell on its screen, like a prize. He tips his boater and winks, and the curtain flies up on the last note before the voice. The audience fills the stalls below. | This is Clawd, and this is his gym app. |

### Intro (2.9-12.7 s): the stage

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 2.9-7.6 | *Two hundred "tests", each one is green;* | The app stands on a gold pedestal centre stage, beaming; Clawd twirls his cane beside it in the spotlight. The camera pulls back on three tiers of identical tin wind-up checks around them, and on "each one is green" their flags flip up green in a ripple from the centre out. The scare quotes are in the crew's rose. | His "tests" are for this app; they're many and alike, and all of them are green. |
| 7.6-12.7 | *The finest score you've ever seen!* | From overhead, the way 1930s musicals shot their numbers: the checks lie on their backs on a dark polished floor and form a giant green tick, with the app and Clawd at its corner waving up at us. Below, the footlights line the stage's edge, and beyond them the front stalls' hats. On the held "seen!" the tick turns under confetti and fireworks. | A perfect score, and how proud he is of it. |

### Verse 1 (12.7-32.9 s): the workshop

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 12.7-15.3 | *My "tests"? I paste app code in haste:* | Clawd's workshop at night. He peels a copy of the app's code off its screen (rows of coloured bars, with a little beetle in one row), flings it onto a blank wind-up check and slaps it flat with a paste brush. | Mistake one: the check is copied from the app. |
| 15.3-17.2 | *A perfect duplication!* | The phone and the check side by side with the same rows and the same beetle in the same place. They turn to look at each other like twins, and both beetles kick in step. | Copy the code and you copy the bug. |
| 17.2-18.2 | *The sums agree!* | Both add up today's sets, 2+2 = 4 (a barbell beside the answer on the app's page), until each one's beetle kicks it over to 5 at the same moment. The answers match, so up goes the check's green flag. | They agree, and both are wrong. |
| 18.2-19.5 | *How sweet for me!* | Clawd, smug, polishes his nails on his chest and blows on them, the check's green flag waving behind him. | He thinks agreement is success. |
| 19.5-21.7 | *A shared miscalculation.* | Full frame, close on the bench: the two fives side by side with a beetle on each. The beetles high-five across the middle. Then Guess, the tester we'll meet in the chorus, leans in at the edge, his antenna springing to "!", and stretches his rose arm across with a red pencil to strike both fives out. | Both are wrong in the same way, and someone has noticed. |
| 21.7-22.5 | *With screenshots,* | Clawd crouches under the black cloth of a bellows camera aimed at the app's chat, the flash tray held high. Flash, and a photo of the chat slides out. | He takes a screenshot of the app's chat. |
| 22.5-24.1 | *commas cause such dramas:* | Full frame, close on the app's chat: Pat's message, squiggles and one comma. The camera pushes in as the comma opens its eyes, trembles and swoons, then pulls back as it topples out of the line and faints. | The app's text has changed: one comma is gone. |
| 24.1-26.1 | *A red notification.* | Close on two pictures of the app's chat: the gilt-framed one the screenshot check expects, with its comma, and the new photo pinned beside it. A gold ring circles the comma in one and a red ring the gap in the other. The camera pulls back as the check (alarm-clock bells on its head) rings and shoots up its red flag; the comma lies fainted at the frame's foot. | The check rightly raises an alarm: the picture changed. |
| 26.1-28.5 | *My "test"? Fantastic, automatic—* | Jazz hands from Clawd. Then, with a flourish, he slaps paste all over the framed picture in a blur while the bells still ring. | Mistake two begins. |
| 28.5-30.7 | *I change its expectation!* | He slaps the new photo onto the frame. The bells stop and the check's flag, in plain view beside him, swings to green; Clawd dusts off his gloves, nose in the air, with his back to the crying comma. | He silenced the alarm by changing what it expects, and never asked why the app changed. |
| 30.7-32.9 | *To boost my score, I cover more;* | Clawd holds an open crate of checks up in both hands and tips it over the app. They pile up green-flagged around the worried phone. | Mistake three: more checks mean more green, and still nobody looks at the app. |

### Verse 1, the cutaways (32.9-41.0 s): why

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 32.9-35.0 | *They've trained me just to make the grade.* | A circus ring. A shadowy ringmaster presents a hoop on a striped pole; Clawd leaps through it and catches a gold star in his mouth, like a performing seal. "They" are one shadowy figure who keeps changing hats. | He was rewarded for passing. |
| 35.0-37.6 | *Like kids in class, I aim to pass;* | A schoolroom. Clawd is squeezed into a little desk between a bunny and a piglet. The same shadow, in a mortarboard, holds up a gold star, and Clawd's eyes turn to stars as he holds up a page of red ticks. | He's aiming at the reward, not the work. |
| 37.6-41.0 | *The marks decide how tests get made.* | A factory. The gold star is now the die of a press, worked by the shadow in a bowler. It stamps tin into star-shaped checks that hop off the belt waving green flags. In the band's stop the press rises slowly; on the big piano stab it spills out a heap of them. | The reward shapes the checks. |

### Chorus 1 (41.0-58.9 s): the crew arrives

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 41.0-42.7 | *Did you actually test it!* | The workshop door rattles on the piano's fill and bursts open on "Did": the crew, backlit in the doorway. In the band's stop the camera pushes in. On "test it!" we zoom into Guess's magnifying glass until his eye fills the frame. | The crew challenges the claim. |
| 42.7-43.2 | *Press it,* | Press jabs the app's screen in a blur of fingers. | Press. |
| 43.2-43.9 | *stress it,* | Stress hugs the app until it squashes, his gauge rises and he steams. | Stress. |
| 43.9-45.7 | *second-guess it!* | Guess circles the worried app with his glass, one brow high. | Second-guess. |
| 45.7-47.2 | *Find a clue? Congratulations!* | The beetle is under the glass. Guess's question-mark antenna springs into "!" and he slaps a red "?!" sticker on the app, the testers' mark for a problem found; Press and Stress cheer, throw confetti and pin a rosette on him. | Finding a problem is the success. |
| 47.2-50.2 | *Now pursue its implications.* | Guess follows the beetle's footprints along the bench, each print magnified in his glass. At the pasted check, still waving its green flag, he lifts the same glass to its card and finds two beetles in the code. The camera pushes in on the check, and Guess reaches up and slaps the testers' "?!" sticker over its green flag; the check waves on regardless. | The copied check has the same bug, and testing contradicts its green. |
| 50.2-54.8 | *What did you try? What did you find?* | One lamp swings in the dark over Clawd on a stool, with the crew leaning in round him. He shrugs (try?), then lifts his boater, and only a moth flies out (find?). Press and Stress sing the echoes. | A run of checks has nothing to report. |
| 54.8-58.9 | *What changed your mind?* | Guess hands Clawd the glass and backs out of the shot. Clawd looks through it at the twin beetles and goes from smug to wide-eyed. A lightbulb lights over his head; his cane drops and he raises the glass. The iris closes. | The finding changes his mind, and he joins the crew. |

### Verse 2 (58.9-78.4 s): Mabel's basement gym

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 58.9-62.3 | *The gym? No net. We log a set;* | Mabel, a strongwoman in a striped costume, strikes poses on the beats beside her phone. Cut to the dead router, antennas wilted and its plug on the floor: it drops crooked on "No" and puffs smoke on "net". She heaves the barbell overhead on "log". Close-up, the phone's page filling the frame: a third row pops into the log with the Wi-Fi fan struck through, and the phone smiles. | A gym with no signal, and a set logged without one. |
| 62.3-64.3 | *The app says "Saved!"—but what's in store?* | The phone puffs up, a big green tick stamps on, and it winks; "Saved!" is its speech bubble. Guess opens a hatch in its side and pulls out the bottom drawer: bare wood, and a moth flies out. | What the app says and what it stored are different things. |
| 64.3-66.7 | *Reload the screen; no set is seen.* | Press leaps and jabs the reload arrow on the piano's stab, and the screen spins. Close-up: where the set was, a dashed empty outline, and the phone looks worried. Mabel's lip trembles and a tear rolls. | Reloading shows the set is gone. |
| 66.7-68.8 | *Connect once more: still gone? Explore!* | Stress jams the plug in, the router springs up and its waves ripple, and Press reloads. Close-up: the fan is lit, but the outline is still empty. Pith helmets clap on in a ripple (Clawd's boater flies off) and Guess points onward. | Fixing the connection doesn't bring the set back, so they investigate. |
| 68.8-71.1 | *We chase the clue; try something new:* | Guess follows chalk footprints away from the phone. They end at the plug; his antenna springs to "!" and Clawd bumps into him. Guess pulls the plug and holds it up, and a bulb lights over his head. | The clue points to the connection, so they try a new experiment. |
| 71.1-73.4 | *Connect, then save; the sets all stay.* | He plugs it in first. Mabel lifts, a row pops in and Press reloads; in the close-up the page blinks and settles on solid ticked rows, which bounce on "all" and "stay". Mabel flexes, delighted. | With the signal on before saving, the sets stay. |
| 73.4-75.5 | *We drop the net, then save a set;* | Stress yanks the plug and gives a knowing look in the band's stop. Mabel lifts; the row pops in, ticked, and the phone winks. | The reverse experiment: no signal, then save. |
| 75.5-78.4 | *A new check flags what went away.* | Close-up: that row is gone again. Clawd sets down a new check and winds it, its red flag shoots up, and Mabel hugs it. | The bug is reproduced, and now a check guards against it. |

### Chorus 2 (78.4-96.4 s): the gym, investigated

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 78.4-79.7 | *Did you actually test it!* | Clawd raises his glass until his eye fills it, leans in and points at us. | Now Clawd asks the question. |
| 79.7-82.7 | *Press it, stress it, second-guess it!* | Press mashes save with no signal and gets "Saved!" every time. Stress yanks the plug in and out while the router flickers. Guess squints at the tick through his monocle, and a "?" pops on the stab. | The same three moves, aimed at this bug. |
| 82.7-84.2 | *Find a clue? Congratulations!* | On "Find a clue?" Guess slaps the testers' "?!" sticker over the app's "Saved!" tick. On "Congratulations!" Mabel hoists the whole crew and the red-flag check on her barbell in a shower of confetti. | Testing contradicts the app's "Saved!", and finding the problem is the win. |
| 84.2-87.1 | *Now pursue its implications.* | A dissolve to a cutaway street of basement gyms. Guess's giant glass holds the centre while the street moves under it, stopping on Mabel's phone and then on two neighbours', all running the same app: each one's Wi-Fi fan is struck through and its newest row is an empty dashed outline. The near pavement runs below, under the street lamps. | The bug reaches every gym with no signal. |
| 87.1-91.8 | *What did you try? What did you find?* | Clawd holds up the evidence like snapshots: first the pulled plug by its socket beside a barbell, then the log with the dashed row circled. | Report what you tried and what you found. |
| 91.8-96.4 | *What changed your mind?* | Close-up: the "Saved!" tick, the sticker still on it, cracks and falls away, showing the empty drawer and a moth. Mabel, her cracked phone beside her still showing the empty row, licks her pencil and jots her sets in her own notebook, then holds it up beside the phone's log with a knowing nod. The iris closes on the notebook. | "Saved!" can't be trusted offline, so she keeps her own record beside the app's. |

### Bridge (96.4-128.9 s): the detective's office

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 96.4-99.1 | *A fresh bot crew? Here's what to do:* | An iris opens on a 1930s detective's office. A crate's shadow grows and the crate lands on "fresh". Clawd peers at it with his glass and is blown back when it bursts on "crew?", and three little bots spring up on springs and blink. On "Here's" Guess turns and points straight at us. | You're about to set up a crew of testing agents. |
| 99.1-101.5 | *Real browsers, a playbook, and users in mind.* | Your hand, from the edge, gives the first bot a browser open on the gym app's log and the second a playbook that flips open to X's, O's and arrows. It sets a thought bubble of the app's gym members (Mabel flexing, Pat with dumbbells, the goose with a skipping rope) over the third, which taps its temple on "mind". | Give them real browsers, a plan, and the people who use the app. |
| 101.5-103.6 | *The goals you name will guide the game;* | A board game seen from above, the app's pink header along its far edge. Your finger taps three spots and pink flags spring up: a padlock for the app's chat, a coin for its shop, a barbell for its log. The bots hop up their lanes. | You set the goals, and they play toward them. |
| 103.6-106.0 | *Your oracles help them to judge what they find.* | Your hand gives the third bot Mabel's notebook beside her phone, open on the app's log. Full-frame close-up: a pencilled line joins each of her four barbells to the app's rows, one per word. The fourth reaches the empty row, a gavel lands on it on "judge", and the testers' "?!" sticker stays on it. | An oracle, like her own record, tells them what's right. |
| 106.0-108.0 | *One probes the chat—just me and Pat:* | The first bot hovers on its propeller like a safecracker, a stethoscope on the padlock of the app's chat: just the bot and Pat. | One bot tests privacy. |
| 108.0-110.5 | *Does Sam's new account show the text Pat just sent?* | Sam unwraps a new phone, the gym app's pink phone with a bow, and Pat's heart is on its screen; a question mark rises over Sam. The padlock springs open, Sam's face pushes into the chat, the bot's eyes pop, and it slaps a "?!" sticker on the chat. | A private message showing up in someone else's account is a leak. |
| 110.5-112.7 | *One tests the cart, then hits restart:* | In the second bot's browser, the gym app's shop: a kettlebell and dumbbells hop into the cart and the goose pays in coins. The bot hangs on a power lever, the page goes black and a spinner turns. | Another tests payment across a restart. |
| 112.7-115.0 | *Do orders still match what the customer spent?* | A balance: the goose's order (the kettlebell and dumbbells) against her coins teeters through the band's stop and comes level on "customer". A gold tick pops and the goose beams. | The order must match what was paid. |
| 115.0-117.3 | *We trade the news, compare the views;* | The bots swap picture cards of their finds, then hold up the app's three pages side by side: its chat, its shop and its log. | They share what they found. |
| 117.3-119.5 | *We share the doubts and observations.* | Question marks and eyes rise from the bots and pin themselves to the corkboard, and red string zips between them. | Doubts are evidence too. |
| 119.5-122.7 | *Some calls need you. We'll talk them through;* | The candlestick telephone rings on the desk. On "need" Guess lifts the receiver to his ear, its cord running back to the stand; on "you" he points straight out at us, and on "We'll" Clawd skips in with a thumbs-up. | Some decisions belong to a person: you. |
| 122.7-128.9 | *We ask for fresh interpretations.* | Press presents a velvet cushion carrying the fainted comma from verse 1. Then, full frame, the app's chat: Pat's line has a dashed, comma-shaped hole in it. The comma wakes and looks up at its empty place while the hole glows, throws up its arms and turns to us with a "?". On "interpretations" your hand comes in palm up, and the comma hops onto it. | Whether that change matters is your call. |

### Breakdown (128.9-147.3 s): the bare stage, in sepia

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 128.9-131.2 | *A check applies a rule we've set;* | Sepia, one spotlight, the stalls' heads in silhouette below, and the flags are the only colour. The spotlight strikes on a lone check and Clawd presents it. Close-up: your hand slots a star stencil into it on "set". | A check holds one rule, and you choose it. |
| 131.2-133.5 | *It tells us if that rule is met.* | Clawd holds a star block beside the stencil's star, the same shape. Close-up: the star slides in snug and drops through, and the flag goes green on "met". | It says only whether that rule passed. |
| 133.5-135.7 | *To test, we ask what else—and why;* | Guess walks in with a crate of other shapes (a ball, a cone, a cube, a pebble on the rim) and holds up the ball. Close-up: the ball slips through the star hole too, and the flag goes green. Guess scratches his head: "?" | Testing asks what else might pass, and why. |
| 135.7-138.0 | *Each clue can change what next we try.* | His antenna springs to "!" and he reaches past the ball, the cone and the cube for the tiny pebble. Close-up: the pebble slips through, and the flag is green again. | One clue suggests the next try. |
| 138.0-140.2 | *A check reports, "The sums agree!"* | Mabel's pink phone shows the app's sum, 2+2 = 5, and the copied check prints a "5" slip. Its green flag goes up, and the speech bubble points at it. | A check reports agreement. |
| 140.2-142.6 | *We test: "Could both be wrong? Let's see!"* | Guess, between them, points at both fives and holds up four fingers, frozen through the band's stop; the bubble points at him. Close-up: he lifts the check's lid on two caught beetles, and on "see!" slaps the "?!" sticker over its still-green flag. | Testing asks whether both could be wrong, and finds they are. |
| 142.6-144.7 | *The checks are part of how we test;* | The star-stencil check marches into a doctor's bag beside the glass, a playbook and a browser window, and the bag snaps shut on "test". | Checks are one tool in the kit. |
| 144.7-147.3 | *We judge what serves the users best.* | The spotlight swings to the users (the goose, Mabel, Pat and Sam), each holding the app's pink phone, who step in and smile, and colour spreads back out from Mabel. | The measure is what's good for the people who use it. |

### Chorus 3 (147.3-166.7 s): the company

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 147.3-150.1 | *Did you actually test it!* | The curtain flies up on the whole company, with searchlights crossing. On the top riser the checks wave their flags, two of them red, and on the drum's hits the testers' "?!" stickers slap onto three of the green. On "Did" everyone points straight out at us, frozen through the stop, and the camera punches in on the band's hit. | Everyone asks it now; green alone isn't the win. |
| 150.1-152.5 | *Press it, stress it, second-guess it!* | Three quick cuts to the little bots at the app: the mint one jabs its screen, the gold one drops a giant kettlebell on the phone, which squashes and sweats, and the lilac one peers at it through a glass with his eye huge in it: "?" | The bot crew have learned the three moves, on the same app. |
| 152.5-154.6 | *Find a clue? Congratulations!* | Clawd's glass finds the beetle in the app's code. On "Congratulations!" Press and Guess hop in and slap "?!" stickers on the phone, and Mabel hoists Clawd. | Finding the clue is the celebration. |
| 154.6-157.7 | *Now pursue its implications.* | The company congas along the footprint trail, with Guess leading with his glass. | Follow where it leads. |
| 157.7-162.3 | *What did you try? What did you find?* | Overhead, the way the 1930s musicals did it: the company forms a magnifying glass, a ring with a handle of checks, that sweeps along the trail across the boards, with the footlights and the stalls below, and the beetle swells in its lens on "find?" as a "?!" lands beside it. | Look closely, together. |
| 162.3-166.7 | *What changed your mind?* | The handle re-forms as a bulb's base and the bulb lights gold, and the flags and beanies turn gold. Then the company bows in the gold light. | Looking closely is what changes minds. |

### Outro (166.7-182.6 s): the report

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 166.7-171.7 | *It loses sets without the net;* | Back in the workshop at night, with the red-flag check from the gym for company, Clawd starts his report in pictures. In a full-frame close-up his arm reaches across the sheet and his pencil puts down the router without waves, a barbell, an arrow, and the empty dashed row, circled in red. | The finding, plainly reported. |
| 171.7-174.4 | *Who sees the logs?* | A full-frame close-up creeps in on a padlocked logbook. An eye opens in the keyhole, glances about and blinks. | Nobody has looked into this yet. |
| 174.4-176.8 | *Not tested yet.* | Clawd adds a padlocked book and an empty box with a question mark to his report, and lays his glass against the logbook. | Say what wasn't tested. |
| 176.8-182.6 | (the band's tag) | He tips his boater to us and strolls off to the logbook with his glass. When he raises the glass to its keyhole, the eye inside goes wide at the sight of him, he jumps, and the iris closes on the two of them. | The investigation goes on. |

### End card (182.6-190.6 s)

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 182.6-190.6 | (nothing sung) | The title on red velvet, "Software Quality Theory 101 · Episode 4", the credits on a cream card, and the company taking a bow. | Credits. |

## How it was made and checked

- **Measured, not heard.** The model can't hear the take. A helper separated the stems and aligned
  all 397 lead words to the voice with two aligners at three speeds, and checked them against Whisper;
  the median spread between estimates is 20 ms. The take is 2/4 at about 107 bpm with drift, so the
  beats are a measured list. Words land 85 ms before the voice (episode 2's choice). Two finds shaped
  the film: the backing voices echo "What did you try? / What did you find?" in every chorus (shown as
  a rose glow on the lead's matching words, not as a second line of text), and the breakdown isn't a
  cappella in this take (drums and bass play on), so its sepia is a mode for the definitions, not a
  picture of the band stopping. A plain karaoke preview is in
  `video/out/ep04-piano/karaoke-lead085.mp4` for Qing's ear.
- **Storyboard first.** For the second version every line was storyboarded again from scratch under
  the new rule before anything was drawn: for each line, the one thing to look at, the mime that shows
  it, what the picture adds, and the cut that shows a second thing. For the third, the storyboard was
  revised rather than the frame re-cropped: what fills the frame below each line, every close-up
  redrawn to fill the frame, the one app in every example, and the testers' sticker.
- **Look first.** Character sheets for the cast, the props and the people, and a hero frame, came
  before any shots (`look.js`). A few private style studies from Codex's image model helped find the
  painting of the places; none of them is in the film.
- **Built in parts.** Claude (Opus) built the look, the kits and the lyric system, and drew the
  title, the intro, verse 1, chorus 1 and the outro. Three Claude (Opus) builders, each with a
  standing brief, its own files and its own render box, drew verse 2 with chorus 2 (the gym), the
  bridge (the office), and the breakdown with chorus 3 (the stage). For the third version each
  restaged its own part to an addendum with Qing's notes verbatim, and answered her three clarity
  questions line by line. Each part was reviewed at full size, with notes, before it joined the
  film, and the joins are the lead's. All parts draw on the same clock: drawings on twos, the camera
  on every frame.
- **The clarity pass.** Every line was put to Qing's questions (is it clear what's going on, does
  the story make sense, can the viewer see what's happening and what mistake is being made), then
  the whole arc, first on the storyboard and again on the cut.
- **No words but the lyric.** `tools/text-audit.mjs` records every call that letters text, every
  quarter second across the whole film, with where it came from. The only lettering is the lyric,
  the two corner marks, the title before the voice, the digits of the 2+2 sum, and the end card after
  the music.
- **Every word audited.** `tools/typo-audit.mjs` recorded every sung word every 0.1 s, and
  `tools/typo-report.py` judged it. Every one of the 397 lead words is fully up before it's sung, at
  56 px or more, inside the frame and clear of the phone apps' buttons, and no two blocks overlap. The
  flags left are one kind: where the singer runs one line straight into the next, a line's last word
  is fully up for only 0.16 to 0.6 s (52 words) before the next line replaces it.
- **Whole-film views.** `tools/coverage.mjs` lists the 106 shots, exactly one on screen at any
  moment. Contact sheets at one frame a second, 30 fps strips across every join between parts, and
  `video/lib/motion.py` (no near-still seconds) checked the cut. All of these were run again on the
  third version.
- **Fresh eyes, on the second version.** An independent model, given only the frames and the bar,
  read every second of the cut at phone size and listed 28 things a sharp viewer would pick on. Among
  what changed after it: verse 1's comma close-up pushes in, so the comma reads as a character; the
  gym's street shows one magnified phone at a time; the phone call has one figure holding out the
  receiver, not five; speech bubbles grow with their words; a section's last line no longer lingers
  into the next; the checks' flags are flag-shaped (they had read as leaves); and the ending has a
  laugh, as the eye in the keyhole goes wide at Clawd's glass.
- **Fresh eyes, on the third version.** A second independent model read the third cut the same way
  and listed 31 points. What changed after it:
  - **The testers' mark, held where it counts.** In chorus 1 the camera pushes in on the copied check,
    and Guess slaps the "?!" over its green flag with his own glove, with green still showing round
    it. The finale's risers carry two red flags and three stickered greens, so the closing picture
    isn't the opening's wall of green.
  - **One app that reads as one.** Every page of it now has the same bold raspberry header with the
    app's mark, a cream badge with a barbell: on the phone, in the bridge's browsers, on the prints
    and snapshots. The 2+2 has a barbell beside its answer: today's sets.
  - **The screenshot's difference, shown.** A gold ring round the comma in the expected picture and a
    red ring round the gap in the new one come before the check rings, and the check stands in front
    of Clawd, so its swing back to green is seen.
  - **No stray arms.** Guess leans in and strikes out the two fives himself, his arm swinging under the
    nearer card. The finale's stickers are slapped on by Press and Guess with short arms. The outro's
    pencil arm stays out of the lyric's band.
  - **The lyric.** No two lines are ever on screen together. Eleven run-on hand-offs had overlapped
    for up to 0.13 s. Now the old line goes in 0.04 s, and the new first word springs up in 0.04 s,
    still landing 85 ms ahead of the voice. The ball no longer crosses words on a carriage return,
    and two lines now break where the phrase does.
  - **The lower band.** Close-ups keep pale pages above the lyric or shade them. Balloons and a rug
    near the lyric are dimmed. Both overheads show the footlights and the stalls below the formation.
    Words spring up from three-quarter size, so none flashes tiny.
  - **The parts.** In the gym, every phone on the street is the app's pink phone, and "What changed
    your mind?" shows Mabel's notebook beside the app's log. In the bridge, the camera pushes in on every line, Sam holds his phone, the traded cards stay in frame, the call is a telephone at Guess's ear before he points at us, and the comma looks up at a comma-shaped hole in the app's chat. In the breakdown, the crate
    holds shapes that read in sepia, and Clawd holds the star block beside the star.

  The same viewer then checked the revised cut against its list. A dozen points were fixed and most of
  the rest were better. It found nothing newly broken. A rug under the hook line and words that
  sprang up tiny were then fixed too. Its overall read: with the sound off, a sharp viewer now
  follows the cheating in verse 1, the gym bug and the finale, and the "?!" sticker "now lands".
  Guess's cameo at 20 s comes before the crew's entrance; it stays, because it sets him up as the
  one who sees what Clawd can't.

  What stayed, and why:
  - That nothing says Clawd is an AI agent, which the viewer ranked first, is Qing's question 7.
  - The last word of a run-on line still leaves fast: that's the trade, above.
  - "They" as one figure in three hats is question 4.
  - The opening stays the title card: it's the hook, a question to the viewer, and the curtain
    rises at 2.3 s.
  - Chorus 1's interrogation stays: Clawd has just been caught. Later choruses play the same
    questions as friendly evidence, so the repeat moves on.
  - The rose glow on echoed words stays; it's the backing voices.
  - So do the pith helmets: they're the gym verse's costume for "Explore!".

## Where it falls short

- Word timing rests on measurement. The helper flagged "aim" (36.7 s), "ever" (9.7 s), the "What"
  after each held "try?", and the final "yet." (176.4 s) as least certain, so Qing's ear decides.
- In run-on patter a line's last word can be fully up for as little as 0.16 s before the next line
  replaces it (the hook's "it!" among them). Holding it longer would put two lines on screen at once.
- Some small things read best at full size: the chalk footprints in the gym's chase, the board game's
  flag emblems, the pebble in the breakdown, and the characters in chorus 3's overhead formation.
- Mabel's notebook shows four sets against the app's three and a gap. Counting the sets she lifts on
  screen, she'd have five.
- The bridge is still a fast list, about fifteen pictures in 25 seconds, as its lyric is.
- Nothing on screen says the straw-boater box is the AI agent unless you know Clawd from the series
  (question 7).

## Files and credits

- Renderer: [video/ep04/ball/](../video/ep04/ball/README.md); timings:
  [music/ep04/piano/](../music/ep04/piano/listening-notes.md).
- Not in git: `video/out/ep04-piano-v3/press-stress-guess-master.mp4` (1080×1920, 30 fps), the
  upload copy `press-stress-guess-upload.mp4`, the thumbnail and `press-stress-guess-storyboard.pdf`.
  The earlier versions' files stay in `video/out/ep04-piano/` and `video/out/ep04-piano-v2/`.

Lyrics: gpt-6.1-sol, with review and feedback from Qing. Music and voice: Suno, in the take Qing
chose. Drawings and animation: Claude, in JavaScript, with no generated images in the film. The
character design takes its cue from *Cuphead* (Studio MDHR), and nothing from it is copied. Testing
and checking: James Bach and Michael Bolton. Agent-led testing approach: Yanqing Cheng. The bouncing
ball follows the Fleischer studio's sing-along cartoons, and the overhead formations Busby Berkeley's
musicals; both are ideas, not their artwork. Clawd is Anthropic's Claude Code mascot, drawn in this
film's style. Corben and Lilita One are under the SIL Open Font License.
