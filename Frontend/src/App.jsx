import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { setAccessToken } from "./lib/axios";
import { setCredentials, logout, finishInitialLoad } from "./redux/authSlice";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import NewOrders from "./pages/dashboard/NewOrders";
import ProcessingOrders from "./pages/dashboard/ProcessingOrders";
import Sidebar from "./layout/Sidebar";
import ForgotPassword from "./pages/auth/ForgotPassword";




const PublicRoute = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.post(
          "/api/auth/token/refresh/",
          {},
          { skipLoading: true }
        );
        setAccessToken(response.data.access);
        dispatch(
          setCredentials({
            accessToken: response.data.access,
            user: response.data.user,
          })
        );
      } catch {
        dispatch(logout());
      } finally {
        dispatch(finishInitialLoad());
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<Sidebar />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-orders" element={<NewOrders />} />
            <Route path="/processing-order" element={<ProcessingOrders />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;