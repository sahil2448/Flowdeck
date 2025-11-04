"use client";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      Logout
    </Button>
  );
}
