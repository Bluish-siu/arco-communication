import Container from '../common/Container';

export default function TrustedBy() {
  const companies = [
    {
      id: 'novacart',
      render: () => (
        <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-700">
          Nova<span className="font-light text-slate-500">Cart</span>
        </span>
      ),
    },
    {
      id: 'urbannest',
      render: () => (
        <span className="text-lg sm:text-xl font-medium tracking-wide text-slate-600 lowercase">
          urban<span className="font-extrabold text-slate-800">nest</span>
        </span>
      ),
    },
    {
      id: 'learnora',
      render: () => (
        <span className="text-base sm:text-lg font-black tracking-widest text-slate-700 uppercase">
          Learn<span className="font-normal text-slate-500">ora</span>
        </span>
      ),
    },
    {
      id: 'finova',
      render: () => (
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800">
          Fin<span className="font-light text-slate-600">ova</span>
        </span>
      ),
    },
    {
      id: 'healthbridge',
      render: () => (
        <span className="text-lg sm:text-xl font-semibold tracking-normal text-slate-700">
          Health<span className="font-bold text-slate-900">Bridge</span>
        </span>
      ),
    },
    {
      id: 'travelnest',
      render: () => (
        <span className="text-base sm:text-lg font-bold tracking-wider text-slate-600 uppercase">
          Travel<span className="font-black text-slate-800">Nest</span>
        </span>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-semibold tracking-wide uppercase text-slate-500">
            Powering conversations for growing businesses
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            From startups to growing enterprises, businesses use ARCO Communication to connect with their customers at scale.
          </p>
        </div>

        {/* Typographic Fictional Wordmarks Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 items-center justify-items-center opacity-75 hover:opacity-100 transition-opacity duration-300">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-center p-2 hover:scale-105 transition-transform duration-200"
            >
              {company.render()}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
