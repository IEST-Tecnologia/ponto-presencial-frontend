"use client";

import React, { useEffect, useState } from "react";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { useSearchParams } from "next/navigation";

export default function Login() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      // If there's an error, don't auto-redirect
      switch (errorParam) {
        case "no_code":
          setError("Código de autorização não encontrado.");
          break;
        case "auth_failed":
          setError("Falha na autenticação. Tente novamente.");
          break;
        default:
          setError("Ocorreu um erro durante o login.");
      }
    } else {
      // Auto-redirect to Keycloak login
      setIsRedirecting(true);
      const returnUrl = searchParams.get("returnUrl");
      const loginUrl = returnUrl
        ? `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : "/api/auth/login";
      window.location.href = loginUrl;
    }
  }, [searchParams]);
  const handleManualLogin = () => {
    setError(null);
    setIsRedirecting(true);
    try {
      const returnUrl = searchParams.get("returnUrl");
      const loginUrl = returnUrl
        ? `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : "/api/auth/login";
      window.location.href = loginUrl;
    } catch (err) {
      setError("Erro ao iniciar processo de login.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Ponto Presencial
            </h1>
            <p className="text-gray-600">Sistema de Registro de Ponto</p>
          </div>

          {/* Content */}
          {isRedirecting ? (
            <div className="py-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600">
                  Redirecionando para login seguro...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleManualLogin}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                Fazer Login
                <HiArrowRightEndOnRectangle className="text-xl" />
              </button>

              <p className="text-xs text-gray-500 text-center">
                Você será redirecionado para o servidor de autenticação seguro
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Erro de Autenticação
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
