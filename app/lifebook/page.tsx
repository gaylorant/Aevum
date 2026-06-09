const tools = [
  {
    name: "Habit Tracker",
    description: "Track daily habits locally. Export as CSV or JSON anytime.",
  },
  {
    name: "Study Planner",
    description: "Plan sessions and goals on your device only.",
  },
  {
    name: "Focus Timer",
    description: "Pomodoro-style focus sessions with no cloud sync.",
  },
  {
    name: "Journal",
    description: "Private reflections stored in your browser.",
  },
];

export default function LifebookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-aevum-ink">Lifebook</h1>
      <p className="mt-4 text-lg leading-relaxed text-aevum-muted">
        Local-only wellbeing tools. Data stays in your browser — no cloud sync,
        no accounts.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="rounded-2xl border border-aevum-border bg-aevum-surface p-5"
          >
            <h2 className="font-semibold text-aevum-ink">{tool.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-aevum-muted">
              {tool.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-aevum-border bg-aevum-soft/40 p-8 text-center">
        <p className="text-sm font-medium text-aevum-ink">Coming soon</p>
        <p className="mt-2 text-sm text-aevum-muted">
          Tool UIs and localStorage persistence will be built in the next phase.
        </p>
      </div>
    </div>
  );
}
