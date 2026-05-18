"use client";

import { useState } from "react";
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
  const [done, setDone] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-ink leading-tight">
          {done
            ? "video convertido com sucesso"
            : "conversor de vídeos pra minha namorada"}
        </h1>
      </header>

      <Converter
        onComplete={() => setDone(true)}
        onReset={() => setDone(false)}
      />

      <footer className="mt-16 text-center text-ink/25 text-xs">
        vai la com a sombrinha vai
      </footer>
    </main>
  );
}
