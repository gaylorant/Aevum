import Link from "next/link";

const features = [
  {
    title: "Private Chat",
    description: "Session-based AI support. Zero memory. Deleted when you close the tab.",
    href: "/chat",
  },
  {
    title: "Peer Circles",
    description: "Anonymous 5-person circles over WebRTC. No server recording.",
    href: "/circles",
  },
  {
    title: "Lifebook",
    description: "Habit Tracker, Study Planner, Focus Timer, and Journal — all local-only.",
    href: "/lifebook",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-Sameva-accent">
          Project Sameva
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-Sameva-ink sm:text-5xl">
          Your private space to reflect, vent, grieve, and grow
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-Sameva-muted">
          Web-first and privacy-first. No accounts on the free tier. No chat history
          on any server. No tracking. Just a calm place to be with yourself.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-xl bg-Sameva-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start a private chat
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-Sameva-border bg-Sameva-surface px-6 py-3 text-sm font-medium text-Sameva-ink transition-colors hover:bg-Sameva-soft"
          >
            View pricing
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-2xl border border-Sameva-border bg-Sameva-surface p-6 transition-shadow hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-Sameva-ink">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-Sameva-muted">
              {feature.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-Sameva-border bg-Sameva-soft/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-Sameva-ink">Our privacy promise</h2>
        <ul className="mt-4 grid gap-2 text-sm text-Sameva-muted sm:grid-cols-2">
          <li>No user accounts required on Free tier</li>
          <li>No chat history stored on any server</li>
          <li>No third-party analytics or tracking</li>
          <li>No advertising or behavioral profiling</li>
        </ul>
      </section>
    </div>
  );
}
