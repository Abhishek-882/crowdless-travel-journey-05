export interface EnhancedCrowdData {
  [key: string]: number; // regular crowd data
  premiumInsights?: {
    bestPhotoSpots: string[];
    secretEntrances: string[];
    localTips: string[];
  };
}

export const getEnhancedCrowdData = (destinationId: string, crowdData: Record<string, number>): EnhancedCrowdData => {
  const enhanced: EnhancedCrowdData = { ...crowdData };
  
  // Add premium insights
  enhanced.premiumInsights = {
    bestPhotoSpots: [
      "Northwest corner at sunrise",
      "Main courtyard in late afternoon"
    ],
    secretEntrances: [
      "South gate - 40% less crowded in mornings"
    ],
    localTips: [
      `Visit early morning for fewer crowds`
    ]
  };
  
  return enhanced;
};
