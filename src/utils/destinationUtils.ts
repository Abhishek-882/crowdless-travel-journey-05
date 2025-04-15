import { CrowdData } from '../types';

// Define a type for enhanced crowd data that includes premium insights
export interface EnhancedCrowdData extends CrowdData {
  premiumInsights?: {
    bestPhotoSpots: string[];
    secretEntrances: string[];
    localTips: string[];
  };
}

// Function to enhance crowd data with premium insights
export const getEnhancedCrowdData = (destinationId: string, crowdData: CrowdData): CrowdData => {
  // Create a new object with the crowd data
  const enhancedData: Record<string, number> = { ...crowdData };
  
  // Add premium insights as a separate object (not directly to the CrowdData)
  const premiumInfo = {
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
  
  // Return only the enhanced crowd data
  return enhancedData;
};

// Get the premium insights separately
export const getPremiumInsights = (destinationId: string) => {
  return {
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
};
