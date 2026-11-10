/** Round blue badge with a rating score. */
export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-brand-100 px-2 text-sm font-bold text-brand-700">
      {score}
    </span>
  );
}
