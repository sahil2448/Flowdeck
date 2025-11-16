"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      setToken(res.data.accessToken);
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.error || (err as Error)?.message || "Login failed";
      setError(message);
      toast.error(`Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear error automatically after 4s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm sm:shadow-md px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">Welcome back. Log in to your account.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10"
              />
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="mt-2 w-full cursor-pointer h-10 text-sm font-medium">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
