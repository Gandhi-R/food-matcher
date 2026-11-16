export type Recipe = {
  title: string;
  description: string;
  time_minutes: number;
  servings: number;
  uses: string[]; // bahan yang sudah dimiliki
  missing: string[]; // bahan yang perlu dibeli
  steps: string[];
};
