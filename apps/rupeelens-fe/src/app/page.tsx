"use client";

import { Button } from "@shared-ui";

import { Logout } from "@/features/auth";
import { TestBE } from "@/features/transactions";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 gap-4">
      <Button onClick={() => console.info("hello test")}>hello test</Button>
      <Logout />
      <TestBE />
    </main>
  );
}
