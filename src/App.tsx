
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const TransactionTriage = lazy(() => import("./pages/TransactionTriage"));
const Transactions = lazy(() => import("./pages/Transactions"));

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
