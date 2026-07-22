import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./lib/theme";
import { AuthProvider } from "./lib/auth-context";
import LandingPage from "./routes/index";
import LoginPage from "./routes/login";
import SignupPage from "./routes/signup";
import AppLayout from "./routes/AppLayout";
import Dashboard from "./routes/Dashboard";
import RecentPage from "./routes/RecentPage";
import StarredPage from "./routes/StarredPage";
import TrashPage from "./routes/TrashPage";
import UploadPage from "./routes/UploadPage";
import SettingsPage from "./routes/SettingsPage";
import DocumentChat from "./routes/DocumentChat";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/" element={<AppLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="recent" element={<RecentPage />} />
                <Route path="starred" element={<StarredPage />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="documents/:id" element={<DocumentChat />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
