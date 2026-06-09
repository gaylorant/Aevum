const freeFeatures = [
  "Guest mode — no account required",
  "Private AI chat (session-only, zero server memory)",
  "Peer Circles access",
  "Lifebook tools (local-only)",
  "Memory Capsules (key insights only)",
];

const premiumFeatures = [
  "Everything in Free Core",
  "Extended AI sessions",
  "Priority circle matching",
  "Advanced Lifebook exports",
  "Early access to self-hosted AI (Qwen)",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-aevum-ink">Pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-aevum-muted">
          Start free. Upgrade when you want deeper growth — still privacy-first.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-aevum-border bg-aevum-surface p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-aevum-accent">
            Free Core
          </p>
          <p className="mt-2 text-3xl font-semibold text-aevum-ink">₹0</p>
          <p className="mt-1 text-sm text-aevum-muted">Forever free, guest mode</p>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((feature) => (
              <li key={feature} className="text-sm text-aevum-ink">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-aevum-accent bg-aevum-surface p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-aevum-accent">
            Premium Growth
          </p>
          <p className="mt-2 text-3xl font-semibold text-aevum-ink">
            ₹199
            <span className="text-base font-normal text-aevum-muted">/month</span>
          </p>
          <p className="mt-1 text-sm text-aevum-muted">Cancel anytime</p>
          <ul className="mt-6 space-y-3">
            {premiumFeatures.map((feature) => (
              <li key={feature} className="text-sm text-aevum-ink">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
