"use client";

import { Button } from "@shared-ui";

import { Logout } from "@/features/auth";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Button onClick={() => console.info("hello test")}>hello test</Button>
      <Logout />
    </main>
  );
}
