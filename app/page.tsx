"use client";

import { useState } from "react";
import DishAnalyzer from "../components/dishanalyzher";
import RecipeFinder from "../components/recipefinder";
import { type Ingredient, mergeIngredients } from "../lib/ingredients";

type Tab = "recipes" | "dish";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "recipes", label: "🥕 Bahan → Resep", hint: "Punya bahan, mau masak apa?" },
  { id: "dish", label: "🍛 Makanan → Bahan", hint: "Lihat makanan, apa bahannya?" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("recipes");
  // Daftar bahan disimpan di sini supaya dua tab bisa berbagi
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  function handleUseIngredients(names: string[]) {
    const incoming = names.map((name) => ({ name, confidence: "medium" as const }));
    setIngredients((current) => mergeIngredients(current, incoming));
    setTab("recipes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#fbf6ee] text-stone-900">
      <header className="border-b border-amber-200/60 bg-linear-to-b from-amber-100/70 to-transparent">
        <div className="mx-auto max-w-xl px-4 pb-6 pt-10">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-amber-950">🍳 Food Matcher</h1>
          <p className="mt-2 text-stone-600">
            Dari bahan jadi masakan, atau dari masakan jadi daftar bahan.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-16">
        {/* Tab */}
        <div role="tablist" aria-label="Pilih fitur" className=" grid grid-cols-2 gap-2 py-5">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-amber-700 bg-amber-700 text-white shadow"
                    : "border-stone-200 bg-white text-stone-700 hover:border-amber-400"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`block text-xs ${active ? "text-amber-100" : "text-stone-500"}`}>
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dua-duanya tetap dirender supaya hasil tidak hilang saat pindah tab */}
        <div role="tabpanel" hidden={tab !== "recipes"}>
          <RecipeFinder ingredients={ingredients} onIngredientsChange={setIngredients} />
        </div>
        <div role="tabpanel" hidden={tab !== "dish"}>
          <DishAnalyzer onUseIngredients={handleUseIngredients} />
        </div>

        <footer className="mt-12 border-t border-amber-200/60 pt-6 text-xs leading-relaxed text-stone-500">
          <p>
            <strong className="font-semibold text-stone-600">Privasi:</strong> Jangan unggah foto yang
            bersifat pribadi.
          </p>
          <p className="mt-2">
            Hasil ini hanya perkiraan dan bukan acuan alergi atau gizi.
          </p>
        </footer>
      </div>
    </main>
  );
}