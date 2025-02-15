export async function fetchAllFeatures() {
    try {
      const response = await fetch("https://staging.api.clearsky.services/api/v1/anon/features/");
      if (!response.ok) throw new Error("Failed to fetch features");
      return await response.json();
    } catch (error) {
      console.error("Error fetching features:", error);
      return {};
    }
  }
  
  export async function fetchFeature(featureName) {
    try {
      const response = await fetch(`https://staging.api.clearsky.services/api/v1/anon/features/${featureName}`);
      if (!response.ok) throw new Error("Failed to fetch feature");
      return await response.json();
    } catch (error) {
      console.error(`Error fetching feature ${featureName}:`, error);
      return {};
    }
  }
  