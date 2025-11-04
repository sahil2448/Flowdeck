"use client"
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthRedirect = () => {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  useEffect(() => {
    if (!token) router.replace("/auth/login");
  }, [token, router]);
};
