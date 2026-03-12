export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            BusinessOS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Property Intelligence
          </h1>
          <p className="text-zinc-400 text-lg">
            Family-office financial intelligence platform
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Go to Dashboard
          </a>
          <a
            href="/login"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Sign In
          </a>
        </div>
      </main>
    </div>
  );
}
