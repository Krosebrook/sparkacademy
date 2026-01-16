// Custom hook for fetching creator's courses
// Handles user authentication and course filtering
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useCreatorCourses() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['creator-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user.email }),
    enabled: !!user
  });

  return { user, courses, isLoading };
}