"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserSessionProvider, useUserSession } from "@/contexts/UserSessionContext";
import AppShell from "@/components/layout/AppShell";
import LoginScreen from "@/components/LoginScreen";

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const { session } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return session === null ? <LoginScreen /> : <AppShell />;
}

export default function DashboardPage() {
  return (
    <UserSessionProvider>
      <DashboardContent />
    </UserSessionProvider>
  );
}
