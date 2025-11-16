"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        email,
        password,
        name,
        tenantName: tenant,
        tenantSlug: tenant.trim().toLowerCase().replace(/\s+/g, "-"),
      });

      setToken(res.data.accessToken);
      setUser(res.data.user);
      toast.success(`Registered successfully, welcome, ${res.data.user.name}!`);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed";
      setError(msg);
      toast.error(`Registration failed: ${msg}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm sm:shadow-md px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join your team and start using the dashboard in minutes.
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-10"
              />
            </div>

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
              <Label htmlFor="tenant">Organization / Team</Label>
              <Input
                id="tenant"
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                required
                placeholder="eg. Flowdeck Labs"
                className="h-10"
              />
              <p className="text-xs text-gray-400">
                Used to create your workspace and subdomain.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-10"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer h-10 text-sm font-medium"
            >
              {loading ? "Registering..." : "Create account"}
            </Button>

            <p className="mt-4 text-center text-xs text-gray-400">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
