// The palette. Inside the mirror box everything is black glass, chrome and haze, and the only
// colours are the band's own lights: one colour per member, so you can always tell who's who.
// Outside is daylight: warm, full colour, the users' world. The light that comes in through the
// cut words is that daylight.
export const P = {
  void: '#030407', ink: '#0b0d13', glass0: '#07090e', glass: '#10141c', glass2: '#1b2230', glass3: '#2b3547',
  chrome: '#9ba7b9', chrome2: '#5d6879', chromeHi: '#eef3f8',
  haze: '#1c2436', edge: '#7fd6c8',      // a mirror's cut edge shows the glass's own green
  day: '#fff4dd', day2: '#ffe2b0', sun: '#fffaf0',
};

// The band. Each member's colour is his stage light, his instrument's glow, his brief's tint and
// his lettering's laser.
export const BAND = {
  clawd: { name: 'CLAWD', role: 'VOCALS', col: '#ff8a5c', deep: '#b8452c', brief: 3 },
  regex: { name: 'REGEX', role: 'GUITAR', col: '#2ee6ff', deep: '#0b7f9c', brief: 0 },
  cron: { name: 'CRON', role: 'DRUMS', col: '#bdff3f', deep: '#5f8f12', brief: 1 },
  null: { name: 'NULL', role: 'BASS', col: '#a57bff', deep: '#5a36b8', brief: 2 },
};

// Clawd's own colours: the mascot's terracotta, never recoloured.
export const CLAWD = {
  body: '#d97757', shade: '#6e3130', deep: '#3d1a1f', lit: '#f19a76', line: '#1d0d0c', eye: '#120c0d',
};

// The four briefs, in the order the song visits them, each kept by one member.
export const BRIEFS = [
  { n: 1, who: 'regex', place: "ROSA'S BAKERY", app: 'THE CHECKOUT' },
  { n: 2, who: 'cron', place: 'THE CLINIC', app: 'THE BOOKING SITE' },
  { n: 3, who: 'null', place: 'PARKSIDE SCHOOL', app: 'THE FEEDBACK APP' },
  { n: 4, who: 'clawd', place: "JESS'S WEDDING", app: 'THE SEATING PLAN' },
];
