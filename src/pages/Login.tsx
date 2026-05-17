import React, { useState } from "react";
import { useAuth, api } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error logging in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FolderOpen className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">NoteKeeper</h1>
        </div>
        <h2 className="text-xl font-semibold mb-6 text-foreground text-center">Log into your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-70 transition-colors flex justify-center items-center h-10"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
