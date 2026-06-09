const circleFeatures = [
  "Fixed 5-person groups with anonymous avatars",
  "Peer-to-peer audio via WebRTC (PeerJS)",
  "No server storage of audio, video, or messages",
  "Guest mode — no account required",
];

export default function CirclesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-aevum-ink">Peer Circles</h1>
      <p className="mt-4 text-lg leading-relaxed text-aevum-muted">
        Connect with others in small, anonymous circles. Everything flows
        peer-to-peer — we never see or store what you share.
      </p>

      <ul className="mt-8 space-y-3">
        {circleFeatures.map((feature) => (
          <li
            key={feature}
            className="rounded-xl border border-aevum-border bg-aevum-surface px-4 py-3 text-sm text-aevum-ink"
          >
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-dashed border-aevum-border bg-aevum-soft/40 p-8 text-center">
        <p className="text-sm font-medium text-aevum-ink">Coming soon</p>
        <p className="mt-2 text-sm text-aevum-muted">
          PeerJS WebRTC integration will be wired up in the next phase.
        </p>
      </div>
    </div>
  );
}
