"use client";

import DateRangePicker from "@/components/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { GetValidCompanies, ResponseCompanie } from "@/lib/api/companies";
import { downloadAttendanceReport } from "@/lib/api/reports";
import Link from "next/link";
import React, { useState, useTransition, useCallback, useEffect } from "react";

type DateProps = {
  startDate: string;
  endDate: string;
};

const ALL_COMPANIES = "all";

export default function Page() {
  const [dates, setDates] = useState<DateProps>({
    startDate: "",
    endDate: "",
  });
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(ALL_COMPANIES);
  console.log(selectedCompany);

  const [isLoading, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      setDates({ startDate, endDate });
    },
    []
  );

  useEffect(() => {
    async function fetchCompanies() {
      const response = await GetValidCompanies();
      setCompanies(response.data ?? []);
    }

    fetchCompanies();
  }, []);

  const handleDownloadReport = async ({ startDate, endDate }: DateProps) => {
    startTransition(async () => {
      try {
        if (startDate && endDate) {
          const result = await downloadAttendanceReport(
            startDate,
            endDate,
            selectedCompany
          );

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

      <div className="w-full">
        <label className="text-xs text-gray-500 block mb-1">Empresa</label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors bg-white"
        >
          <option value={ALL_COMPANIES}>Todas</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
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
