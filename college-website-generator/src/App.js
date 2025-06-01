import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Register from "./components/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import PrivateRoute from "./components/PrivateRoute"
import Generator from "./pages/Generator"
import Preview from "./pages/Preview"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"

// NavbarWrapper component to conditionally render the navbar
const NavbarWrapper = () => {
  const location = useLocation()

  // Don't show navbar on the landing page (home route)
  if (location.pathname === "/") {
    return null
  }

  return <Navbar />
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* NavbarWrapper will conditionally render the Navbar */}
        <Routes>
          <Route path="*" element={<NavbarWrapper />} />
        </Routes>

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/generator"
              element={
                <PrivateRoute>
                  <Generator />
                </PrivateRoute>
              }
            />
            <Route
              path="/preview/:id"
              element={
                <PrivateRoute>
                  <Preview />
                </PrivateRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
          <p>&copy; 2024 College Website Generator. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
