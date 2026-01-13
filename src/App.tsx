import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { loadConfigFromStorage } from "@/lib/config";
import Overview from "./pages/Overview";
import Platforms from "./pages/Platforms";
import Queries from "./pages/Queries";
import Competitors from "./pages/Competitors";
import Recommendations from "./pages/Recommendations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize app
function AppInitializer() {
  useEffect(() => {
    // Load saved configuration
    loadConfigFromStorage();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/queries" element={<Queries />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
