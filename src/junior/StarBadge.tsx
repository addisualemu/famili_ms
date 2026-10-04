type StarBadgeProps = {
  stars: number
}

export function StarBadge({ stars }: StarBadgeProps) {
  return (
    <p className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-5 text-navy shadow-none">
      <StarIcon />
      <span className="text-2xl font-semibold tracking-tight">
        {stars} {stars === 1 ? 'Star' : 'Stars'}
      </span>
    </p>
  )
}

function StarIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
    </svg>
  )
}
