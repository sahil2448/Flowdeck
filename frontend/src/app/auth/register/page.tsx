"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

export default function RegisterPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState(""); // If you want org/tenant signups
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
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
      setError(err.response?.data?.error || "Registration failed");
      toast.error(`Registration failed: ${err.response?.data?.error}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="w-full max-w-sm mx-auto space-y-4 mt-10">
      <div className="flex flex-col gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="tenant">Organization/Team Name</Label>
        <Input id="tenant" value={tenant} onChange={e => setTenant(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full cursor-pointer">
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
