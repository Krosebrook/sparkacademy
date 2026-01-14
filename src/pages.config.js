import AIDebate from './pages/AIDebate';
import AIMentor from './pages/AIMentor';
import AITools from './pages/AITools';
import AITutor from './pages/AITutor';
import AdaptiveLearning from './pages/AdaptiveLearning';
import Billing from './pages/Billing';
import CareerPathing from './pages/CareerPathing';
import CommunityHub from './pages/CommunityHub';
import ContentDiscovery from './pages/ContentDiscovery';
import CourseCreator from './pages/CourseCreator';
import CourseDiscussions from './pages/CourseDiscussions';
import CourseEditor from './pages/CourseEditor';
import CourseOverview from './pages/CourseOverview';
import CourseSummary from './pages/CourseSummary';
import CourseViewer from './pages/CourseViewer';
import CreateCourse from './pages/CreateCourse';
import CreatorAnalytics from './pages/CreatorAnalytics';
import DailyChallenges from './pages/DailyChallenges';
import Dashboard from './pages/Dashboard';
import DynamicOutline from './pages/DynamicOutline';
import EnhancedCourseCreator from './pages/EnhancedCourseCreator';
// Safe refactor: Lazy load large pages (430 lines) to reduce initial bundle size
// Uses React.lazy() for code splitting without changing functionality
import { lazy } from 'react';
const EnhancedInstructorAnalytics = lazy(() => import('./pages/EnhancedInstructorAnalytics'));
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import GamificationDashboard from './pages/GamificationDashboard';
import Home from './pages/Home';
import InstructorAITools from './pages/InstructorAITools';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorDashboard from './pages/InstructorDashboard';
// Safe refactor: Lazy load large pages (451 lines) to reduce initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
import LearningPaths from './pages/LearningPaths';
import LearningWrapped from './pages/LearningWrapped';
import MyCourses from './pages/MyCourses';
import OfflineCourses from './pages/OfflineCourses';
import PWASettings from './pages/PWASettings';
// Safe refactor: Lazy load large pages (444 lines) to reduce initial bundle size
const PersonalizedLearningPath = lazy(() => import('./pages/PersonalizedLearningPath'));
import Profile from './pages/Profile';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import SkillGapReport from './pages/SkillGapReport';
import Storefront from './pages/Storefront';
import StudentAnalytics from './pages/StudentAnalytics';
import StudyGroups from './pages/StudyGroups';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import TimeCapsule from './pages/TimeCapsule';
import Whiteboard from './pages/Whiteboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIDebate": AIDebate,
    "AIMentor": AIMentor,
    "AITools": AITools,
    "AITutor": AITutor,
    "AdaptiveLearning": AdaptiveLearning,
    "Billing": Billing,
    "CareerPathing": CareerPathing,
    "CommunityHub": CommunityHub,
    "ContentDiscovery": ContentDiscovery,
    "CourseCreator": CourseCreator,
    "CourseDiscussions": CourseDiscussions,
    "CourseEditor": CourseEditor,
    "CourseOverview": CourseOverview,
    "CourseSummary": CourseSummary,
    "CourseViewer": CourseViewer,
    "CreateCourse": CreateCourse,
    "CreatorAnalytics": CreatorAnalytics,
    "DailyChallenges": DailyChallenges,
    "Dashboard": Dashboard,
    "DynamicOutline": DynamicOutline,
    "EnhancedCourseCreator": EnhancedCourseCreator,
    "EnhancedInstructorAnalytics": EnhancedInstructorAnalytics,
    "EnterpriseDashboard": EnterpriseDashboard,
    "GamificationDashboard": GamificationDashboard,
    "Home": Home,
    "InstructorAITools": InstructorAITools,
    "InstructorAnalytics": InstructorAnalytics,
    "InstructorDashboard": InstructorDashboard,
    "LandingPage": LandingPage,
    "LearningPaths": LearningPaths,
    "LearningWrapped": LearningWrapped,
    "MyCourses": MyCourses,
    "OfflineCourses": OfflineCourses,
    "PWASettings": PWASettings,
    "PersonalizedLearningPath": PersonalizedLearningPath,
    "Profile": Profile,
    "SkillGapAnalysis": SkillGapAnalysis,
    "SkillGapReport": SkillGapReport,
    "Storefront": Storefront,
    "StudentAnalytics": StudentAnalytics,
    "StudyGroups": StudyGroups,
    "SubscriptionSuccess": SubscriptionSuccess,
    "TimeCapsule": TimeCapsule,
    "Whiteboard": Whiteboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};