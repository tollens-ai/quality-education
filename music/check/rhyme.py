"""Rhyme and stress check for a lyric draft, before anyone hears it.

The model can't hear, so it asserts rhymes and stresses by eye and gets some wrong ("love it"
with "leave it", "mockup" with "lock it up"). This prints what the pronunciation dictionary says,
so the claim can be checked. Two rules from Qing (LYRICS.md):
  - what makes a rhyme is the stressed vowel: "see it" rhymes with "leave it", "love it" doesn't;
    a multi-syllable rhyme matches vowel for vowel, with the same stresses, from its first
    stressed syllable to the end;
  - lines that answer each other must match their syllable stresses exactly (the key thing for
    MiniMax).
Vowels are General American (CMU). Stress: 1 primary, 2 secondary, 0 unstressed; one-syllable
function words count as 0. Words CMU lacks go in prosody.py's LEXICON (stress) and SPELL here.

  python music/check/rhyme.py rhyme "see it" "leave it" "love it"
      each phrase's rhyme tail (from its last primary stress), and a verdict against the first
  python music/check/rhyme.py rhyme --from 2 "code it, load it" "show it, know it"
      compare from the 2nd-to-last stressed syllable (for multi-syllable rhymes)
  python music/check/rhyme.py lines "you TELL me WHEN it's WRONG" "you KNOW it WHEN you SEE it"
      each line's marked stresses (capitals; split syllables with hyphens, "NEV-er"), whether
      they match the first line's exactly, and any mark that fights a word's own stress. The
      dictionary stresses every one-syllable word, so which of those take the beat is the
      writer's call; for longer words it knows, and the check holds the marks to it.
"""
import re
import sys

import pronouncing

from prosody import FUNCTION, LEXICON

# Pronunciations for words CMU lacks, as CMU phones.
SPELL = {
    "clawd": "K L AO1 D", "clawds": "K L AO1 D Z", "vibecoder": "V AY1 B K OW2 D ER0",
    "mockup": "M AA1 K AH2 P", "gcc": "JH IY1 S IY1 S IY1",
    "bests": "B EH1 S T S", "weighins": "W EY1 IH2 N Z",
}
STRESSLESS = FUNCTION | set("a the it its to you your me my i i'm".split())


def syllables(phrase):
    """[(word, vowel, stress)] for each syllable in the phrase."""
    out = []
    words = re.findall(r"[a-z0-9']+", phrase.lower())
    for w in words:
        phones = SPELL.get(w) or (pronouncing.phones_for_word(w) or [None])[0]
        if phones is None:
            raise KeyError(f"no pronunciation for '{w}': add it to SPELL")
        vowels = [p for p in phones.split() if p[-1].isdigit()]
        stresses = LEXICON.get(w)
        if stresses and len(stresses) < len(vowels):  # sung shorter: "every" is EV-ry
            vowels = vowels[:1] + vowels[len(vowels) - len(stresses) + 1:]
        for k, v in enumerate(vowels):
            s = stresses[k] if stresses and k < len(stresses) else v[-1]
            if len(vowels) == 1 and w in STRESSLESS and len(words) > 1:
                s = "0"
            out.append((w, v[:-1], s))
    return out


def tail(phrase, from_stress=1):
    """Syllables from the from_stress-th primary-stressed syllable counting from the end."""
    syl = syllables(phrase)
    stressed = [k for k, (_, _, s) in enumerate(syl) if s == "1"]
    if len(stressed) < from_stress:
        return syl
    return syl[stressed[-from_stress]:]


def show(syl):
    return " ".join(f"{v}{'ˈ' if s == '1' else 'ˌ' if s == '2' else ''}" for _, v, s in syl)


def rhyme(args):
    from_stress = 1
    if args[:1] == ["--from"]:
        from_stress, args = int(args[1]), args[2:]
    ref = tail(args[0], from_stress)
    for phrase in args:
        t = tail(phrase, from_stress)
        vowels_match = [v for _, v, _ in t] == [v for _, v, _ in ref]
        stress_match = [s != "0" for _, _, s in t] == [s != "0" for _, _, s in ref]
        verdict = ("rhymes" if vowels_match and stress_match
                   else "vowels match, stresses differ" if vowels_match
                   else "NO: vowels differ")
        print(f"{phrase:32} {show(t):24} {'(reference)' if phrase is args[0] else verdict}")


def marked(line):
    """The line's syllables as the writer marked them: syllables split by hyphens, stressed ones
    in capitals (one-syllable words: capitalise the word). Returns (pattern, warnings)."""
    pattern, warnings = "", []
    for w in re.findall(r"[A-Za-z0-9'-]+", line):
        pieces = [x for x in w.split("-") if x]
        word = "".join(pieces).lower()
        n = len(syllables(word))
        if len(pieces) == 1 and n > 1:
            # a whole word: capitals mean its dictionary stress; lower case means unstressed
            dict_stress = "".join("S" if s == "1" else "x" for _, _, s in syllables(word))
            pattern += dict_stress if pieces[0].isupper() else "x" * n
            continue
        if len(pieces) != n:
            warnings.append(f"'{w}': {len(pieces)} marked syllables, the dictionary has {n}")
        marks = "".join("S" if x.isupper() and x.lower() != "i" or x in ("I'M", "I'LL") else "x"
                        for x in pieces)
        if n > 1 and len(pieces) == n:
            dict_stress = [s for _, _, s in syllables(word)]
            for k, m in enumerate(marks):
                if m == "S" and dict_stress[k] == "0":
                    warnings.append(f"'{w}': stress on a syllable the word doesn't stress")
        pattern += marks
    return pattern, warnings


def lines(args):
    """Compare the writer's marked stresses across lines that answer each other."""
    ref, _ = marked(args[0])
    for line in args:
        p, warnings = marked(line)
        mark = "(reference)" if line is args[0] else "exact" if p == ref else "DIFFERS"
        print(f"{len(p):3} {p:22} {mark:11} {line}")
        for w in warnings:
            print(f"    ! {w}")


if __name__ == "__main__":
    mode, rest = sys.argv[1], sys.argv[2:]
    {"rhyme": rhyme, "lines": lines}[mode](rest)
