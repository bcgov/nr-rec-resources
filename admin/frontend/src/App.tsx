import "./App.css";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LandingPage } from "@/pages/LandingPage";
import { ROUTES } from "./routes";
import { RecResourceFilesPage } from "./components/rec-resource-files/RecResourceFilesPage";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LANDING} element={<LandingPage />} />
              <Route
                path={ROUTES.REC_RESOURCE_FILES}
                element={<RecResourceFilesPage />}
              />
            </Routes>
          </BrowserRouter>
        </AuthGuard>
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
