import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

import { useAuth } from "../contexts/AppContext";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data) {
    setApiError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      setApiError(
        err?.response?.data?.detail ||
          "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tc-bg px-4 py-8 text-tc-text">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-3xl border border-tc-border bg-tc-surface/80 p-7 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tc-accent/15 text-tc-accent">
            <LogIn className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-tc-text">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-tc-muted">
            Sign in to continue chatting with your indexed videos.
          </p>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tc-muted-2" />

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-tc-border bg-tc-surface-2 py-3 pl-12 pr-4 text-tc-text outline-none transition focus:border-tc-accent/60 focus-visible:ring-2 focus-visible:ring-tc-accent/40 placeholder:text-tc-muted-2"
              {...register("email", {
                required: "Email is required.",
              })}
            />
          </div>

          {errors.email && (
            <p className="mt-2 rounded-xl border border-tc-error/30 bg-tc-error/10 px-3 py-2 text-sm text-tc-error">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs text-tc-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tc-muted-2" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-tc-border bg-tc-surface-2 py-3 pl-12 pr-12 text-tc-text outline-none transition focus:border-tc-accent/60 focus-visible:ring-2 focus-visible:ring-tc-accent/40 placeholder:text-tc-muted-2"
              {...register("password", {
                required: "Password is required.",
              })}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-tc-muted transition-colors hover:text-tc-text"
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 rounded-xl border border-tc-error/30 bg-tc-error/10 px-3 py-2 text-sm text-tc-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mt-4 rounded-xl border border-tc-error/30 bg-tc-error/10 px-3 py-3 text-sm text-tc-error">
            {apiError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-tc-surface-2 disabled:text-tc-muted-2"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0f05] border-t-transparent" />
              Logging in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Log In
            </>
          )}
        </button>

        {/* Register */}
        <div className="mt-8 border-t border-tc-border pt-6 text-center">
          <p className="text-sm text-tc-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-tc-accent transition-colors hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}