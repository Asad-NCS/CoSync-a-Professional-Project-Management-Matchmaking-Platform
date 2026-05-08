import { useState } from "react";
import Logo from "../../components/ui/Logo";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Mail, Lock, CheckCircle, ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // For this academic project, we verify if user exists
      const res = await api.post("/auth/verify-email", { email });
      if (res.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email not found in our records.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] flex items-center justify-center p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="w-12 h-12 mb-4" />
          <h1 className="text-2xl font-bold text-white">CoSync</h1>
        </div>

        <div className="bg-[#0C0C0F] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll help you reset it.</p>
              
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#040406] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-700 outline-none focus:border-accent/50 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs ml-1">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-6">Create a new secure password for {email}.</p>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#040406] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-700 outline-none focus:border-accent/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#040406] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-700 outline-none focus:border-accent/50 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs ml-1">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accentHover transition-all active:scale-[0.98] disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(0,112,243,0.3)]"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-8">Your password has been updated successfully.</p>
              
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Sign in now
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <button
              onClick={() => step === 2 ? setStep(1) : navigate("/login")}
              className="text-gray-500 hover:text-white transition-colors text-xs font-medium flex items-center gap-2 group bg-none border-none cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
