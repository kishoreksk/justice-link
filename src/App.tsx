import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Track from "./pages/Track";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import RoleManagement from "./pages/RoleManagement";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track" element={<Track />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/demo" element={<Demo />} />
          <Route path="/professional" element={<ProfessionalDashboard />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
