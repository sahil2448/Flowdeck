"use client"
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthRedirect = () => {
  const token = useAuthStore((s) => s.token);
    const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/auth/login");
    }  }, [token, router]);
};
