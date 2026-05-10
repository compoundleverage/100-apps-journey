export interface InvestorEvaluation {
  persona: string;
  score: number;
  reasoning: string;
}

export function averageScore(evaluations: InvestorEvaluation[]): number | null {
  if (evaluations.length === 0) return null;
  const sum = evaluations.reduce((acc, e) => acc + e.score, 0);
  return Math.round((sum / evaluations.length) * 10) / 10;
}

export function scoreColor(score: number | null): string {
  if (score === null) return "text-zinc-400";
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-yellow-500";
  if (score >= 4) return "text-orange-500";
  return "text-red-500";
}

export function statusLabel(status: string): string {
  switch (status) {
    case "idea":
      return "Idea";
    case "building":
      return "Building";
    case "shipped":
      return "Shipped";
    case "killed":
      return "Killed";
    default:
      return status;
  }
}
