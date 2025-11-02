"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useCompetitionLogos,
  useDeleteCompetitionLogo,
  useToggleLogoVisibility,
  useUploadCompetitionLogos,
} from "@/hooks/useCompetitionLogos";
import { CompetitionLogo } from "@/types";
import { AlertCircle, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface CompetitionLogoManagerProps {
  competitionId: string;
}

export function CompetitionLogoManager({
  competitionId,
}: CompetitionLogoManagerProps) {
  const [uploading, setUploading] = useState(false);

  // Fetch existing logos
  const {
    data: logosData,
    isLoading,
    error,
  } = useCompetitionLogos(competitionId);
  const logos = logosData || [];

  console.log("CompetitionLogoManager:", {
    competitionId,
    logosData,
    isLoading,
    error,
    logos,
  });

  // Upload mutation
  const uploadMutation = useUploadCompetitionLogos(competitionId, {
    onSuccess: () => {
      toast.success("Logo zostały przesłane pomyślnie");
    },
    onError: (error: any) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Błąd podczas przesyłania logo"
      );
    },
  });

  // Delete mutation
  const deleteMutation = useDeleteCompetitionLogo(competitionId, {
    onSuccess: () => {
      toast.success("Logo zostało usunięte");
    },
    onError: (error: any) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Błąd podczas usuwania logo"
      );
    },
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useToggleLogoVisibility(competitionId, {
    onSuccess: () => {
      toast.success("Widoczność logo została zaktualizowana");
    },
    onError: (error: any) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Błąd podczas zmiany widoczności logo"
      );
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Validate file count
      if (logos.length + acceptedFiles.length > 10) {
        toast.error(
          `Można przesłać maksymalnie 10 logo. Obecnie masz ${logos.length} logo.`
        );
        return;
      }

      // Validate file sizes
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error("Niektóre pliki są większe niż 5MB");
        return;
      }

      setUploading(true);
      try {
        await uploadMutation.mutateAsync(acceptedFiles);
      } finally {
        setUploading(false);
      }
    },
    [logos.length, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
    },
    maxFiles: 10 - logos.length,
    disabled: uploading || logos.length >= 10,
  });

  const handleDelete = (logoId: string) => {
    if (confirm("Czy na pewno chcesz usunąć to logo?")) {
      deleteMutation.mutate(logoId);
    }
  };

  const handleToggleVisibility = (logoId: string, isVisible: boolean) => {
    toggleVisibilityMutation.mutate({ logoId, isVisible });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading logos:", error);
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Błąd podczas ładowania logo</p>
          <p className="text-sm text-gray-500 mt-1">
            {error?.message || "Sprawdź połączenie z serwerem"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Competition ID: {competitionId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {logos.length < 10 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Upuść pliki tutaj...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Przeciągnij i upuść logo lub kliknij, aby wybrać pliki
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF, SVG, WEBP do 5MB każdy. Maksymalnie{" "}
                {10 - logos.length} plików.
              </p>
            </div>
          )}
          {uploading && <p className="text-blue-600 mt-2">Przesyłanie...</p>}
        </div>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Dodaj do 10 logo, które będą wyświetlane w programie minutowym,
          wynikach i listach startowych. Możesz wybrać, które logo mają być
          widoczne używając przełączników. Zalecane wymiary to kwadrat lub
          prostokąt, który będzie dobrze wyglądał na kartce A4.
        </AlertDescription>
      </Alert>

      {/* Existing Logos */}
      {logos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Przesłane logo ({logos.length}/10)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logos.map((logo: CompetitionLogo) => (
              <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {logo.mimetype.startsWith("image/") ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logo.url}`}
                      alt={logo.originalName}
                      width={200}
                      height={200}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p
                    className="text-sm font-medium truncate"
                    title={logo.originalName}
                  >
                    {logo.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(logo.size)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(logo.uploadedAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>

                {/* Przełącznik widoczności */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">
                    {logo.isVisible !== false ? "Widoczne" : "Ukryte"}
                  </span>
                  <Switch
                    checked={logo.isVisible !== false} // domyślnie true jeśli nie ma pola
                    onCheckedChange={(checked) =>
                      handleToggleVisibility(logo.id, checked)
                    }
                    disabled={toggleVisibilityMutation.isPending}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(logo.id)}
                  disabled={deleteMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {logos.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Brak przesłanych logo</p>
        </div>
      )}
    </div>
  );
}
