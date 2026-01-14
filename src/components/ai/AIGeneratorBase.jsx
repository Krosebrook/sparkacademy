import React from "react";

/**
 * Base hook for AI generation components
 * Reduces code duplication across CourseOutlineGenerator, LessonContentDrafter, QuizQuestionSuggester
 */
export const useAIGeneration = (initialState = null) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [result, setResult] = React.useState(initialState);
  const [error, setError] = React.useState(null);

  const generateContent = async (generatorFn) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generatorFn();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || "Generation failed");
      console.error("Generation error:", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, result, error, setResult, generateContent };
};

/**
 * Utility to copy content to clipboard
 */
export const copyToClipboard = (data, format = "json") => {
  try {
    const content = format === "json" ? JSON.stringify(data, null, 2) : data;
    navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
};