import Container from '../common/Container';

export default function ProductStats({ stats = [] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/70 text-center hover:border-red-200 transition-colors shadow-2xs"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-[11px] text-slate-500 mt-1">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
