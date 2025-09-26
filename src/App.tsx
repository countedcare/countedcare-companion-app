
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { initializeAnalytics } from "./utils/analytics";

// Core pages loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Expenses = lazy(() => import("./pages/Expenses"));
const ExpenseForm = lazy(() => import("./pages/ExpenseForm"));
const MileageForm = lazy(() => import("./pages/MileageForm"));
const Mileage = lazy(() => import("./pages/Mileage"));
const CareRecipients = lazy(() => import("./pages/CareRecipients"));
const CareRecipientForm = lazy(() => import("./pages/CareRecipientForm"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const SavedResources = lazy(() => import("./pages/SavedResources"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const TransactionTriage = lazy(() => import("./pages/TransactionTriage"));
const Transactions = lazy(() => import("./pages/Transactions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Help = lazy(() => import("./pages/Help"));
const BetaSuccess = lazy(() => import("./pages/BetaSuccess"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on network errors more than 2 times
        if (error?.message?.includes('fetch') && failureCount >= 2) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

const App = () => {
  // Initialize Google Analytics
  useEffect(() => {
    // Replace with your actual GA4 Measurement ID
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID) {
      initializeAnalytics(GA_MEASUREMENT_ID);
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/home/transactions" element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="/triage" element={
                <ProtectedRoute>
                  <TransactionTriage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />
              <Route path="/expenses/new" element={
                <ProtectedRoute>
                  <ExpenseForm />
                </ProtectedRoute>
              } />
              <Route path="/mileage" element={
                <ProtectedRoute>
                  <Mileage />
                </ProtectedRoute>
              } />
              <Route path="/mileage/new" element={
                <ProtectedRoute>
                  <MileageForm />
                </ProtectedRoute>
              } />
              <Route path="/mileage/:id" element={
                <ProtectedRoute>
                  <MileageForm />
                </ProtectedRoute>
              } />
              <Route path="/expenses/:id" element={
                <ProtectedRoute>
                  <ExpenseForm />
                </ProtectedRoute>
              } />
              <Route path="/care-recipients" element={
                <ProtectedRoute>
                  <CareRecipients />
                </ProtectedRoute>
              } />
              <Route path="/care-recipients/new" element={
                <ProtectedRoute>
                  <CareRecipientForm />
                </ProtectedRoute>
              } />
              <Route path="/care-recipients/:id" element={
                <ProtectedRoute>
                  <CareRecipientForm />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              } />
              <Route path="/resources/:id" element={
                <ProtectedRoute>
                  <ResourceDetail />
                </ProtectedRoute>
              } />
              <Route path="/resources/saved" element={
                <ProtectedRoute>
                  <SavedResources />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />
              <Route path="/beta-success" element={
                <ProtectedRoute>
                  <BetaSuccess />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
  );
};

export default App;
