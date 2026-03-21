import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { setAccessToken } from "./lib/axios";
import { setCredentials, logout, finishInitialLoad } from "./redux/authSlice";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


const Dashboard = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Courier Dashboard</h1>
      <p className="text-zinc-400">You are logged in ✓</p>
    </div>
  </div>
);

const PublicRoute = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
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
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;