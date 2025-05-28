import "./App.css";
import { BrowserRouter, Route, Routes } from "~/react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Footer } from "~/@bcgov/design-system-react-components";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth";

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<h1>RST Admin</h1>} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
