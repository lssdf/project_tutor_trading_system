import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./index.css";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import DashboardLayout from "./components/DashboardLayout";
import LearnerOverview from "./pages/learner/Overview";
import Portfolio from "./pages/learner/Portfolio";
import Trades from "./pages/learner/Trades";
import { Sessions, Reports, Subscription, MyTutor } from "./pages/learner/LearnerPages";
import { TutorOverview, TutorLearners, TutorSessions, TutorFeedback, TutorReports } from "./pages/tutor/TutorPages";
import { AdminOverview, AdminUsers, AdminPayments, AdminPlans, AdminAssets } from "./pages/admin/AdminPages";

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Learner */}
      <Route path="/learner" element={<PrivateRoute role="learner"><DashboardLayout><LearnerOverview /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/portfolio" element={<PrivateRoute role="learner"><DashboardLayout><Portfolio /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/trades" element={<PrivateRoute role="learner"><DashboardLayout><Trades /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/sessions" element={<PrivateRoute role="learner"><DashboardLayout><Sessions /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/reports" element={<PrivateRoute role="learner"><DashboardLayout><Reports /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/subscription" element={<PrivateRoute role="learner"><DashboardLayout><Subscription /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/subscription/plans" element={<PrivateRoute role="learner"><DashboardLayout><Subscription /></DashboardLayout></PrivateRoute>} />
      <Route path="/learner/my-tutor" element={<PrivateRoute role="learner"><DashboardLayout><MyTutor /></DashboardLayout></PrivateRoute>} />

      {/* Tutor */}
      <Route path="/tutor" element={<PrivateRoute role="tutor"><DashboardLayout><TutorOverview /></DashboardLayout></PrivateRoute>} />
      <Route path="/tutor/learners" element={<PrivateRoute role="tutor"><DashboardLayout><TutorLearners /></DashboardLayout></PrivateRoute>} />
      <Route path="/tutor/sessions" element={<PrivateRoute role="tutor"><DashboardLayout><TutorSessions /></DashboardLayout></PrivateRoute>} />
      <Route path="/tutor/feedback" element={<PrivateRoute role="tutor"><DashboardLayout><TutorFeedback /></DashboardLayout></PrivateRoute>} />
      <Route path="/tutor/reports" element={<PrivateRoute role="tutor"><DashboardLayout><TutorReports /></DashboardLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute role="admin"><DashboardLayout><AdminOverview /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute role="admin"><DashboardLayout><AdminUsers /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/payments" element={<PrivateRoute role="admin"><DashboardLayout><AdminPayments /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/plans" element={<PrivateRoute role="admin"><DashboardLayout><AdminPlans /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/assets" element={<PrivateRoute role="admin"><DashboardLayout><AdminAssets /></DashboardLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
