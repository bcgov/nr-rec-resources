import "./App.css";
import { BrowserRouter, Route, Routes } from "~/react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Footer } from "~/@bcgov/design-system-react-components";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth";
import { RecreationResourceSuggestionBox } from "@/components/rec-resource-suggestion-box/RecreationResourceSuggestionBox";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RecreationResourceSuggestionBox />} />
            </Routes>
          </BrowserRouter>
          <Footer />
        </AuthGuard>
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
