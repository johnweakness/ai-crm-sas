import Link from "next/link";

export default function InvitePage() {
  return <main className="invite-page"><div className="invite-card"><Link href="/" className="public-brand">orbit<span>.</span></Link><div className="invite-icon">✦</div><p className="eyebrow">Workspace invitation</p><h1>You&apos;ve been invited to Orbit.</h1><p>Sign in or create an account to join your agency workspace. Your administrator controls your role and access.</p><Link href="/" className="primary-link">Accept invitation</Link><small>Invitation links expire after seven days.</small></div></main>;
}
