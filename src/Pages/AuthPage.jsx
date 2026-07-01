import { useState } from "react";
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle } from "lucide-react";

const AuthPage = ({ authUser, onSignIn, onSignUp, onSignOut, authError, darkMode, setCurrentPage }) => {
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dm = darkMode;
  const card = dm ? "bg-[#080808] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const inputBase = dm ? "bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border-[#b19149]/20" : "bg-[#f8fbff] text-black placeholder-[#6b7280] border border-[#bae6fd]";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
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
        await onSignIn(email.trim(), password);
      } else {
        await onSignUp(email.trim(), password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${dm ? "bg-black" : "bg-white"} p-5 flex items-center justify-center`}>
      <div className={`w-full max-w-2xl p-8 rounded-3xl shadow-[0_35px_80px_rgba(0,0,0,0.25)] ${card}`}>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3">
            {authUser ? <CheckCircle size={24} className="text-emerald-400"/> : <UserPlus size={24} className="text-[#b19149]"/>}
            <div>
              <h1 className={`text-3xl font-bold ${text}`}>{authUser ? "Account" : mode === "signIn" ? "Sign in" : "Create account"}</h1>
              <p className={`text-sm ${muted}`}>{authUser ? "You are signed in." : "Use your email and password to get started."}</p>
            </div>
          </div>
          {authUser ? (
            <div className={`flex flex-col gap-2 p-4 rounded-2xl ${dm ? "bg-[#0b0b0b]" : "bg-gray-50"}`}>
              <p className={`${text}`}>Signed in as <strong>{authUser.email}</strong></p>
              <button onClick={onSignOut}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B83E18] text-white font-semibold hover:bg-[#8F2E0E] transition-colors">
                <ArrowRight size={18}/> Sign out
              </button>
              <button onClick={() => setCurrentPage("dashboard")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#bae6fd] text-[#0b74de] font-semibold hover:bg-[#eff6ff] transition-colors">
                Back to dashboard
              </button>
            </div>
          ) : null}
        </div>

        {!authUser && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block mb-2 text-sm font-semibold ${text}`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={18}/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm ${inputBase}`}
                  placeholder="you@example.com"/>
              </div>
            </div>
            <div>
              <label className={`block mb-2 text-sm font-semibold ${text}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={18}/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm ${inputBase}`}
                  placeholder="Enter password"/>
              </div>
            </div>
            {mode === "signUp" && (
              <div>
                <label className={`block mb-2 text-sm font-semibold ${text}`}>Confirm password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={18}/>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none shadow-sm ${inputBase}`}
                    placeholder="Repeat password"/>
                </div>
              </div>
            )}
            {(localError || authError) && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">{localError || authError}</div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#B83E18] text-white font-semibold hover:bg-[#8F2E0E] transition-colors disabled:opacity-60">
              {mode === "signIn" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        {!authUser && (
          <div className={`mt-6 text-sm ${muted} flex flex-col gap-3`}>
            <button type="button" onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
              className="font-semibold text-[#0b74de] hover:underline inline-flex items-center gap-2">
              {mode === "signIn" ? <UserPlus size={16}/> : <ArrowRight size={16}/>} 
              {mode === "signIn" ? "Create a new account" : "Have an account? Sign in instead"}
            </button>
            <button type="button" onClick={() => setCurrentPage("dashboard")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-[#6b7280] hover:text-[#0b74de]">
              <ArrowRight size={14}/> Continue without login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
