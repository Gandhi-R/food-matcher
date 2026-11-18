export type DishAnalysis = {
  name: string;
  kind: "dish" | "product";
  source: "label" | "estimate";
  description: string;
  main_ingredients: string[];
  seasonings: string[];
  steps: string[];
  notes: string;
};
