import { AuthGate } from '@/components/auth/AuthGate';
import { AppShell } from '@/components/app-shell/AppShell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
