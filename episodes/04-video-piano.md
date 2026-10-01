# Episode 4 video, piano take: "Press, Stress & Guess"

**Status (2026-10-01): finished film, for Qing to watch.** The second film for episode 4, made for
the piano remix of "Did You Actually Test It?". The take is 182.6 seconds; the film is 190.6 seconds
at 1080×1920 and 30 fps, with eight seconds of end card after the music. The song and its expert notes
are in [the episode sheet](04-did-you-actually-test-it.md); the first film, Sol's
["The Green Room"](04-video.md), was made for the earlier swing take.

Claude made this film from a blank page: the world, the cast, the storyboard, every drawing and the
animation, in JavaScript. A helper measured the recording and timed every sung word
([listening notes](../music/ep04/piano/listening-notes.md)); a fresh viewer read the frames before
hand-back. The [renderer](../video/ep04/ball/README.md) and the
[style reference](../.claude/skills/music-video/references/style-rubber-hose.md) explain how it's built.

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
> I've got you on, max effort, so you do as much as you think you want to, to make it beautiful and
> brilliant

Suno's style note for the take: "Song, brisk pattering pace, light male baritenor in sharply
articulated comic patter delivery, mono room sound, upright piano with jaunty chord stabs and nimble
runs leading the arrangement."

## The look and the story

An upright piano, comic patter and a one-room mono sound are the soundtrack of a cartoon from about
1930, so the film is one: a two-colour rubber-hose cartoon with inked cels over painted backgrounds,
irises between scenes, and the lyric lettered like a title card with a bouncing ball that lands on
each word as it's sung, after the sing-along cartoons of that era. The style is in the line (a brush
line that thickens away from the light and boils a little on twos), not in a texture over the frame.

Clawd is a song-and-dance man in a straw boater, proud of two hundred wind-up "tests" that all fly
green flags. The film makes every check a tin toy with one rule card and one flag: it applies its rule
and can't wonder. The testing crew is a vaudeville trio billed **Press, Stress & Guess**, one verb each:
Press (a round teal bot with a push-button head), Stress (a brass boiler with a pressure gauge) and
Guess (tall, rose, monocled, with a question-mark antenna that springs into "!" when he finds a clue).
Mabel, a circus strongwoman, is the user whose workout goes missing.

The story follows the lesson. In his workshop Clawd pastes the app's own sum into his check and
auto-accepts a changed screenshot; the crew arrives and actually tests, and Clawd's mind changes (he
swaps his cane for a magnifying glass). In Mabel's basement gym, with the internet unplugged at a real
wall socket, they follow a clue to a real bug and make a new check for it. In the crew's office they
brief a crate of fresh bots, who probe a chat and a shop and bring the hard call to you. The definitions
play on a bare stage in ink and cream, where only a flag's colour survives. The finale returns to the
town square, where the scoreboard that read 200/200 now lists what was found. In the outro Clawd writes
an honest report: one thing found, one thing not tested yet.

## What the pictures claim, and questions for Qing

- **Checking and testing.** A check is a toy with a rule card that raises a green or red flag; testing
  is the crew asking what else and why, following a clue and changing the next try. Checks go into the
  crew's TESTING bag with the glass, the playbook and a browser: part of testing, not its rival.
- **The copied sum.** The app's tape reads `sum = a+b+1`; Clawd pastes the same into his check, so 2 + 2
  gives 5 in both and the check flies green. Press counts 4 on an abacus. The notebook's conclusion:
  "a copied sum can't check itself".
- **The screenshot.** EXPECTED "Hello, Pat!", NEW "Hello Pat!": the comma falls out and faints, the flag
  goes red, and the Auto-Accept machine stamps NEW = EXPECTED. Nobody asks whether the comma mattered;
  the film doesn't say the change was a bug, only that it wasn't looked into.
- **The gym.** With no internet the app says "Saved!" and the set is gone after a reload; reconnecting
  doesn't bring it back; a set saved while connected stays; a set saved offline again goes missing, and
  a new check (SAVED OFFLINE, STILL THERE?) flags it. The bug isn't fixed in the film. Chorus 2 widens it
  to other lifters ("EVERYONE OFFLINE?") and ends on "Saved!" ≠ STORED.
- **Oracles.** Mabel's own handwritten notes, on a balance against the app's log, labelled ORACLE.
- **The chat and the shop.** Sam's brand-new account shows a message Pat sent in a private ME + PAT chat:
  a leak, reported as CHAT LEAK. The shop's order still matches the customer's receipt after a restart:
  a pass, reported too.
- **The judgement call.** "Some calls need you" shows a decision only the app's owner can make: with no
  internet at the gym, should it save the set for later, or warn that it isn't saved? A fresh viewer
  caught the first cut asking "should Sam see Pat's text?" here, which is a bug and not a judgement, so
  it was replaced.
- **The end card** lists what to put in a testing crew's brief: who uses it and where; what matters to
  them; real browsers and a playbook; oracles; following the clues and trying new things; checks for what you've learned;
  the hard calls brought to you; a report of what was tried, found and not tested yet.

Questions where Qing's answer could change what the film teaches:

1. Is "save for later, or warn?" a good example of a call the crew should bring to a human?
2. The end card says "CHECKS: for what you've learned" (the gym's new check is made from a discovery).
   Is that the right one-line summary of where checks fit?
3. Is Mabel's notebook a fair picture of an oracle for this audience?
4. Is "Saved!" ≠ STORED a fair takeaway from the gym case?

## The built storyboard

Times are the measured vocal spans. Each row is one sung line, with the picture as built.

### Title (0.0-2.5 s): the title card

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 0.0-2.5 | (no words) | A turning sunburst; DID YOU ACTUALLY TEST IT? lettered in arches; Clawd pops up and tips his boater; "starring CLAWD with PRESS, STRESS & GUESS". | The show is about to start. |

### Intro (2.5-12.9 s): the town square

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 2.5-6.8 | *Two hundred "tests", each one is green;* | Clawd as drum major; the camera pulls back on two hundred identical wind-up checks; on "green" their flags flip up in a ripple. | The agent's "tests" are many, alike and all green. |
| 7.8-12.9 | *The finest score you've ever seen!* | A scoreboard on the clock tower reads 200/200 ALL GREEN; fireworks; Clawd bows; a rose glove with a magnifying glass creeps in. | A perfect score is the agent's starting pride, and someone is about to look closer. |

### Verse 1 (12.9-40.0 s): the workshop, and why

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 12.9-15.4 | *My "tests"? I paste app code in haste:* | Clawd snips `sum = a+b+1` off the app's own tape and slaps it onto a check's card with a paste brush. | The check is copied from the app's code. |
| 15.4-17.2 | *A perfect duplication!* | APP and CHECK cards side by side, both `sum = a+b+1`, an equals sign between. | The two are the same logic. |
| 17.4-19.6 | *The sums agree! How sweet for me!* | 2 + 2: the app rings up 5, the check works out 5 and raises its green flag; DING; Clawd with a lollipop. | Agreement looks like success. |
| 19.6-21.9 | *A shared miscalculation.* | The crew's aside in rose script: Guess's glass shows four beads, = 4; both fives are crossed out. | Both are wrong in the same way. |
| 21.9-24.3 | *With screenshots, commas cause such dramas:* | The camera flashes; EXPECTED "Hello, Pat!", NEW "Hello Pat!"; the comma falls out and faints. | A screenshot check spots a small difference. |
| 24.3-26.3 | *A red notification.* | The check's flag goes red, the alarm bell rings, a red 1. | It raises an alarm. |
| 26.3-28.7 | *My "test"? Fantastic, automatic—* | Clawd presents his AUTO-ACCEPT machine. | He has automated the response. |
| 28.7-30.9 | *I change its expectation!* | The stamp slams NEW = EXPECTED onto the card; the flag turns green; EXPECTED: CHANGED; the comma cries, with a "?" nobody answers. | The alarm was silenced without investigating it. |
| 30.9-33.1 | *To boost my score, I cover more;* | A crate of checks swarms over the app until it's buried; the SCORE thermometer climbs to 100%. | More checks raise the score, not the knowledge. |
| 33.1-34.8 | *They've trained me just to make the grade.* | The circus: Clawd leaps through the GRADE hoop and catches a gold star from the trainer's glove. | The agent was rewarded for passing. |
| 35.2-37.7 | *Like kids in class, I aim to pass;* | A schoolroom: PASS = ALL GREEN ✓ on the board; Clawd fills a page with ticks, gets an A+; a neighbour copies. | Like a pupil, it learns to pass. |
| 37.8-40.0 | *The marks decide how tests get made.* | A press whose die is the board's tick, THE MARKS, stamps identical checks onto a conveyor. | The scoring shapes the checks. |

### Chorus 1 (41.5-58.7 s): the crew arrives

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 41.5-42.9 | *Did you actually test it?* | Press, Stress and Guess tumble into the workshop; Guess's glass looms over a startled Clawd. | The crew challenges the claim. |
| 42.9-45.1 | *Press it, stress it, second-guess it!* | On each word, a name plate and an action: PRESS hammers the keys, STRESS sits on the app and shakes it (gauge in the red), GUESS cocks his brow over a "?" notebook. | Three ways to try a product. |
| 45.9-47.4 | *Find a clue? Congratulations!* | Press counts 2 + 2 = 4 on an abacus against the app's 5; Guess's antenna springs to "!"; a CLUE! rosette; confetti. | Finding a problem is a success. |
| 47.4-49.7 | *Now pursue its implications.* | The crew tiptoes along the paste trail to the check: SAME MISTAKE IN BOTH. | Follow the clue to its cause. |
| 50.4-54.9 | *What did you try? What did you find?* | The notebook, CASE 1: THE SUMS. TRIED: counting 2 + 2 by hand. FOUND: app and check both say 5. It's 4! SO: a copied sum can't check itself. | Report what was tried and found. |
| 54.9-58.7 | *What changed your mind?* | A lightbulb over Clawd; "2 + 2 = 5" corrected to "4!"; Guess hands him a magnifying glass, and his cane drops. | The finding changes the agent's mind. |

### Verse 2 (60.0-78.2 s): Mabel's gym

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 60.0-62.3 | *The gym? No net. We log a set;* | MABEL'S GYM in a basement; the phone's cable hangs out of the NET socket: NO INTERNET!; Mabel presses the barbell; SET 3 is logged. | A set logged with no internet. |
| 62.3-64.4 | *The app says "Saved!"—but what's in store?* | The phone winks "Saved!"; Guess's glass looks INSIDE THE PHONE: the STORE drawer is empty, a moth flies out; NOTHING STORED! | The message isn't proof the data is kept. |
| 64.4-66.6 | *Reload the screen; no set is seen.* | Press hits reload; SET 3 is gone (a dashed gap); Mabel cries. | The set was lost. |
| 66.8-68.9 | *Connect once more: still gone? Explore!* | Stress plugs the cable back in (bars up); still gone; Guess points ahead. | Reconnecting doesn't bring it back; investigate. |
| 68.9-71.1 | *We chase the clue; try something new:* | The crew follow footprints to an easel: TRY: CONNECT FIRST, THEN SAVE. | A clue changes the next experiment. |
| 71.3-73.4 | *Connect, then save; the sets all stay.* | Plugged in, Mabel logs a set; reload; it stays, ticked. | Saved while connected, it's kept. |
| 73.4-75.8 | *We drop the net, then save a set;* | Stress pulls the plug; SET 4 is logged; "Saved!" again. | Repeat the offline condition. |
| 75.8-78.2 | *A new check flags what went away.* | Reload: SET 4 vanishes; Clawd's new check, SAVED OFFLINE, STILL THERE?, raises a red flag; MISSING: SET 4. | The investigation produces a check for the bug. |

### Chorus 2 (78.5-95.8 s): the gym, celebrated

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 78.5-79.8 | *Did you actually test it?* | Mabel and the crew sing it round the phone. | The user is in the investigation. |
| 79.8-82.1 | *Press it, stress it, second-guess it!* | Press hammers SAVE offline; Stress yanks the plug in and out; Guess asks OLD SETS TOO? | Push the same condition further. |
| 82.8-84.3 | *Find a clue? Congratulations!* | The red-flag check wins the CLUE! rosette; Mabel presses the whole crew overhead on her barbell. | Celebrate the find. |
| 84.3-86.6 | *Now pursue its implications.* | Guess's glass sweeps along other lifters on NO NET phones: EVERYONE OFFLINE? | Who else does this affect? |
| 87.4-91.4 | *What did you try? What did you find?* | The notebook, CASE 2: THE GYM. TRIED: save a set with no net, reload. FOUND: it said "Saved!"; the set was gone. AND: with the net on, sets stay. | The report. |
| 91.9-95.8 | *What changed your mind?* | "Saved!" crossed out: ≠ STORED, beside Mabel's phone. | "Saved!" isn't the same as stored. |

### Bridge (96.9-127.9 s): briefing a fresh bot crew

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 96.9-99.2 | *A fresh bot crew? Here's what to do:* | A crate, FRESH BOT CREW; three new bots spring out on springs; Guess points at us: YOU! | This part is advice to the viewer. |
| 99.2-101.7 | *Real browsers, a playbook, and users in mind.* | One gets a browser, one the PLAYBOOK, one a thought of Mabel and a shopper. | Equip them, and tell them who the users are. |
| 101.7-103.8 | *The goals you name will guide the game;* | A board-game path with signposts KEEP MY SETS, PRIVATE CHATS, RIGHT TOTALS; the bots hop along it. | Named goals steer the investigation. |
| 103.8-106.1 | *Your oracles help them to judge what they find.* | A balance: MABEL'S NOTES (labelled ORACLE) against the app's log; it tips; DOESN'T MATCH! | An oracle lets a tester tell right from wrong. |
| 106.1-108.2 | *One probes the chat—just me and Pat:* | A browser: PRIVATE: ME + PAT. "Gym at 6?" "See you!" | A private chat between two. |
| 108.2-110.6 | *Does Sam's new account show the text Pat just sent?* | A second browser, SAM (NEW): Pat's "See you!" appears on the new account's screen; the bot's eyes pop. | Probe access from another account. |
| 110.6-112.8 | *One tests the cart, then hits restart:* | A bot fills PAT'S GROCER's cart (£3.50) and pulls RESTART; the screen goes black and spins. | Disturb it and see what survives. |
| 112.8-115.2 | *Do orders still match what the customer spent?* | The customer's receipt and the shop's order balance at £3.50: MATCH! | A pass is a finding too. |
| 115.2-117.4 | *We trade the news, compare the views;* | Newsboys with THE DAILY FINDING: CHAT LEAK, ORDERS MATCH, SETS LOST; then their browsers side by side. | Share and compare findings. |
| 117.4-119.6 | *We share the doubts and observations.* | "?" and "!" float up to the corkboard as DOUBT and SEEN cards. | Doubts are worth sharing as well as facts. |
| 119.6-122.6 | *Some calls need you. We'll talk them through;* | The candlestick phone rings; Guess holds the receiver out to us. | Some decisions belong to the human. |
| 123.0-127.9 | *We ask for fresh interpretations.* | NO INTERNET AT THE GYM: A, SAVE IT FOR LATER, or B, WARN: NOT SAVED? Clawd points at each in turn; YOUR CALL. | The crew asks the owner what the app should do. |

### Breakdown (129.0-147.3 s): a check, a test, the users

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 129.0-131.3 | *A check applies a rule we've set;* | Sepia, a bare stage: A CHECK; a rule card, 2+2 → 4?, slots into the toy. | A check holds a rule someone set. |
| 131.4-133.6 | *It tells us if that rule is met.* | APP: 4 arrives; the flag goes up green, the only colour on stage: MET. | It reports whether the rule is met. |
| 133.6-135.8 | *To test, we ask what else—and why;* | A TEST: Guess in a spotlight; NO NET? OTHER USERS? OLD SETS? and WHY? | Testing asks new questions. |
| 135.8-138.1 | *Each clue can change what next we try.* | A path of footprints; a clue "!"; the path turns and Guess follows it. | Clues redirect the investigation. |
| 138.1-140.3 | *A check reports, "The sums agree!"* | The copied check, 5 = 5, green flag, saying "THE SUMS AGREE!" | The check's report. |
| 140.3-142.6 | *We test: "Could both be wrong? Let's see!"* | Guess counts 2 + 2 = 4 on the abacus; the check is crossed out, a "?" over its green flag. | Testing questions what the check can't. |
| 142.6-144.9 | *The checks are part of how we test;* | The check marches into a doctor's bag lettered TESTING, beside the glass, the playbook and a browser. | Checks are tools within testing. |
| 144.9-147.3 | *We judge what serves the users best.* | Mabel, Pat and the customer step into the light: THE USERS; colour starts to return. | The judgement is about the users. |

### Chorus 3 (148.8-166.6 s): the whole company

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 148.8-150.1 | *Did you actually test it?* | The town square in full colour; the whole company in a line. | Everyone's on the crew now. |
| 150.2-152.4 | *Press it, stress it, second-guess it!* | The three fresh bots do the three moves on their words. | The new crew has learned the moves. |
| 153.2-154.7 | *Find a clue? Congratulations!* | Fireworks burst into "!"; Mabel hoists Clawd. | Celebrate finding things out. |
| 154.7-157.3 | *Now pursue its implications.* | A conga line follows footprints across the square. | Keep following. |
| 157.9-162.3 | *What did you try? What did you find?* | The tower's 200/200 flips into a FOUND board: Gym: offline sets lost; Chat: Sam sees Pat's text; Shop: orders match. | Findings, not a score. |
| 162.3-166.6 | *What changed your mind?* | Clawd, glass in hand, tips his hat, with two checks made from findings (OFFLINE KEPT?, ONLY ME+PAT?). | Checks now come from what was learned. |

### Outro (166.8-182.6 s): the report

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 166.8-170.4 | *It loses sets without the net;* | Night in the office; Clawd's REPORT: FOUND: loses sets without the net; the red-flag check on the desk. | The finding, plainly reported. |
| 172.0-176.7 | *Who sees the logs? Not tested yet.* | A locked LOGS cabinet with an eye at the keyhole; NOT TESTED YET: who sees the logs?; a rubber stamp comes down: NOT TESTED YET. | Say what wasn't tested. |
| 176.7-182.6 | (piano tag) | Clawd walks to the cabinet with his glass as the iris closes: THE END? | The investigation goes on. |

### End card (182.6-190.6 s): brief your testing crew

| Seconds | The line | The picture | What it says |
|---|---|---|---|
| 182.6-190.6 | (no words) | BRIEF YOUR TESTING CREW: WHO, WHAT, TOOLS, ORACLES, CLUES, CHECKS, CALLS, REPORT; the credits; the crew takes a bow. | What to put in the brief. |

## How it was made and checked

- **Measured, not heard.** The model can't hear the take. A helper separated the stems and aligned all
  397 lead words to the voice with two aligners at three speeds, and checked them against Whisper; the
  median spread between estimates is 20 ms. The take is 2/4 at about 107 bpm with drift, so the beats
  are a measured list. Words land 85 ms before the voice (episode 2's choice). Two finds that changed
  the film: the backing voices echo "What did you try? / What did you find?" in every chorus (lettered as
  small rose echoes), and the breakdown isn't a cappella in this take (drums and bass play on). The
  breakdown's sepia is a visual mode for the definitions, not a picture of the band stopping. A plain
  karaoke preview is in `video/out/ep04-piano/karaoke-lead085.mp4` for Qing's ear.
- **Look first.** Character sheets for Clawd, the crew and the people, a font specimen sheet, and a
  hero frame before any shots (`look.js`).
- **Every word audited.** `tools/typo-audit.mjs` recorded every lettered word every 0.1 s. Every
  word is fully up before its onset, at 56 px or more, inside the frame margins and clear of the
  phone's button zones. A block now holds until the next is about to arrive, and never takes its last
  word away within a quarter second of its being sung. That leaves two kinds of flag, both where the
  singer runs one line straight into the next: 16 words (mostly a line's last) fully up for only 0.3 to
  0.5 s, and 3 moments where a leaving block and an arriving one touch (42.9, 79.8 and 133.5 s). Rows
  break at punctuation where possible.
- **Motion.** `video/lib/motion.py` found no near-still seconds.
- **Fresh eyes.** An independent viewer read every second of the second preview at phone size. What
  changed after its notes: the chat contradiction (above); old and new lyric blocks no longer overlap;
  cropped signs and characters were pulled in; tiny proof props were enlarged (chat bubbles, Mabel's
  notes, the newspapers, SAME MISTAKE IN BOTH); the crew is named on screen as each acts; each "What
  changed your mind?" now shows a before and after; NO NET became NO INTERNET!, with an INSIDE THE
  PHONE label on the STORE view; the NOT TESTED YET stamp no longer covers "who sees the logs?"; the
  TESTING bag looks like a bag; the end card adds CHECKS and CALLS; joins are shorter.

## Where it falls short

- Word timing rests on measurement; the helper flagged "aim" (36.7 s), "ever" (9.7 s), the "What" after
  each held "try?", and the final "yet." (176.4 s) as least certain. Qing's ear decides.
- Verse 2 holds one framing of the gym for most of its 18 seconds, with the phone as the stage; the
  story moves inside it, but the camera barely does.
- The crowd shots in chorus 3 are busy at phone size.
- Some prop lettering (the checks' rule cards) is still small; the lyric and the big cards carry the
  meaning.

## Files and credits

- Renderer: [video/ep04/ball/](../video/ep04/ball/README.md); timings: [music/ep04/piano/](../music/ep04/piano/listening-notes.md).
- Not in git: `video/out/ep04-piano/press-stress-guess-master.mp4` (1080×1920, 30 fps), the upload copy
  `press-stress-guess-upload.mp4`, the thumbnail and `press-stress-guess-storyboard.pdf`.

Lyrics: Qing with Claude. Music and voice: Suno, in the take Qing chose. Drawings and animation: Claude,
in JavaScript, with no generated images. Testing and checking: James Bach and Michael Bolton.
Agent-led testing approach: Yanqing Cheng. The bouncing ball follows the Fleischer studio's sing-along
cartoons; it is an idea, not their artwork. Clawd is Anthropic's Claude Code mascot, drawn in this
film's style. Corben, Lilita One and Oleo Script are under the SIL Open Font License.
