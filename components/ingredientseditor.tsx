"use client";

import { useState } from "react";
import {
  type Ingredient,
  MAX_INGREDIENTS,
  mergeIngredients,
  parseNames,
} from "../lib/ingredients";

type Props = {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
};

export default function IngredientEditor({ ingredients, onChange }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const names = parseNames(text);
    if (names.length === 0) return;

    const added = names.map((name) => ({ name, confidence: "high" as const }));
    onChange(mergeIngredients(ingredients, added));
    setText("");
  }

  function handleRemove(name: string) {
    onChange(ingredients.filter((item) => item.name !== name));
  }

  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-amber-900">Bahan kamu</h2>
        {ingredients.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-sm text-red-600 hover:underline"
          >
            Hapus semua
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik bahan, pisahkan dengan koma"
          aria-label="Tambah bahan"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-amber-600"
        />
        <button
          type="submit"
          disabled={ingredients.length >= MAX_INGREDIENTS}
          className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-40"
        >
          Tambah
        </button>
      </form>

      {ingredients.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          Belum ada bahan. Ketik di atas atau foto bahan kamu.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {ingredients.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-1 rounded-full bg-amber-100 py-1 pl-3 pr-1 text-sm text-amber-900"
            >
              <span>
                {item.name}
                {item.confidence === "low" && " (?)"}
              </span>
              <button
                onClick={() => handleRemove(item.name)}
                aria-label={`Hapus ${item.name}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-amber-700 hover:bg-amber-200"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {ingredients.length >= MAX_INGREDIENTS && (
        <p className="mt-2 text-xs text-gray-500">Maksimal {MAX_INGREDIENTS} bahan.</p>
      )}
    </section>
  );
}
