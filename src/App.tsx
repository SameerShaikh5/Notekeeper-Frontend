
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotesProvider } from "./context/NotesContext";
import { Sidebar } from "./components/Sidebar";
import { BlockEditor } from "./components/Editor/BlockEditor";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <NotesProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <BlockEditor onOpenSidebar={() => setIsSidebarOpen(true)} />
      </div>
    </NotesProvider>
  );
}

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="notekeeper-theme">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<MainApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
