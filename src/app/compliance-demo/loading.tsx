// Shown instantly while a page's data loads on the server.
export default function Loading() {
  const bar = "animate-pulse rounded-sm bg-track";
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className={`${bar} h-3 w-20`} />
          <div className={`${bar} h-7 w-48`} />
          <div className={`${bar} h-3 w-72`} />
        </div>
        <div className="flex gap-2"><div className={`${bar} h-10 w-28`} /><div className={`${bar} h-10 w-36`} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="card flex flex-col gap-3 p-4"><div className={`${bar} h-3 w-24`} /><div className={`${bar} h-7 w-14`} /></div>)}
      </div>
      <div className="card">
        <div className="border-b border-line px-[18px] py-4"><div className={`${bar} h-4 w-40`} /></div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b border-line-row px-[18px] py-3.5 last:border-0">
            <div className={`${bar} size-8 rounded-full`} />
            <div className="flex flex-1 flex-col gap-1.5"><div className={`${bar} h-3 w-48`} /><div className={`${bar} h-2.5 w-32`} /></div>
            <div className={`${bar} h-5 w-20 rounded-full`} />
          </div>
        ))}
      </div>
    </div>
  );
}
