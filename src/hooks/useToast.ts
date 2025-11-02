import { toast } from "sonner";

/**
 * Hook do wyświetlania powiadomień toast
 * Zapewnia spójne komunikaty w całej aplikacji
 */
export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    });
  };

  const showInfo = (message: string) => {
    toast.info(message, {
      duration: 4000,
      position: "top-right",
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      position: "top-right",
    });
  };

  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  // Predefiniowane komunikaty dla częstych akcji
  const registrationMessages = {
    deleted: () => showSuccess("Rejestracja została usunięta"),
    confirmed: () => showSuccess("Rejestracja została potwierdzona"),
    rejected: () => showSuccess("Rejestracja została odrzucona"),
    created: () => showSuccess("Rejestracja została utworzona"),
    updated: () => showSuccess("Rejestracja została zaktualizowana"),
    error: (action: string) =>
      showError(`Wystąpił błąd podczas ${action} rejestracji`),
  };

  const competitionMessages = {
    created: () => showSuccess("Zawody zostały utworzone"),
    updated: () => showSuccess("Zawody zostały zaktualizowane"),
    deleted: () => showSuccess("Zawody zostały usunięte"),
    error: (action: string) =>
      showError(`Wystąpił błąd podczas ${action} zawodów`),
  };

  const athleteMessages = {
    created: () => showSuccess("Zawodnik został utworzony"),
    updated: () => showSuccess("Zawodnik został zaktualizowany"),
    deleted: () => showSuccess("Zawodnik został usunięty"),
    imported: (count: number) =>
      showSuccess(`Zaimportowano ${count} zawodników`),
    error: (action: string) =>
      showError(`Wystąpił błąd podczas ${action} zawodnika`),
  };

  const eventMessages = {
    created: () => showSuccess("Konkurencja została utworzona"),
    updated: () => showSuccess("Konkurencja została zaktualizowana"),
    deleted: () => showSuccess("Konkurencja została usunięta"),
    error: (action: string) =>
      showError(`Wystąpił błąd podczas ${action} konkurencji`),
  };

  const syncMessages = {
    started: () => showInfo("Synchronizacja danych..."),
    completed: () => showSuccess("Dane zostały odświeżone"),
    error: () => showError("Błąd podczas synchronizacji danych"),
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss,
    registrationMessages,
    competitionMessages,
    athleteMessages,
    eventMessages,
    syncMessages,
  };
};
