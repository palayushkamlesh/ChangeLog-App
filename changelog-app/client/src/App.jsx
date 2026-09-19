import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CreateChangelog from "./pages/CreateChangelog";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/create"
          element={<CreateChangelog />}
        />

        <Route
          path="/admin/edit/:id"
          element={<CreateChangelog />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;