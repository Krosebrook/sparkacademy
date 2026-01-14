import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook to fetch and manage creator points data
 * Consolidates points loading logic
 */
export const useCreatorPoints = (creatorEmail) => {
  const [pointsData, setPointsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!creatorEmail) {
      setIsLoading(false);
      return;
    }

    loadPointsData();
  }, [creatorEmail]);

  const loadPointsData = async () => {
    try {
      const data = await base44.entities.CreatorPoints.filter({ creator_email: creatorEmail });
      setPointsData(data.length > 0 ? data[0] : null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error loading points data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await loadPointsData();
  };

  return { pointsData, isLoading, error, refetch };
};