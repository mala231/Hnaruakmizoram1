export default function Loading() {
  return (
    <div className="flex-grow flex flex-col" style={{ background: "linear-gradient(160deg, #e8f1ff 0%, #f3f7ff 45%, #fafcff 100%)" }}>
      <section className="py-12 px-container-margin-mobile md:px-container-margin-desktop max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6">
        
        {/* Header bar placeholder */}
        <div className="h-14 bg-white border border-blue-100/60 rounded-2xl animate-pulse shadow-sm flex items-center justify-between px-5 py-3">
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 bg-slate-100 rounded-xl" />
            <div className="h-8 w-16 bg-slate-100 rounded-lg" />
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-blue-100 rounded-2xl overflow-hidden p-4 flex flex-col gap-4 animate-pulse shadow-sm"
            >
              {/* Top Accent line bar simulation */}
              <div className="h-1 bg-slate-200 -mx-4 -mt-4 mb-2" />

              {/* Logo / Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-250" />
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>

              {/* Title & Employer */}
              <div className="space-y-2.5">
                <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-3 w-1/2 bg-slate-150 rounded-md" />
              </div>

              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded-md" />
                <div className="h-3 w-5/6 bg-slate-100 rounded-md" />
              </div>

              {/* Divider & Footer */}
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="h-3 w-20 bg-slate-100 rounded-md" />
                <div className="h-3 w-24 bg-slate-100 rounded-md" />
              </div>

              {/* Button */}
              <div className="h-9 w-full bg-slate-100 rounded-xl mt-1" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
