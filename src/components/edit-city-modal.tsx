"use client";

import { useEffect, useState } from "react";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  numberOfPlayers: number;
  onSave: (cityName: string, numberOfPlayers: number) => Promise<void>;
}

export function EditCityModal({ 
  isOpen, 
  onClose, 
  cityName, 
  numberOfPlayers, 
  onSave 
}: EditCityModalProps) {
  const [newCityName, setNewCityName] = useState(cityName);
  const [newNumberOfPlayers, setNewNumberOfPlayers] = useState(numberOfPlayers);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewCityName(cityName);
      setNewNumberOfPlayers(numberOfPlayers);
      setError(null);
    }
  }, [isOpen, cityName, numberOfPlayers]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!newCityName.trim()) {
      setError("Nome da cidade é obrigatório");
      return;
    }

    if (newCityName.length < 2) {
      setError("Nome da cidade deve ter pelo menos 2 caracteres");
      return;
    }

    if (newCityName.length > 14) {
      setError("Nome da cidade não pode exceder 14 caracteres");
      return;
    }

    if (newNumberOfPlayers < 1 || newNumberOfPlayers > 10) {
      setError("Número de jogadores deve ser entre 1 e 10");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(newCityName.trim(), newNumberOfPlayers);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const incrementPlayers = () => {
    if (newNumberOfPlayers < 10) {
      setNewNumberOfPlayers(newNumberOfPlayers + 1);
    }
  };

  const decrementPlayers = () => {
    if (newNumberOfPlayers > 1) {
      setNewNumberOfPlayers(newNumberOfPlayers - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          disabled={isSaving}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Card */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Editar Cidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* City Name Field */}
            <div className="space-y-2">
              <Label htmlFor="cityName">Nome da cidade</Label>
              <Input
                id="cityName"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Digite o nome da cidade"
                disabled={isSaving}
                maxLength={14}
              />
            </div>

            {/* Number of Players Field */}
            <div className="space-y-2">
              <Label htmlFor="numberOfPlayers">Número de jogadores</Label>
              <div className="flex items-center space-x-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={decrementPlayers}
                  disabled={newNumberOfPlayers <= 1 || isSaving}
                >
                  -
                </Button>
                <div className="flex items-center space-x-2 min-w-[80px] justify-center">
                  <Users className="h-4 w-4" />
                  <span className="text-lg font-medium">{newNumberOfPlayers}</span>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={incrementPlayers}
                  disabled={newNumberOfPlayers >= 10 || isSaving}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 