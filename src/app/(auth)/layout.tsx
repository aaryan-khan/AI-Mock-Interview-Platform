import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-page"><div className="auth-orb orb-a"/><div className="auth-orb orb-b"/><div className="auth-shell">{children}</div></main>;
}
