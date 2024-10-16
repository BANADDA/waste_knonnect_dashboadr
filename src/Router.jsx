// Router.jsx
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import App from "./App";
import LoginManager from "./auth/login";
import { AuthProvider } from "./AuthContext"; // Import AuthProvider
import PrivateRoute from "./PrivateRoute"; // Import PrivateRoute
import {
  Bar,
  Calendar,
  Contacts,
  Dashboard,
  FAQ,
  Form,
  Geography,
  Invoices,
  Line,
  Pie,
  Stream,
  Team,
} from "./scenes";
import CollectionSchedulesManager from "./scenes/CollectionSchedulesManager/schedules";
import LocationTypesManager from "./scenes/LocationTypesManager/location_types";
import ReviewManager from "./scenes/ReviewManager/review";
import SpecialPlansManager from "./scenes/SpecialPlansManager/special_plan";
import SubscriptionsManager from "./scenes/SubscriptionsManager/subscription";
import UsersManager from "./scenes/UsersManager/add_customers";
import WasteCompaniesManager from "./scenes/UsersManager/companies";
import WasteTypesManager from "./scenes/wasteTypes/waste_types";

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginManager />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reviews" element={<ReviewManager />} />
            <Route path="/schedules" element={<CollectionSchedulesManager />} />
            <Route path="/subscriptions" element={<SubscriptionsManager />} />
            <Route path="/plans" element={<SpecialPlansManager />} />
            <Route path="/add-company" element={<WasteCompaniesManager />} />
            <Route path="/add-customers" element={<UsersManager />} />
            <Route path="/locations" element={<LocationTypesManager />} />
            <Route path="/waste-types" element={<WasteTypesManager />} />
            <Route path="/form" element={<Form />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/pie" element={<Pie />} />
            <Route path="/stream" element={<Stream />} />
            <Route path="/line" element={<Line />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/geography" element={<Geography />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
