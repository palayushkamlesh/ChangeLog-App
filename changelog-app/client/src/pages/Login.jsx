import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@changelog.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", {
        email,
        password,
      });

      navigate("/admin");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          Changelog
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to manage your product updates.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="admin@example.com"
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <Link
          to="/"
          className="back-link"
        >
          ← Back to changelog
        </Link>

      </div>

    </div>
  );
}

export default Login;