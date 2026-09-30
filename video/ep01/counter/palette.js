// "The Counter": the palette. Two flat inks and a manila ground, so every shot is a print.
//
// Everything in the film is drawn with these. Ground first, then the heavy outline ink, then the
// accent, then the cool ink for the overprint where two inks cross.

export const P = {
  // the ground: manila board
  paper: '#e6d6b4',
  paperLit: '#f0e3c6',
  paperDim: '#d3bf97',
  paperDeep: '#bda476',

  // ink 1: the heavy warm black, all the outlines and the letterforms
  ink: '#241c17',
  inkSoft: '#4a3d33',

  // ink 2: the stamp ink, oxblood
  ox: '#8f2f22',
  oxDeep: '#6d2018',
  oxSoft: '#b1553f',

  // ink 3: the cool one, for the far side of the counter and the overprint
  petrol: '#1e4a55',
  petrolDeep: '#153741',
  petrolSoft: '#4d818a',

  // the rare fourth, for the one warm thing: the light in the window at the end
  lamp: '#e8a33d',
  lampSoft: '#f3cf8d',
};

// Where the two inks cross, the press prints both: a third colour that exists nowhere else.
export function overprint(a, b) {
  if ((a === P.ox || a === P.oxDeep || a === P.oxSoft) && (b === P.petrol || b === P.petrolDeep)) return '#5d2a2c';
  if ((a === P.petrol || b === P.petrol) && (b === P.ox || a === P.ox)) return '#5d2a2c';
  return null;
}

export const markColor = P.ink;