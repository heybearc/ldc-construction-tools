// Shared Trade Team configuration for icons and colors
// Used across Trade Teams dashboard and Project Schedule calendar

export const TRADE_TEAM_CONFIG: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  'Electrical': { 
    icon: '⚡', 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-100', 
    borderColor: 'border-yellow-300' 
  },
  'Exteriors': { 
    icon: '🏠', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100', 
    borderColor: 'border-orange-300' 
  },
  'Interiors': { 
    icon: '🏡', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100', 
    borderColor: 'border-purple-300' 
  },
  'Mechanical': { 
    icon: '⚙️', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100', 
    borderColor: 'border-gray-300' 
  },
  'Plumbing': { 
    icon: '🔧', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100', 
    borderColor: 'border-blue-300' 
  },
  'Site Support': { 
    icon: '🏗️', 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100', 
    borderColor: 'border-amber-300' 
  },
  'Sitework/Civil': { 
    icon: '🚧', 
    color: 'text-stone-700', 
    bgColor: 'bg-stone-100', 
    borderColor: 'border-stone-300' 
  },
  'Structural': { 
    icon: '🏗️', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-300' 
  },
};

export const getTradeTeamConfig = (teamName: string) => {
  return TRADE_TEAM_CONFIG[teamName] || { 
    icon: '👷', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100', 
    borderColor: 'border-gray-300' 
  };
};

export const getTradeTeamIcon = (teamName: string): string => {
  return TRADE_TEAM_CONFIG[teamName]?.icon || '👷';
};
