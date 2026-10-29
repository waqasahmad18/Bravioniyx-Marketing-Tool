export default function ToolLoading() {
  return (
    <div className="animate-pulse grid gap-6">
      <div className="h-3 w-40 bg-neutral-200" />
      <div className="h-10 w-64 bg-neutral-200" />
      <div className="h-4 max-w-xl bg-neutral-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 border border-neutral-200 bg-white" />
        ))}
      </div>
      <div className="h-48 border border-neutral-200 bg-white" />
      <div className="h-64 border border-neutral-200 bg-white" />
    </div>
  );
}
