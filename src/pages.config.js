import Dashboard from './pages/Dashboard';
import CourseCreator from './pages/CourseCreator';
import Storefront from './pages/Storefront';
import MyCourses from './pages/MyCourses';
import CourseEditor from './pages/CourseEditor';
import Profile from './pages/Profile';
import CourseViewer from './pages/CourseViewer';
import AITutor from './pages/AITutor';
import AITools from './pages/AITools';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import CourseDiscussions from './pages/CourseDiscussions';
import LearningPaths from './pages/LearningPaths';
import CreatorAnalytics from './pages/CreatorAnalytics';
import TimeCapsule from './pages/TimeCapsule';
import LearningWrapped from './pages/LearningWrapped';
import Whiteboard from './pages/Whiteboard';
import AIDebate from './pages/AIDebate';
import LandingPage from './pages/LandingPage';
import Billing from './pages/Billing';
import StudentAnalytics from './pages/StudentAnalytics';
import CreateCourse from './pages/CreateCourse';
import DynamicOutline from './pages/DynamicOutline';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseSummary from './pages/CourseSummary';
import GamificationDashboard from './pages/GamificationDashboard';
import CourseOverview from './pages/CourseOverview';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CourseCreator": CourseCreator,
    "Storefront": Storefront,
    "MyCourses": MyCourses,
    "CourseEditor": CourseEditor,
    "Profile": Profile,
    "CourseViewer": CourseViewer,
    "AITutor": AITutor,
    "AITools": AITools,
    "SubscriptionSuccess": SubscriptionSuccess,
    "CourseDiscussions": CourseDiscussions,
    "LearningPaths": LearningPaths,
    "CreatorAnalytics": CreatorAnalytics,
    "TimeCapsule": TimeCapsule,
    "LearningWrapped": LearningWrapped,
    "Whiteboard": Whiteboard,
    "AIDebate": AIDebate,
    "LandingPage": LandingPage,
    "Billing": Billing,
    "StudentAnalytics": StudentAnalytics,
    "CreateCourse": CreateCourse,
    "DynamicOutline": DynamicOutline,
    "SkillGapAnalysis": SkillGapAnalysis,
    "InstructorDashboard": InstructorDashboard,
    "CourseSummary": CourseSummary,
    "GamificationDashboard": GamificationDashboard,
    "CourseOverview": CourseOverview,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};