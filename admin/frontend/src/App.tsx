import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  Header,
  AuthGuard,
  RecResourceFilesPage,
  NotificationBar,
  PageLayout,
} from "@/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LandingPage } from "@/pages/LandingPage";
import { ROUTES } from "./routes";
import { useEffect } from "react";
import { ResponseError } from "@/services/recreation-resource-admin";
import { addErrorNotification } from "@/store/notificationStore";

function useGlobalQueryErrorHandler(queryClient: QueryClient) {
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.state.status === "error" &&
        event.query.state.fetchStatus === "idle" &&
        event.query.state.error instanceof ResponseError
      ) {
        const status = event.query.state.error.response.status;
        const toastId = `${status}-error-${JSON.stringify(event.query.queryKey)}`;
        if (status === 401) {
          addErrorNotification(
            "401 -  Unauthorized access. Please log in again or contact support.",
            toastId,
          );
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient]);
}

const queryClient = new QueryClient();

function App() {
  useGlobalQueryErrorHandler(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Header />
          <NotificationBar />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LANDING} element={<LandingPage />} />
              <Route
                path={ROUTES.REC_RESOURCE_FILES}
                element={
                  <PageLayout>
                    <RecResourceFilesPage />
                  </PageLayout>
                }
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
