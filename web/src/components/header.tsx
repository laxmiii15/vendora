export function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-xl font-semibold tracking-tight">Vendora</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Marketplace
        </span>
      </div>
    </header>
  );
}
