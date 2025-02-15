import { createContext, useState, useEffect, useContext } from "react";
import { fetchAllFeatures } from "../api/featureFlags";

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children }) => {
  const [features, setFeatures] = useState({});

  useEffect(() => {
    async function getFeatures() {
      const data = await fetchAllFeatures();
      setFeatures(data);
    }
    getFeatures();
  }, []);

  return (
    <FeatureFlagContext.Provider value={features}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
