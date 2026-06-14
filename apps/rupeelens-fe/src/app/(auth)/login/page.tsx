import { Login, SessionLogger } from "@/features/auth";

export default function LoginPage() {
  console.info("[auth:LoginPage] render");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SessionLogger />
      <Login />
    </main>
  );
}
