"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundEffects from "@/components/layout/BackgroundEffects";
import LoginScreen from "@/components/LoginScreen";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>Carregando...</div>;
  }

  return (
    <>
      <BackgroundEffects weatherEffect="clear" />
      <LoginScreen />
    </>
  );
}
