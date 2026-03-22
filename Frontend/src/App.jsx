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

// Orders sub-pages
import AllOrders from "./pages/dashboard/orders/AllOrders";
import Manifested from "./pages/dashboard/orders/Manifested";
import NotPicked from "./pages/dashboard/orders/NotPicked";
import InTransit from "./pages/dashboard/orders/InTransit";
import NDR from "./pages/dashboard/orders/NDR";
import Pending from "./pages/dashboard/orders/Pending";
import OutOfDelivery from "./pages/dashboard/orders/OutOfDelivery";
import Delivery from "./pages/dashboard/orders/Delivery";
import RTOInTransit from "./pages/dashboard/orders/RTOInTransit";
import RTODelivery from "./pages/dashboard/orders/RTODelivery";
import Return from "./pages/dashboard/orders/Return";
import Cancelled from "./pages/dashboard/orders/Cancelled";

// Tools sub-pages
import ServiceablePincode from "./pages/dashboard/tools/ServiceablePincode";
import RateCalculator from "./pages/dashboard/tools/RateCalculator";
import ChannelIntegration from "./pages/dashboard/tools/ChannelIntegration";

// Finance sub-pages
import Wallet from "./pages/dashboard/finance/Wallet";
import CODRemittance from "./pages/dashboard/finance/CODRemittance";
import Invoices from "./pages/dashboard/finance/Invoices";

// Other pages
import Consignees from "./pages/dashboard/Consignees";
import Tickets from "./pages/dashboard/Tickets";
import Reports from "./pages/dashboard/Reports";
import AdminControl from "./pages/dashboard/AdminControl";

// Settings sub-pages
import GeneralDetails from "./pages/dashboard/settings/GeneralDetails";
import ChangePassword from "./pages/dashboard/settings/ChangePassword";
import PickupAddress from "./pages/dashboard/settings/PickupAddress";
import RTOAddress from "./pages/dashboard/settings/RTOAddress";
import LabelSettings from "./pages/dashboard/settings/LabelSettings";
import KYC from "./pages/dashboard/settings/KYC";

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

            {/* Orders sub-pages */}
            <Route path="/orders/all" element={<AllOrders />} />
            <Route path="/orders/manifested" element={<Manifested />} />
            <Route path="/orders/not-picked" element={<NotPicked />} />
            <Route path="/orders/in-transit" element={<InTransit />} />
            <Route path="/orders/ndr" element={<NDR />} />
            <Route path="/orders/pending" element={<Pending />} />
            <Route path="/orders/out-of-delivery" element={<OutOfDelivery />} />
            <Route path="/orders/delivery" element={<Delivery />} />
            <Route path="/orders/rto-in-transit" element={<RTOInTransit />} />
            <Route path="/orders/rto-delivery" element={<RTODelivery />} />
            <Route path="/orders/return" element={<Return />} />
            <Route path="/orders/cancelled" element={<Cancelled />} />

            {/* Tools sub-pages */}
            <Route path="/tools/serviceable-pincode" element={<ServiceablePincode />} />
            <Route path="/tools/rate-calculator" element={<RateCalculator />} />
            <Route path="/tools/channel-integration" element={<ChannelIntegration />} />

            {/* Finance sub-pages */}
            <Route path="/finance/wallet" element={<Wallet />} />
            <Route path="/finance/cod-remittance" element={<CODRemittance />} />
            <Route path="/finance/invoices" element={<Invoices />} />

            {/* Other pages */}
            <Route path="/consignees" element={<Consignees />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/reports" element={<Reports />} />

            {/* Settings sub-pages */}
            <Route path="/settings/general-details" element={<GeneralDetails />} />
            <Route path="/settings/change-password" element={<ChangePassword />} />
            <Route path="/settings/pickup-address" element={<PickupAddress />} />
            <Route path="/settings/rto-address" element={<RTOAddress />} />
            <Route path="/settings/label-settings" element={<LabelSettings />} />
            <Route path="/settings/kyc" element={<KYC />} />
          </Route>

          {/* Admin control — outside sidebar, no navbar */}
          <Route path="/admin-control" element={<AdminControl />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;