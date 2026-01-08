"use client";

import SelectableCalendar from "@/components/SelectableCalendar";
import { useToast } from "@/contexts/ToastContext";
import { CreateRequest } from "@/lib/api/request";
import { TimeRecord } from "@/models/timeRecord";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

export default function Form({ records }: { records: TimeRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError("Por favor, selecione uma data");
      return;
    }

    if (!reason.trim()) {
      setError("Por favor, informe o motivo da solicitação");
      return;
    }

    startTransition(async () => {
      try {
        const dateString = `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

        const res = await CreateRequest(reason, dateString);
        if (res.success) {
          showToast("Solicitação criada");
          // Redirecionar para lista de solicitações após sucesso
          router.push("/solicitacoes");
        } else if (!res.success) {
          showToast(res.errorMessage, "error");
        }
      } catch (err) {
        setError("Erro ao criar solicitação. Tente novamente.");
        console.error("Erro ao criar solicitação:", err);
      }
    });
  };

  const handleCancel = () => {
    router.push("/solicitacoes");
  };
  return (
    <div className="w-full flex flex-col items-center py-3 max-w-md mx-auto space-y-6">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Nova Solicitação</h1>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          disabled={isPending}
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full flex flex-col items-center"
      >
        <div className="w-full flex-col items-center">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Selecione a data <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Selecione um dia em que você não registrou ponto
          </p>
          <SelectableCalendar
            records={records}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        <div className="w-full flex-col items-center">
          <label
            htmlFor="reason"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            Motivo da solicitação <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700"
            placeholder="Descreva o motivo da sua solicitação..."
            disabled={isPending}
            maxLength={500}
          />
          <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
            <span>Seja claro e objetivo</span>
            <span>{reason.length}/500</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="w-full flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              "Enviar Solicitação"
            )}
          </button>
        </div>
      </form>

      <div className="w-full mb-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Informações importantes
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li className="mb-2">
            Só é possível solicitar ajustes para dias sem registro de ponto
          </li>
          <li>Sua solicitação será analisada pelo gestor responsável</li>
        </ul>
      </div>
    </div>
  );
}
