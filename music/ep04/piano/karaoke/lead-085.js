// The piano take's timing check with each word lit 85 ms before its measured onset, the lead
// Qing chose for episode 2 (2026-09-28: "between a and b [...] maybe 80-90").
import { setLead } from './main.js';
export * from './main.js';
setLead(0.085, 'words lead the voice by 85 ms');
