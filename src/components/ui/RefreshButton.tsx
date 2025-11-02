"use client";

import { useDataSync } from "@/hooks/useDataSync";
import { useToast } from "@/hooks/useToast";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

interface RefreshButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * Przycisk do ręcznego odświeżania danych
 * Pokazuje animację podczas odświeżania
 */
export function RefreshButton({
  variant = "outline",
  size = "sm",
  className = "",
}: RefreshButtonProps) {
  const { forceFullSync } = useDataSync();
  const { syncMessages } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      syncMessages.started();
      forceFullSync();
      // Symuluj krótkie opóźnienie dla lepszego UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
      syncMessages.completed();
    } catch (error) {
      syncMessages.error();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`${className} ${isRefreshing ? "opacity-75" : ""}`}
      title="Odśwież dane"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {size !== "sm" && (
        <span className="ml-2">
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </span>
      )}
    </Button>
  );
}
