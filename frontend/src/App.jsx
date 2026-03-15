import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginForm from "./features/auth/components/LoginForm";
import SignupForm from "./features/users/components/SignupForm";
import Dashboard from "./features/users/components/Dashboard";

function App() {
    // check if cookie exists

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />

                    {/* Protected Route */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to={"/login"} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
