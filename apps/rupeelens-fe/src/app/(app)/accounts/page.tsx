import { Suspense } from "react";

import { Accounts } from "@/features/accounts";

export default function AccountsPage() {
  return (
    <Suspense fallback={null}>
      <Accounts />
    </Suspense>
  );
}
