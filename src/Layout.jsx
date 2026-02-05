import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
              BookOpen,
              LayoutDashboard,
              PlusCircle,
              Library,
              Store,
              User,
              LogOut,
              Bot,
              Home,
              Wand2,
              CreditCard,
              BarChart3,
              Download,
              Gift,
              Video,
              Users,
            } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/common/BrandLogo";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview"
  },
  {
    title: "Create Course",
    url: createPageUrl("CourseCreator"),
    icon: PlusCircle,
    description: "AI-Powered"
  },
  {
    title: "My Courses",
    url: createPageUrl("MyCourses"),
    icon: Library,
    description: "Manage"
  },
  {
    title: "Live Sessions",
    url: createPageUrl("LiveVideoSessions"),
    icon: Video,
    description: "Video & Q&A"
  },
  {
    title: "Student Analytics",
    url: createPageUrl("StudentAnalytics"),
    icon: BarChart3,
    description: "Track Progress"
  },
  {
    title: "AI Tutor",
    url: createPageUrl("AdvancedAITutor"),
    icon: Bot,
    description: "Get Help"
  },
  {
    title: "AI Tools",
    url: createPageUrl("AITools"),
    icon: Wand2,
    description: "Notes & Resume"
  },
  {
    title: "Earnings & Rewards",
    url: createPageUrl("CreatorEarnings"),
    icon: Gift,
    description: "Points & Catalog"
  },
  {
    title: "My Storefront",
    url: createPageUrl("Storefront"),
    icon: Store,
    description: "Your Shop"
  },
  {
    title: "Offline Learning",
    url: createPageUrl("OfflineCourses"),
    icon: Download,
    description: "Downloaded"
  },
  {
    title: "Community AI",
    url: createPageUrl("CommunityAIHub"),
    icon: Users,
    description: "AI Insights"
  },
  {
    title: "AI Creator Studio",
    url: createPageUrl("AICreatorStudio"),
    icon: Wand2,
    description: "Course Tools"
  },
  {
    title: "Study Dashboard",
    url: createPageUrl("StudyDashboard"),
    icon: BookOpen,
    description: "AI Learning"
  },

  {
    title: "Instructor Tools",
    url: createPageUrl("EnhancedInstructorDashboard"),
    icon: BarChart3,
    description: "Analytics"
  },
  {
    title: "B2B Client Analytics",
    url: createPageUrl("B2BClientDashboard"),
    icon: BarChart3,
    description: "Enterprise Insights"
  },
  {
    title: "Engine of Insight",
    url: createPageUrl("EngineOfInsight"),
    icon: BarChart3,
    description: "Neural Analytics"
  },
  {
    title: "Community Forum",
    url: createPageUrl("CommunityForum"),
    icon: Users,
    description: "Discuss & Collaborate"
  },
  {
    title: "Achievements",
    url: createPageUrl("GamificationHub"),
    icon: Gift,
    description: "Badges & Ranks"
  }
];

const Logo = () => (
  <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
    <BrandLogo withText size="md" />
  </Link>
);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setHasAccess(true); // Internal use - always grant access
    } catch (error) {
      console.log("[Layout] User not authenticated");
      setUser(null);
      setHasAccess(false);
    }
    setIsLoading(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Block if not logged in
  if (!user) {
    base44.auth.redirectToLogin();
    return null;
  }

  // User is authenticated - show full app
  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-background: linear-gradient(135deg, #0f0618 0%, #1a0a2e 50%, #0d0515 100%);
          --accent-gold: #00d9ff;
          --accent-gold-hover: #00ffff;
          --text-primary: #ffffff;
          --text-secondary: #a0aec0;
        }
        .mobile-nav {
          @media (max-width: 768px) {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(203, 213, 225, 0.3);
          }
        }

        .from-amber-500 {
          --tw-gradient-from: #7c3aed var(--tw-gradient-from-position);
          --tw-gradient-to: rgb(124 58 237 / 0) var(--tw-gradient-to-position);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        .hover\\:from-amber-600:hover {
          --tw-gradient-from: #6d28d9 var(--tw-gradient-from-position);
          --tw-gradient-to: rgb(109 40 217 / 0) var(--tw-gradient-to-position);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        .from-amber-500\\/20 {
          --tw-gradient-from: rgb(124 58 237 / 0.2) var(--tw-gradient-from-position);
          --tw-gradient-to: rgb(124 58 237 / 0) var(--tw-gradient-to-position);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        .to-orange-500 {
          --tw-gradient-to: #a78bfa var(--tw-gradient-to-position);
        }
        .hover\\:to-orange-600:hover {
          --tw-gradient-to: #7c3aed var(--tw-gradient-to-position);
        }
        .to-orange-500\\/20 {
          --tw-gradient-to: rgb(167 139 250 / 0.2) var(--tw-gradient-to-position);
        }

        .bg-amber-500 { background-color: #8b5cf6 !important; }
        .bg-amber-600 { background-color: #7c3aed !important; }
        .hover\\:bg-amber-600:hover { background-color: #7c3aed !important; }
        .bg-amber-100 { background-color: #ede9fe !important; }

        .text-amber-400 { color: #c4b5fd !important; }
        .text-amber-500 { color: #a78bfa !important; }
        .text-amber-600 { color: #7c3aed !important; }

        .fill-amber-400 { fill: #c4b5fd !important; color: #c4b5fd !important; }

        .border-amber-500 { border-color: #8b5cf6 !important; }
        .border-amber-500\\/30 { border-color: rgb(139 92 246 / 0.30) !important; }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar className="border-r-0 shadow-2xl hidden md:flex" style={{background: "var(--sidebar-background)"}}>
          <SidebarHeader className="border-b border-slate-700/50 p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <BrandLogo withText size="lg" textLight />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 lg:p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 lg:px-3 py-3">
                Creator Studio
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-sm border border-amber-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 lg:gap-4 px-2 py-2 lg:px-4 lg:py-3">
                          <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${
                            location.pathname === item.url ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                          }`} />
                          <div className="flex-1 min-w-0 hidden lg:block">
                            <div className="font-semibold text-sm">{item.title}</div>
                            <div className="text-xs opacity-75 truncate">{item.description}</div>
                          </div>
                          <div className="lg:hidden">
                            <div className="font-semibold text-xs">{item.title}</div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700/50 p-2 lg:p-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded-lg transition-colors hover:bg-slate-700/50">
                <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 hidden lg:block text-left">
                    <p className="font-semibold text-slate-200 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Billing')} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  await base44.auth.logout();
                  window.location.href = createPageUrl("LandingPage");
                }} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="mobile-nav md:static bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-3 md:px-6 py-2 flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-slate-100 p-1.5 rounded-lg transition-colors duration-200 -ml-1 md:hidden" />
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>

            <div className="md:hidden">
              <Logo />
            </div>

            <Link to={createPageUrl('Profile')}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </Link>
          </header>

          <div className="flex-1 overflow-auto pt-14 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}