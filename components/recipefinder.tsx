"use client";

import { useState } from "react";
import ImageInput from "./ImageInput";
import IngredientEditor from "./ingredientseditor";
import RecipeCard from "./Recipecard";
import { resizeImage } from "../lib/image";
import { type Ingredient, mergeIngredients } from "../lib/ingredients";
import type { Recipe } from "../lib/recipes";

type Props = {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
};

export default function RecipeFinder({ ingredients, onIngredientsChange }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  function handleImageChange(file: File | null) {
    setImage(file);
    setError(null);
    setNotice(null);
  }

  async function handleDetect() {
    if (!image) return;

    setIsDetecting(true);
    setError(null);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("image", await resizeImage(image), "bahan.jpg");

      const response = await fetch("/api/detect", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal mendeteksi bahan.");

      const detected: Ingredient[] = data.ingredients;
      if (detected.length === 0) {
        setNotice("Tidak ada bahan makanan yang terdeteksi. Coba foto yang lebih jelas atau ketik manual.");
      } else {
        onIngredientsChange(mergeIngredients(ingredients, detected));
        setNotice(`${detected.length} bahan terdeteksi. Cek dan edit kalau ada yang salah.`);
      }
    } catch (detectError) {
      setError(detectError instanceof Error ? detectError.message : "Terjadi kesalahan.");
    } finally {
      setIsDetecting(false);
    }
  }

  async function handleSearchRecipes() {
    if (ingredients.length === 0) return;

    setIsSearching(true);
    setRecipeError(null);
    setRecipes(null);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients.map((item) => item.name) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal membuat resep.");

      setRecipes(data.recipes);
    } catch (searchError) {
      setRecipeError(searchError instanceof Error ? searchError.message : "Terjadi kesalahan.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-serif text-lg font-semibold text-amber-950">1. Masukkan bahan</h2>
        <IngredientEditor ingredients={ingredients} onChange={onIngredientsChange} />
      </div>

      <details className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" open={image !== null}>
        <summary className="cursor-pointer font-semibold text-amber-950">📷 Atau scan dari foto</summary>

        <div className="mt-4">
          <ImageInput onChange={handleImageChange} />

          <button
            onClick={handleDetect}
            disabled={!image || isDetecting}
            className="mt-4 w-full rounded-xl bg-stone-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDetecting ? "Mendeteksi bahan..." : "Deteksi Bahan"}
          </button>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
          )}
        </div>
      </details>

      <div>
        <h2 className="mb-2 font-serif text-lg font-semibold text-amber-950">2. Cari masakan</h2>
        <button
          onClick={handleSearchRecipes}
          disabled={ingredients.length === 0 || isSearching}
          className="w-full rounded-xl bg-amber-700 px-4 py-3 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSearching ? "Mencari resep..." : "Cari Resep"}
        </button>

        {recipeError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {recipeError}
          </p>
        )}
      </div>

      {recipes && (
        <section className="space-y-4" aria-label="Hasil resep">
          <h2 className="font-serif text-xl font-bold text-amber-950">Bisa dimasak hari ini</h2>
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.title} recipe={recipe} defaultOpen={index === 0} />
          ))}
          <p className="text-xs text-stone-500">
            Resep dibuat oleh AI dan takarannya hanya perkiraan. Pastikan bahan dimasak matang dan cek
            alergi sebelum memasak.
          </p>
        </section>
      )}
    </div>
  );
}
