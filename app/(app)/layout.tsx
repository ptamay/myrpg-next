import { UserSessionProvider } from "@/contexts/UserSessionContext";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSessionProvider>
      <AppShell>
        {children}
      </AppShell>
    </UserSessionProvider>
  );
}
