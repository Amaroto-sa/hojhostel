import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

function LoginFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}