// Owner, 2026-11-01 (DESIGN-QA.md section 5): the Altitude Care numbers and the "Certified" line go until the owner confirms them.
// The case study keeps the problem and the work done, in words.
const POST_PAIRS = [
  ['Page load speed 4.8s', 'Page load speed Slow'],
  ['Page load speed 1.9s', 'Page load speed Optimized'],
  ['Downtime ~0%', 'Downtime Reduced'],
];

export const CLAIM_CHANGES = {
  '/': [
    ['4.8s1.9s', ''],
    ['<strong>4.8s</strong> <span>1.9s</span>', '<strong>Slow</strong> <span>Optimized</span>'],
    ['<strong>Often</strong> <span>~0%</span>', '<strong>Often</strong> <span>Reduced</span>'],
    ['it was slow (4.8s loads), had', 'it was slow, had'],
    ['## Real Maintenance Results, Backed by Numbers', '## Real Maintenance Results'],
    ['Certified, experienced team', 'Experienced team'],
  ],
  '/website-maintenance-case-study/': [
    ['4.8 seconds average load time, causing high bounce rates.', 'Slow load times, causing high bounce rates.'],
    ['### Speed Optimization (4.8s → 1.9s)', '### Speed Optimization'],
    ['    4.8s', '    Slow'],
    ['    1.9s', '    Optimized'],
    ['    Near 0%', '    Reduced'],
  ],
  '/best-fixrunner-alternatives/': [...POST_PAIRS, ['### Real results, backed by numbers', '### Real results']],
  '/best-wp-buffs-alternatives/': [...POST_PAIRS, ['### Real results, backed by numbers', '### Real results']],
  '/sitecare-alternative/': POST_PAIRS,
};
