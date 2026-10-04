type AccountCardProps = {
  label: 'Spend' | 'Save' | 'Give'
  stars: number
}

export function AccountCard({ label, stars }: AccountCardProps) {
  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-5">
      <h3 className="text-xs font-semibold tracking-[0.16em] uppercase">{label}</h3>
      <p className="mt-4 inline-flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <svg aria-hidden="true" className="h-7 w-7 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
        </svg>
        {stars}
      </p>
    </article>
  )
}
