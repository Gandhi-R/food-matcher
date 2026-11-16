import type { Recipe } from "../lib/recipes";

export default function RecipeCard({ recipe, defaultOpen }: { recipe: Recipe; defaultOpen?: boolean }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-amber-900">{recipe.title}</h3>
      <p className="mt-1 text-sm text-gray-600">{recipe.description}</p>

      <p className="mt-2 text-xs text-gray-500">
        {recipe.time_minutes > 0 && <>⏱️ ±{recipe.time_minutes} menit</>}
        {recipe.time_minutes > 0 && recipe.servings > 0 && " · "}
        {recipe.servings > 0 && <>🍽️ {recipe.servings} porsi</>}
      </p>

      <div className="mt-3 space-y-2 text-sm">
        <div>
          <span className="font-medium text-green-800">✅ Sudah ada: </span>
          {recipe.uses.length > 0 ? recipe.uses.join(", ") : "-"}
        </div>
        <div>
          <span className="font-medium text-red-700">🛒 Perlu dibeli: </span>
          {recipe.missing.length > 0 ? recipe.missing.join(", ") : "tidak ada, lengkap!"}
        </div>
      </div>

      <details className="mt-3" open={defaultOpen}>
        <summary className="cursor-pointer text-sm font-medium text-amber-700">
          Cara membuat
        </summary>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-800">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </details>
    </article>
  );
}
