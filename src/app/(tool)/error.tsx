"use client";

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const mongo = /mongo|server selection|timed out/i.test(error.message || "");

  return (
    <div className="mx-auto max-w-xl border border-neutral-300 bg-white p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {mongo ? "Database connection timed out" : "Page failed to load"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {mongo
          ? "MongoDB Atlas did not respond in time. Check your internet, VPN, and Atlas Network Access (IP allow list). Then retry."
          : error.message || "An unexpected server error occurred."}
      </p>
      {error.digest ? <p className="mt-2 text-xs text-neutral-400">Digest: {error.digest}</p> : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#E10600]"
      >
        Try again
      </button>
    </div>
  );
}
