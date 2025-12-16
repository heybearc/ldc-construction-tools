// Standard LDC Trade Teams - created automatically for each Construction Group
export const STANDARD_TRADE_TEAMS = [
  {
    name: 'Electrical',
    description: 'Electrical systems installation and maintenance',
    icon: '⚡'
  },
  {
    name: 'Exteriors',
    description: 'Exterior finishing, siding, roofing, and weatherproofing',
    icon: '🏠'
  },
  {
    name: 'Interiors',
    description: 'Interior finishing, drywall, painting, and trim work',
    icon: '🏡'
  },
  {
    name: 'Mechanical',
    description: 'HVAC systems and mechanical equipment installation',
    icon: '⚙️'
  },
  {
    name: 'Plumbing',
    description: 'Plumbing systems installation and maintenance',
    icon: '🔧'
  },
  {
    name: 'Site Support',
    description: 'General site support, logistics, and material handling',
    icon: '🏗️'
  },
  {
    name: 'Sitework/Civil',
    description: 'Site preparation, grading, and civil infrastructure',
    icon: '🚧'
  },
  {
    name: 'Structural',
    description: 'Structural framing, concrete, and foundation work',
    icon: '🏗️'
  }
];

export type StandardTradeTeam = typeof STANDARD_TRADE_TEAMS[number];
