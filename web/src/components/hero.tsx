const HERO_IMAGE =
  'https://images.pexels.com/photos/3978335/pexels-photo-3978335.jpeg?auto=compress&cs=tinysrgb&w=1920';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-black/20" />

      <div className="mx-auto flex min-h-[480px] max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[540px] sm:py-20">
        <h1 className="max-w-xl font-display text-5xl leading-tight font-semibold text-white text-balance sm:text-6xl">
          Dresses for <em className="italic">every</em> aesthetic.
        </h1>
        <p className="mt-4 max-w-md text-base text-white/85">
          From everyday jeans to statement dresses — curated womenswear in
          every size, from independent sellers across Vendora.
        </p>
        <div className="mt-8">
          <a
            href="#shop"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            Shop now
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
