import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/theme/theme-provider";
import RootBoundary from "./components/errors/RootBoundary";
import { ThemeToggle } from "@/components/theme-toggle";

import Layout from "./layout";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout showSidebar={false} showHeader={false} showFooter={false} />
      ),
      errorElement: <RootBoundary />,
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 right-20 z-50">
          <ThemeToggle />
        </div>
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
};

export default App;