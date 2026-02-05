/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIContentAnalyticsDashboard from './pages/AIContentAnalyticsDashboard';
import AICreatorAnalyticsDashboard from './pages/AICreatorAnalyticsDashboard';
import AICreatorAssistant from './pages/AICreatorAssistant';
import AICreatorStudio from './pages/AICreatorStudio';
import AIDebate from './pages/AIDebate';
import AIMentor from './pages/AIMentor';
import AIStudentAssistant from './pages/AIStudentAssistant';
import AITools from './pages/AITools';
import AITutor from './pages/AITutor';
import AdaptiveLearning from './pages/AdaptiveLearning';
import AdaptivePathViewer from './pages/AdaptivePathViewer';
import AdvancedAITutor from './pages/AdvancedAITutor';
import AdvancedCreatorTools from './pages/AdvancedCreatorTools';
import B2BClientDashboard from './pages/B2BClientDashboard';
import Billing from './pages/Billing';
import CareerPathing from './pages/CareerPathing';
import CollaborationHub from './pages/CollaborationHub';
import CollaborativeGamification from './pages/CollaborativeGamification';
import CommunityAIHub from './pages/CommunityAIHub';
import CommunityForum from './pages/CommunityForum';
import CommunityHub from './pages/CommunityHub';
import CompetitiveLeaderboards from './pages/CompetitiveLeaderboards';
import ContentDiscovery from './pages/ContentDiscovery';
import CourseCreator from './pages/CourseCreator';
import CourseDiscovery from './pages/CourseDiscovery';
import CourseDiscussions from './pages/CourseDiscussions';
import CourseEditor from './pages/CourseEditor';
import CourseOverview from './pages/CourseOverview';
import CourseSummary from './pages/CourseSummary';
import CourseVersioning from './pages/CourseVersioning';
import CourseViewer from './pages/CourseViewer';
import CreateCourse from './pages/CreateCourse';
import CreatorAIAssistant from './pages/CreatorAIAssistant';
import CreatorAnalytics from './pages/CreatorAnalytics';
import CreatorAnalyticsAdvanced from './pages/CreatorAnalyticsAdvanced';
import CreatorEarnings from './pages/CreatorEarnings';
import DailyChallenges from './pages/DailyChallenges';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import DynamicOutline from './pages/DynamicOutline';
import DynamicSkillMap from './pages/DynamicSkillMap';
import EngineOfInsight from './pages/EngineOfInsight';
import EnhancedContentCreator from './pages/EnhancedContentCreator';
import EnhancedCourseCreator from './pages/EnhancedCourseCreator';
import EnhancedCourseViewer from './pages/EnhancedCourseViewer';
import EnhancedCreatorAnalytics from './pages/EnhancedCreatorAnalytics';
import EnhancedInstructorAnalytics from './pages/EnhancedInstructorAnalytics';
import EnhancedInstructorDashboard from './pages/EnhancedInstructorDashboard';
import EnterpriseAdmin from './pages/EnterpriseAdmin';
import GamificationDashboard from './pages/GamificationDashboard';
import GamificationHub from './pages/GamificationHub';
import Home from './pages/Home';
import InstructorAITools from './pages/InstructorAITools';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorDashboard from './pages/InstructorDashboard';
import LandingPage from './pages/LandingPage';
import LearningComparison from './pages/LearningComparison';
import LearningPaths from './pages/LearningPaths';
import LearningWrapped from './pages/LearningWrapped';
import LiveVideoSessions from './pages/LiveVideoSessions';
import MyCourses from './pages/MyCourses';
import OfflineCourses from './pages/OfflineCourses';
import Onboarding from './pages/Onboarding';
import OnboardingFlow from './pages/OnboardingFlow';
import OrganizationAnalytics from './pages/OrganizationAnalytics';
import PWASettings from './pages/PWASettings';
import PersonalEnergyHub from './pages/PersonalEnergyHub';
import PersonalizedLearningPath from './pages/PersonalizedLearningPath';
import PersonalizedLearningSystem from './pages/PersonalizedLearningSystem';
import Profile from './pages/Profile';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import SkillGapReport from './pages/SkillGapReport';
import Storefront from './pages/Storefront';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentGamification from './pages/StudentGamification';
import StudentLearningPath from './pages/StudentLearningPath';
import StudentPortfolio from './pages/StudentPortfolio';
import StudyDashboard from './pages/StudyDashboard';
import StudyGroups from './pages/StudyGroups';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import TeamPulseDashboard from './pages/TeamPulseDashboard';
import TimeCapsule from './pages/TimeCapsule';
import Whiteboard from './pages/Whiteboard';
import WorkplaceHub from './pages/WorkplaceHub';
import AIContentStudio from './pages/AIContentStudio';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIContentAnalyticsDashboard": AIContentAnalyticsDashboard,
    "AICreatorAnalyticsDashboard": AICreatorAnalyticsDashboard,
    "AICreatorAssistant": AICreatorAssistant,
    "AICreatorStudio": AICreatorStudio,
    "AIDebate": AIDebate,
    "AIMentor": AIMentor,
    "AIStudentAssistant": AIStudentAssistant,
    "AITools": AITools,
    "AITutor": AITutor,
    "AdaptiveLearning": AdaptiveLearning,
    "AdaptivePathViewer": AdaptivePathViewer,
    "AdvancedAITutor": AdvancedAITutor,
    "AdvancedCreatorTools": AdvancedCreatorTools,
    "B2BClientDashboard": B2BClientDashboard,
    "Billing": Billing,
    "CareerPathing": CareerPathing,
    "CollaborationHub": CollaborationHub,
    "CollaborativeGamification": CollaborativeGamification,
    "CommunityAIHub": CommunityAIHub,
    "CommunityForum": CommunityForum,
    "CommunityHub": CommunityHub,
    "CompetitiveLeaderboards": CompetitiveLeaderboards,
    "ContentDiscovery": ContentDiscovery,
    "CourseCreator": CourseCreator,
    "CourseDiscovery": CourseDiscovery,
    "CourseDiscussions": CourseDiscussions,
    "CourseEditor": CourseEditor,
    "CourseOverview": CourseOverview,
    "CourseSummary": CourseSummary,
    "CourseVersioning": CourseVersioning,
    "CourseViewer": CourseViewer,
    "CreateCourse": CreateCourse,
    "CreatorAIAssistant": CreatorAIAssistant,
    "CreatorAnalytics": CreatorAnalytics,
    "CreatorAnalyticsAdvanced": CreatorAnalyticsAdvanced,
    "CreatorEarnings": CreatorEarnings,
    "DailyChallenges": DailyChallenges,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "DynamicOutline": DynamicOutline,
    "DynamicSkillMap": DynamicSkillMap,
    "EngineOfInsight": EngineOfInsight,
    "EnhancedContentCreator": EnhancedContentCreator,
    "EnhancedCourseCreator": EnhancedCourseCreator,
    "EnhancedCourseViewer": EnhancedCourseViewer,
    "EnhancedCreatorAnalytics": EnhancedCreatorAnalytics,
    "EnhancedInstructorAnalytics": EnhancedInstructorAnalytics,
    "EnhancedInstructorDashboard": EnhancedInstructorDashboard,
    "EnterpriseAdmin": EnterpriseAdmin,
    "GamificationDashboard": GamificationDashboard,
    "GamificationHub": GamificationHub,
    "Home": Home,
    "InstructorAITools": InstructorAITools,
    "InstructorAnalytics": InstructorAnalytics,
    "InstructorDashboard": InstructorDashboard,
    "LandingPage": LandingPage,
    "LearningComparison": LearningComparison,
    "LearningPaths": LearningPaths,
    "LearningWrapped": LearningWrapped,
    "LiveVideoSessions": LiveVideoSessions,
    "MyCourses": MyCourses,
    "OfflineCourses": OfflineCourses,
    "Onboarding": Onboarding,
    "OnboardingFlow": OnboardingFlow,
    "OrganizationAnalytics": OrganizationAnalytics,
    "PWASettings": PWASettings,
    "PersonalEnergyHub": PersonalEnergyHub,
    "PersonalizedLearningPath": PersonalizedLearningPath,
    "PersonalizedLearningSystem": PersonalizedLearningSystem,
    "Profile": Profile,
    "SkillGapAnalysis": SkillGapAnalysis,
    "SkillGapReport": SkillGapReport,
    "Storefront": Storefront,
    "StudentAnalytics": StudentAnalytics,
    "StudentGamification": StudentGamification,
    "StudentLearningPath": StudentLearningPath,
    "StudentPortfolio": StudentPortfolio,
    "StudyDashboard": StudyDashboard,
    "StudyGroups": StudyGroups,
    "SubscriptionSuccess": SubscriptionSuccess,
    "TeamPulseDashboard": TeamPulseDashboard,
    "TimeCapsule": TimeCapsule,
    "Whiteboard": Whiteboard,
    "WorkplaceHub": WorkplaceHub,
    "AIContentStudio": AIContentStudio,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};