
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import Expenses from "./pages/Expenses";
import ExpenseForm from "./pages/ExpenseForm";
import MileageForm from "./pages/MileageForm";
import Mileage from "./pages/Mileage";
import CareRecipients from "./pages/CareRecipients";
import CareRecipientForm from "./pages/CareRecipientForm";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import TransactionTriage from "./pages/TransactionTriage";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
