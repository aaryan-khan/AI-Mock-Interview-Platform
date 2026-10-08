import { Mail, ShieldCheck, UserRound } from "lucide-react";
import StudentShell from "@/components/student-shell";
import { requireUser } from "@/lib/student-auth";

export default async function ProfilePage() {
  const { user } = await requireUser();
  return (
    <StudentShell email={user.email} title="My profile" subtitle="Your local account and the tools available in this student project.">
      <section className="profile-grid">
        <div className="profile-card profile-main-card">
          <div className="large-avatar"><UserRound size={34} /></div>
          <div><span className="eyebrow">SIGNED-IN ACCOUNT</span><h2>{user.email}</h2><p>Authenticated with Supabase.</p></div>
        </div>
        <div className="profile-card">
          <div className="profile-line"><Mail size={18} /><div><small>Email</small><strong>{user.email}</strong></div></div>
          <div className="profile-line"><ShieldCheck size={18} /><div><small>Authentication</small><strong>Supabase Auth</strong></div></div>
        </div>
      </section>
    </StudentShell>
  );
}
