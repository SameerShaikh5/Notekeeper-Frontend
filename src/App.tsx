
// React is implicitly imported in Vite/React 17+
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotesProvider, useNotes } from "./context/NotesContext";
import { EditorLayout } from "./components/EditorLayout";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

function MainApp() {
  const { user, loading } = useAuth();
  const { activeTopicId } = useNotes();

  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      {activeTopicId ? <EditorLayout /> : <Dashboard />}
    </div>
  );
}

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="notekeeper-theme">
      <AuthProvider>
        <NotesProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<MainApp />} />
            </Routes>
          </BrowserRouter>
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
