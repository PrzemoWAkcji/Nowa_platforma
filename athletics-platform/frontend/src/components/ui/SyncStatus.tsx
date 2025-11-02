"use client";

import { Clock, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./badge";

/**
 * Komponent pokazujący status synchronizacji danych
 */
export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    // Sprawdzaj status połączenia
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Aktualizuj czas ostatniej synchronizacji co minutę
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 60000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "teraz";
    if (diffInMinutes === 1) return "1 minutę temu";
    if (diffInMinutes < 60) return `${diffInMinutes} minut temu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 godzinę temu";
    return `${diffInHours} godzin temu`;
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center space-x-1"
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      {isOnline && (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Ostatnia synchronizacja: {getTimeAgo(lastSync)}</span>
        </div>
      )}
    </div>
  );
}
