import fr from "@/i18n/dictionaries/fr";
import { formatDate as formatDateIn, formatTND as formatTNDIn } from "@/i18n/format";

// The back-office is an internal tool in French: it reads labels from the French dictionary.
export const labels = fr.labels;

export function formatTND(amount: number) {
  return formatTNDIn(amount, "fr");
}

export function formatDate(iso: string) {
  return formatDateIn(iso, "fr");
}
