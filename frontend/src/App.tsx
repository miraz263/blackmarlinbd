import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { HelmetProvider } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsTrack } from "@/hooks/useAnalyticsTrack";

// Lazy-loaded pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const ServiceDetailPage = lazy(() => import("@/pages/ServiceDetailPage"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ProductsPage      = lazy(() => import("@/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const BlogPage       = lazy(() => import("@/pages/BlogPage"));
const BlogWritePage  = lazy(() => import("@/pages/BlogWritePage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const CareersPage = lazy(() => import("@/pages/CareersPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout"));
const DashboardOverview = lazy(() => import("@/pages/dashboard/DashboardOverview"));
const MediaManagerPage = lazy(() => import("@/pages/dashboard/MediaManagerPage"));
const RolesPage        = lazy(() => import("@/pages/dashboard/RolesPage"));
const PagesPage        = lazy(() => import("@/pages/dashboard/PagesPage"));
const PageEditorPage   = lazy(() => import("@/pages/dashboard/PageEditorPage"));
const DynamicPage      = lazy(() => import("@/pages/DynamicPage"));
const WorkflowPage       = lazy(() => import("@/pages/dashboard/WorkflowPage"));
const AnalyticsPage      = lazy(() => import("@/pages/dashboard/AnalyticsPage"));
const TranslationsPage   = lazy(() => import("@/pages/dashboard/TranslationsPage"));
const AIPage             = lazy(() => import("@/pages/dashboard/AIPage"));
const SettingsPage       = lazy(() => import("@/pages/dashboard/SettingsPage"));
const ProjectsManagerPage = lazy(() => import("@/pages/dashboard/ProjectsManagerPage"));
const ProductsManagerPage = lazy(() => import("@/pages/dashboard/ProductsManagerPage"));
const SectionsManagerPage = lazy(() => import("@/pages/dashboard/SectionsManagerPage"));
const JobsManagerPage     = lazy(() => import("@/pages/dashboard/JobsManagerPage"));
const BlogManagerPage     = lazy(() => import("@/pages/dashboard/BlogManagerPage"));
const UsersManagerPage    = lazy(() => import("@/pages/dashboard/UsersManagerPage"));
const AboutManagerPage    = lazy(() => import("@/pages/dashboard/AboutManagerPage"));
const HomepageManagerPage = lazy(() => import("@/pages/dashboard/HomepageManagerPage"));
const ContactManagerPage  = lazy(() => import("@/pages/dashboard/ContactManagerPage"));
const ContactsInboxPage   = lazy(() => import("@/pages/dashboard/ContactsInboxPage"));
const ViewerDashboardPage = lazy(() => import("@/pages/ViewerDashboardPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppContent() {
  const { theme } = useThemeStore();
  const { fetchMe } = useAuthStore();
  useAnalyticsTrack();

  useEffect(() => {
    // Apply theme on mount
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      root.classList.add(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      );
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/services/:slug" element={<PublicLayout><ServiceDetailPage /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
        <Route path="/products/:productSlug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
        <Route path="/projects/:slug" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
        <Route path="/blog"        element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/write"  element={<PublicLayout><BlogWritePage /></PublicLayout>} />
        <Route path="/blog/:slug"  element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
        <Route path="/careers" element={<PublicLayout><CareersPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/my-account" element={<ViewerDashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/p/:slug" element={<DynamicPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="media" element={<Suspense fallback={<PageLoader />}><MediaManagerPage /></Suspense>} />
          <Route path="roles" element={<Suspense fallback={<PageLoader />}><RolesPage /></Suspense>} />
          <Route path="pages" element={<Suspense fallback={<PageLoader />}><PagesPage /></Suspense>} />
          <Route path="pages/:slug/edit" element={<Suspense fallback={<PageLoader />}><PageEditorPage /></Suspense>} />
          <Route path="workflow"   element={<Suspense fallback={<PageLoader />}><WorkflowPage /></Suspense>} />
          <Route path="analytics"     element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
          <Route path="translations" element={<Suspense fallback={<PageLoader />}><TranslationsPage /></Suspense>} />
          <Route path="ai"           element={<Suspense fallback={<PageLoader />}><AIPage /></Suspense>} />
          <Route path="projects"  element={<Suspense fallback={<PageLoader />}><ProjectsManagerPage /></Suspense>} />
          <Route path="products"  element={<Suspense fallback={<PageLoader />}><ProductsManagerPage /></Suspense>} />
          <Route path="sections"  element={<Suspense fallback={<PageLoader />}><SectionsManagerPage /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<PageLoader />}><BlogManagerPage /></Suspense>} />
          <Route path="jobs" element={<Suspense fallback={<PageLoader />}><JobsManagerPage /></Suspense>} />
          <Route path="users"    element={<Suspense fallback={<PageLoader />}><UsersManagerPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="about"    element={<Suspense fallback={<PageLoader />}><AboutManagerPage /></Suspense>} />
          <Route path="homepage" element={<Suspense fallback={<PageLoader />}><HomepageManagerPage /></Suspense>} />
          <Route path="contact"  element={<Suspense fallback={<PageLoader />}><ContactManagerPage /></Suspense>} />
          <Route path="inbox"    element={<Suspense fallback={<PageLoader />}><ContactsInboxPage /></Suspense>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
              <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
              <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
              <a href="/" className="px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
                Go Home
              </a>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
