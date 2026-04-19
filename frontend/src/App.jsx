import {
    createBrowserRouter,
    redirect,
    RouterProvider,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginForm from "./features/auth/components/LoginForm";
import SignupForm from "./features/users/components/SignupForm";
import Dashboard from "./features/users/components/Dashboard";
import PantryExplorer from "./features/pantries/components/PantryExplorer";
import Restaurant from "./features/restaurants/components/Restaurant";
import RestaurantExplorer from "./features/restaurants/components/RestaurantExplorer";
import MenuViewer from "./features/menus/components/MenuViewer";
import MenuUploader from "./features/menus/components/MenuUploader";

const isAuthenticated = () => {
    if (localStorage.getItem("sessionId") === null) {
        throw redirect("/login");
    }
};

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <MainLayout>
                <Dashboard />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/login",
        element: (
            <MainLayout>
                <LoginForm />
            </MainLayout>
        ),
    },
    {
        path: "/signup",
        element: (
            <MainLayout>
                <SignupForm />
            </MainLayout>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <MainLayout>
                <Dashboard />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/map/pantry",
        element: (
            <MainLayout>
                <PantryExplorer />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/ocr",
        element: (
            <MainLayout>
                <Restaurant />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/menu/:camis",
        element: (
            <MainLayout>
                <MenuViewer />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/menu/:camis/upload",
        element: (
            <MainLayout>
                <MenuUploader />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    },
    {
        path: "/map/restaurant",
        element: (
            <MainLayout>
                <RestaurantExplorer />
            </MainLayout>
        ),
        middleware: [isAuthenticated],
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
