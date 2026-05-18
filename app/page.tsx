"use client";

import dynamic from "next/dynamic";

const Converter = dynamic(
  () => import("@/components/converter").then((m) => m.Converter),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md h-52 rounded-2xl border border-ink/10 bg-white/20 animate-pulse" />
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-ink leading-tight">
          conversor de vídeos pra minha namorada
        </h1>
        <p className="mt-3 text-ink/60 max-w-xs mx-auto leading-relaxed">
          clica no quadro abaixo e seleciona o video que vc quer corrigir, neném
        </p>
      </header>

      <Converter />

      <footer className="mt-16 text-center text-ink/25 text-xs">
        feito pra minha princesa
      </footer>
    </main>
  );
}
