import { CompetitionLogo } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filtruje logo, zwracając tylko te, które są widoczne
 */
export function getVisibleLogos(
  logos: CompetitionLogo[] | undefined
): CompetitionLogo[] {
  return (logos || []).filter((logo) => logo.isVisible !== false);
}
