"use client";

import DateRangePicker from "@/components/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { downloadAttendanceReport } from "@/lib/api/reports";
import Link from "next/link";
import React, { useState, useTransition, useCallback } from "react";

type DateProps = {
  startDate: string;
  endDate: string;
};

export default function Page() {
  const [dates, setDates] = useState<DateProps>({
    startDate: "",
    endDate: "",
  });
  const [isLoading, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      setDates({ startDate, endDate });
    },
    []
  );

  const handleDownloadReport = async ({ startDate, endDate }: DateProps) => {
    startTransition(async () => {
      try {
        if (startDate && endDate) {
          const result = await downloadAttendanceReport(startDate, endDate);

          if (!result.success || !result.data) {
            showToast(result.error || "Erro ao baixar relatório", "error");
            return;
          }

          // Create a download link and trigger download
          const url = window.URL.createObjectURL(result.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = result.filename || "relatorio-presenca.xlsx";
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          showToast("Relatório baixado com sucesso!");
        } else {
          showToast("Data inicial e data final são obrigatórios", "error");
        }
      } catch (error) {
        console.error("Failed to download report:", error);
        showToast("Erro ao baixar relatório", "error");
      }
    });
  };
  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center space-y-3">
      <div className="w-full flex justify-start">
        <Link
          className="text-gray-800 text-left font-semibold hover:text-blue-800"
          href="/"
        >
          ← Voltar
        </Link>
      </div>
      <DateRangePicker onRangeChange={handleRangeChange} />
      <button
        disabled={isLoading || !dates.startDate || !dates.endDate}
        onClick={() => handleDownloadReport(dates)}
        className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Baixar Relatório
      </button>
    </div>
  );
}
