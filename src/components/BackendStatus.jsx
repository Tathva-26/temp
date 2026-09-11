export default function BackendStatus({
  title = "Coming soon",
  message = "This feature will be available soon.",
  children
}) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent px-4 md:px-8 py-16 text-center text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center max-w-2xl">
        <p className="poppins text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
          TATHVA&apos;26 / STATUS
        </p>
        <div className="mx-auto mt-6 h-px w-20 bg-white/60" />
        <h1 className="pp-fragment mt-7 text-[clamp(2rem,10vw,7rem)] text-center uppercase leading-none tracking-wide text-white">
          {title}
        </h1>
        <p className="poppins mx-auto mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
          {message}
        </p>
        <p className="monocraft mt-10 text-[10px] uppercase tracking-[0.24em] text-white/35">
          Website launching in 2026
        </p>
        {children && (
          <div className="mt-12 flex justify-center w-full">
            {children}
          </div>
        )}
      </div>
    </main>
  );
}
