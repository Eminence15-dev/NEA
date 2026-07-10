import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
  firebaseEnabled,
  firebaseInitErrorMessage,
} from "../firebase";

import useAuth from "../hooks/useAuth";

const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect authenticated users away from the login page
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!firebaseEnabled) {
      setLocalError(firebaseInitErrorMessage);
      return;
    }

    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      setLocalError("Passwords must match.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signIn") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      navigate("/");
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-5 flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 rounded-3xl shadow-[0_35px_80px_rgba(0,0,0,0.25)] bg-[#080808] border border-[#b19149]/20">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3">
            <UserPlus size={24} className="text-[#b19149]" />

            <div>
              <h1 className="text-3xl font-bold text-[#f8d06b]">
                {mode === "signIn" ? "Sign in" : "Create account"}
              </h1>

              <p className="text-sm text-[#a78b3c]">
                Use your email and password to get started.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#f8d06b]">
              Email
            </label>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a78b3c]"
                size={18}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border border-[#b19149]/20"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[#f8d06b]">
              Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a78b3c]"
                size={18}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border border-[#b19149]/20"
              />
            </div>
          </div>

          {mode === "signUp" && (
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#f8d06b]">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a78b3c]"
                  size={18}
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border border-[#b19149]/20"
                />
              </div>
            </div>
          )}

          {!firebaseEnabled && firebaseInitErrorMessage && (
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-100 p-4 text-sm text-yellow-800">
              <strong>Firebase setup issue:</strong>{" "}
              {firebaseInitErrorMessage}
            </div>
          )}

          {localError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
              {localError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !firebaseEnabled}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-semibold transition-colors ${
              submitting || !firebaseEnabled
                ? "bg-gray-400"
                : "bg-[#B83E18] hover:bg-[#8F2E0E]"
            }`}
          >
            {firebaseEnabled
              ? mode === "signIn"
                ? "Sign in"
                : "Create account"
              : "Setup Firebase first"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#a78b3c]">
          <button
            type="button"
            onClick={() =>
              setMode(mode === "signIn" ? "signUp" : "signIn")
            }
            className="font-semibold text-[#0b74de] hover:underline inline-flex items-center gap-2"
          >
            {mode === "signIn" ? (
              <>
                <UserPlus size={16} />
                Create a new account
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Have an account? Sign in instead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;