import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginForm from "./features/auth/components/LoginForm";
import SignupForm from "./features/users/components/SignupForm";
import PantryExplorer from "./features/pantries/components/PantryExplorer";
import Profile from "./features/users/components/Profile";
import RestaurantExplorer from "./features/restaurants/components/RestaurantExplorer";
import MenuViewer from "./features/menus/components/MenuViewer";
import MenuUploader from "./features/menus/components/MenuUploader";
import About from "./features/about/components/About";

const isAuthenticated = () => {
  if (localStorage.getItem("sessionId") === null) {
    return redirect("/login");
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Profile />
      </MainLayout>
    ),
    loader: isAuthenticated,
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
    path: "/map/pantry",
    element: (
      <MainLayout>
        <PantryExplorer />
      </MainLayout>
    ),
    loader: isAuthenticated,
  },
  {
    path: "/profile",
    element: (
      <MainLayout>
        <Profile />
      </MainLayout>
    ),
    loader: isAuthenticated,
  },
  {
    path: "/:camis/menu",
    element: (
      <MainLayout>
        <MenuViewer />
      </MainLayout>
    ),
    loader: isAuthenticated,
  },
  {
    path: "/:camis/menu/upload",
    element: (
      <MainLayout>
        <MenuUploader />
      </MainLayout>
    ),
    loader: isAuthenticated,
  },
  {
    path: "/map/restaurant",
    element: (
      <MainLayout>
        <RestaurantExplorer />
      </MainLayout>
    ),
    middleware: [isAuthenticated],
  },
  {
    path: "/about",
    element: (
      <MainLayout>
        <About />
      </MainLayout>
    ),
    loader: isAuthenticated,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
