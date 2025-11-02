"use client";

import { useIsClient } from "@/hooks/useIsClient";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";

export function ConditionalHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const isClient = useIsClient();

  // Strony, na których nie chcemy wyświetlać headera
  const excludedPaths = [
    "/", // strona główna ma swój własny header
    "/login",
    "/register",
  ];

  // Sprawdź czy aktualna ścieżka jest wykluczona
  const isExcludedPath = excludedPaths.includes(pathname);
  const shouldShowHeader =
    !isExcludedPath && isAuthenticated && user && isClient;

  // Initialize auth on component mount - ZAWSZE wywoływane
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Dodaj padding-top do body gdy header jest widoczny - ZAWSZE wywoływane
  useEffect(() => {
    if (typeof document !== "undefined") {
      const body = document.body;
      if (shouldShowHeader) {
        body.style.paddingTop = "64px"; // h-16 = 64px
      } else {
        body.style.paddingTop = "0";
      }
    }
  }, [shouldShowHeader]);

  // Nie renderuj podczas SSR lub gdy header nie powinien być widoczny
  if (!shouldShowHeader) {
    return null;
  }

  return <Header />;
}
