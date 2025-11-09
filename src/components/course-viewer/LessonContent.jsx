
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import QuizView from './QuizView';
import ProjectSubmission from './ProjectSubmission';

export default function LessonContent({ lesson, onQuizComplete, progress }) {
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Adjusted to use 'progress' prop instead of 'enrollment'
  const lessonProgress = progress?.progress?.find(p => p.lesson_order === lesson.order);
  const quizTaken = lessonProgress && typeof lessonProgress.quiz_score === 'number';

  // If there's a quiz and it hasn't been taken yet, automatically show it.
  // Otherwise, only show it if the user clicks.
  const shouldShowQuizInitially = lesson.quiz && !quizTaken;
  
  // Use a derived state from the initial condition to avoid re-renders.
  const [isQuizVisible, setIsQuizVisible] = useState(shouldShowQuizInitially);
  
  React.useEffect(() => {
    // Reset quiz visibility when lesson changes
    // Check if the lesson has a quiz, and if it hasn't been taken yet
    const currentLessonQuizTaken = progress?.progress?.find(p => p.lesson_order === lesson.order)?.quiz_score !== undefined;
    setShowQuiz(lesson.quiz && !currentLessonQuizTaken); // This state `showQuiz` is actually not used anywhere, `isQuizVisible` is.
    setIsQuizVisible(lesson.quiz && !currentLessonQuizTaken); // Ensure isQuizVisible also resets.
  }, [lesson.order, lesson.quiz, progress]); // Dependency array updated to include progress

  return (
    <div className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-lg"> {/* Replaces original div with Card styling */}
      <div className="space-y-6 p-6"> {/* Added padding to the content inside the card */}
        <h1 className="text-3xl font-bold text-slate-800">{lesson.title}</h1>
        <div 
          className="prose prose-lg max-w-none prose-slate"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* Project Section */}
      {lesson.project && (
        <div className="mt-8 pt-8 border-t px-6"> {/* Added padding-x for consistency */}
          <ProjectSubmission 
            lesson={lesson}
            enrollmentId={progress?.enrollment_id}
            onSubmissionComplete={() => {
              // Reload or update progress
              if (onQuizComplete) {
                // Assuming project submission counts as passing, score 100
                onQuizComplete({ passed: true, score: 100 }); 
              }
            }}
          />
        </div>
      )}

      {/* Quiz Section */}
      {lesson.quiz && (
        <div className="mt-8 pt-8 border-t px-6 pb-6"> {/* Added padding-x and padding-bottom for consistency */}
          {isQuizVisible ? (
            <QuizView 
              quiz={lesson.quiz}
              onComplete={onQuizComplete}
              lessonProgress={lessonProgress}
            />
          ) : (
            <div className="text-center">
              <button 
                onClick={() => setIsQuizVisible(true)}
                className="bg-amber-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-amber-600 transition-colors"
              >
                {quizTaken ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
