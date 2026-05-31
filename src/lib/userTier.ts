export const TIERS = {
  free: {
    expandedChart:    false,
    aiSummary:        false,
    cotData:          true,
    newsHeadlines:    false,
    morningReport:    false,
    sessionBriefing:  false,
    etfFlow:          false,
    fearGreed:        true,
    keyLevels:        true,
  },
  standard: {
    expandedChart:    true,
    aiSummary:        true,
    cotData:          true,
    newsHeadlines:    true,
    morningReport:    true,
    sessionBriefing:  false,
    etfFlow:          true,
    fearGreed:        true,
    keyLevels:        true,
  },
  pro: {
    expandedChart:    true,
    aiSummary:        true,
    cotData:          true,
    newsHeadlines:    true,
    morningReport:    true,
    sessionBriefing:  true,
    etfFlow:          true,
    fearGreed:        true,
    keyLevels:        true,
  },
} as const;

type Tier    = keyof typeof TIERS;
type Feature = keyof typeof TIERS.pro;

// Hardcoded pro — scaffold for when the app goes public
const CURRENT_TIER: Tier = "pro";

export function hasAccess(feature: Feature): boolean {
  return TIERS[CURRENT_TIER][feature];
}

export function getCurrentTier(): Tier {
  return CURRENT_TIER;
}
