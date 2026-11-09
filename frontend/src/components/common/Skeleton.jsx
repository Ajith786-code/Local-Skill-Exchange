export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 p-4" aria-hidden="true">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
