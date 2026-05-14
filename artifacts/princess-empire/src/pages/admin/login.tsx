import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (result) => {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminToken", result.token);
          navigate("/admin/dashboard");
        },
        onError: () => {
          setError("Invalid email or password. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-background">Princess Empire</h1>
          <p className="text-background/50 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-background/10 backdrop-blur-md border border-background/20 rounded-2xl p-8">
          <h2 className="text-background text-xl font-semibold mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 text-red-300 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-background/70 text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-background/10 border-background/20 text-background placeholder:text-background/30 focus:border-primary"
                required
                data-testid="input-admin-email"
              />
            </div>
            <div>
              <Label className="text-background/70 text-sm">Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus:border-primary pr-10"
                  required
                  data-testid="input-admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-background/40 hover:text-background/70"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl py-5 mt-2"
              disabled={login.isPending}
              data-testid="button-admin-login"
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-background/30 text-xs text-center mt-6">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
