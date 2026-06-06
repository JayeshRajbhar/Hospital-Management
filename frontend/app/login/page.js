"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../../lib/api";
import { setAuthToken, getAuthToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getAuthToken();
      if (token) {
        router.push("/dashboard");
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login(username, password);
      if (response && response.token) {
        await setAuthToken(response.token, response.username);
        router.push("/dashboard");
      } else {
        setError("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Login error", err);
      setError(err?.message || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Hospital Management System</p>
          <h1 className="auth-title">Care Command</h1>
          <p className="auth-subtitle">Sign in to access clinical control panel</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="auth-link">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
