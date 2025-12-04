"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { createTimeRecord, validateLocation } from "@/lib/api/timeRecords";
import Loading from "./Loading";

interface TimeRegisterProps {
  userName: string;
  alreadyRegistered: boolean;
}

export default function TimeRegister({
  userName,
  alreadyRegistered,
}: TimeRegisterProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [locationResult, setLocationResult] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [officeId, setOfficeId] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(position);
        const res = await validateLocation(latitude, longitude, accuracy);
        console.log(res);
        if (res) {
          setIsValid(res.valid);
          setOfficeId(res.officeId);
          setLocationResult({
            lat: latitude,
            lng: longitude,
          });
        } else {
          setIsValid(false);
        }
        setIsLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Permissão de localização negada");
          setPermissionDenied(true);
        } else {
          setLocationError("Erro ao obter localização");
          setPermissionDenied(false);
        }
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setRetryCount((c) => c + 1);
  };

  const handleCheckIn = async () => {
    if (!locationResult) return;
    setIsSubmitting(true);
    try {
      const coordinates = {
        lat: locationResult.lat,
        lng: locationResult.lng,
      };
      await createTimeRecord(coordinates, officeId);

      showToast("Ponto registrado!");
      router.push("/records");
    } catch (error) {
      console.error("Failed to register time record:", error);
      showToast("Erro ao registrar ponto. Tente novamente.", "error");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="text-center space-y-6 flex-1 flex flex-col justify-center items-center">
      <p className="text-lg text-gray-700">
        Olá, <span className="font-semibold">{userName}</span>!
      </p>

      {locationError && (
        <div className="space-y-4">
          <div className="text-xl font-bold text-red-500">{locationError}</div>
          {permissionDenied ? (
            <p className="text-sm text-gray-600 max-w-xs">
              Para registrar o ponto, é necessário permitir o acesso à sua
              localização nas configurações do navegador.
            </p>
          ) : (
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {!isValid && !locationError && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-orange-500 shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-orange-800">
                Fora do raio permitido
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Você precisa estar próximo ao local de trabalho para registrar o
                ponto.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckIn}
        disabled={!isValid || isSubmitting || alreadyRegistered}
        className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
          isValid && !isSubmitting && !alreadyRegistered
            ? "bg-primary text-white cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isSubmitting
          ? "Registrando..."
          : alreadyRegistered
          ? "Já registrado hoje"
          : "Registrar Ponto"}
      </button>

      {/* {locationResult && (
        <div className="space-y-1 text-sm text-gray-600">
          <p>Distância: {locationResult.distance.toFixed(0)}m</p>
          <p>Precisão: ±{locationResult.accuracy.toFixed(0)}m</p>
          <p>Raio permitido: {RADIUS}m</p>
        </div>
      )} */}
    </div>
  );
}
