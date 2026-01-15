"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Request } from "@/lib/api/request";
import { formatUTCDateToBrasilia } from "@/utils/date";
import TextInput from "@/components/TextInput";
import DateRangePicker from "@/components/DateRangePicker";

type TabType = "all" | "pending" | "approved" | "rejected";

const ITEMS_PER_PAGE = 5;

interface RequestsListProps {
  initialRequests: Request[];
}

export default function RequestsList({ initialRequests }: RequestsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [nameFilter, setNameFilter] = useState(searchParams.get("name") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const requests = Array.isArray(initialRequests) ? initialRequests : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (nameFilter) {
      params.set("name", nameFilter);
    } else {
      params.delete("name");
    }

    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    router.push(`/solicitacoes/aprovar?${params.toString()}`);
    setIsDatePickerOpen(false);
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    setNameFilter("");
    setStartDate("");
    setEndDate("");
    params.delete("name");
    params.delete("startDate");
    params.delete("endDate");
    router.push("/solicitacoes/aprovar");
    setIsDatePickerOpen(false);
  };

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatDateDisplay = () => {
    if (!startDate && !endDate) return "Selecionar período";
    if (startDate && endDate) {
      const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return "Selecionar período";
  };

  const getStatusColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[color] || "bg-gray-500";
  };

  const setStatus = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };
    return colors[status];
  };

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((request) => request.status === activeTab);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  const handleRequestClick = (requestId: string) => {
    router.push(`/solicitacoes/aprovar/${requestId}`);
  };

  const tabs = [
    { id: "all" as TabType, label: "Todas", count: requests.length },
    {
      id: "pending" as TabType,
      label: "Pendentes",
      count: requests.filter((r) => r.status === "pending").length,
    },
    {
      id: "approved" as TabType,
      label: "Aprovadas",
      count: requests.filter((r) => r.status === "approved").length,
    },
    {
      id: "rejected" as TabType,
      label: "Rejeitadas",
      count: requests.filter((r) => r.status === "rejected").length,
    },
  ];

  return (
    <div className="w-full max-w-7xl py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Solicitações do departamento
        </h1>
        <p className="text-gray-600 text-sm">
          Gerencie as solicitações dos colaboradores do seu departamento
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(0);
              }}
              className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="block">{tab.label}</span>
              <span
                className={`block text-xs mt-1 ${
                  activeTab === tab.id ? "text-primary" : "text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <TextInput
            className="w-full"
            label="Filtrar por nome"
            placeholder="Digite o nome do colaborador"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
          />
          <div className="relative w-full md:flex-1" ref={datePickerRef}>
            <label className="text-xs text-gray-500 block mb-1">Período</label>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 text-left focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
            >
              {formatDateDisplay()}
            </button>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <DateRangePicker
                  onRangeChange={handleRangeChange}
                  initialStartDate={startDate}
                  initialEndDate={endDate}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleFilterSubmit}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap w-full md:w-auto"
          >
            Filtrar
          </button>
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap w-full md:w-auto"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {currentItems.length > 0 ? (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Colaborador
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40"
                    >
                      Dia solicitado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Motivo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32"
                    >
                      Criado em
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40"
                    >
                      Aprovado por
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((solicitacao) => (
                    <tr
                      key={solicitacao.id}
                      onClick={() => handleRequestClick(solicitacao.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-gray-500 font-medium text-sm">
                        {solicitacao.company
                          ? `${solicitacao.user || solicitacao.user_id} - ${
                              solicitacao.company
                            }`
                          : solicitacao.user}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-sm whitespace-nowrap">
                        {formatUTCDateToBrasilia(solicitacao.request_date)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                        {solicitacao.reason}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-full h-2 w-2 shrink-0 ${getStatusColorClass(
                              solicitacao.status
                            )}`}
                          ></div>
                          <span className="text-gray-700 whitespace-nowrap">
                            {setStatus(solicitacao.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(solicitacao.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {solicitacao.approver || (
                          <span className="text-gray-400 italic">
                            Aguardando
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {currentItems.map((solicitacao) => (
              <div
                key={solicitacao.id}
                onClick={() => handleRequestClick(solicitacao.id)}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 uppercase">
                      Colaborador
                    </p>
                    <p className="text-gray-500 font-medium text-sm">
                      {solicitacao.user || solicitacao.user_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full h-2 w-2 shrink-0 ${getStatusColorClass(
                        solicitacao.status
                      )}`}
                    ></div>
                    <span className="text-gray-500 font-medium text-sm">
                      {setStatus(solicitacao.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800 uppercase mb-1">
                    Dia solicitado
                  </p>
                  <p className="text-gray-500 font-medium text-sm">
                    {formatUTCDateToBrasilia(solicitacao.request_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800 uppercase mb-1">
                    Motivo
                  </p>
                  <p className="text-gray-600 text-sm truncate max-w-xs">
                    {solicitacao.reason}
                  </p>
                </div>

                <div className="flex justify-between gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 uppercase">
                      Criado em
                    </p>
                    <p className="text-gray-600 text-sm">
                      {new Date(solicitacao.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800 uppercase">
                      Aprovado por
                    </p>
                    <p className="text-gray-600 text-sm">
                      {solicitacao.approver || (
                        <span className="text-gray-400 italic">Aguardando</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {activeTab === "all"
              ? "Nenhuma solicitação encontrada"
              : `Nenhuma solicitação ${
                  activeTab === "pending"
                    ? "pendente"
                    : activeTab === "approved"
                    ? "aprovada"
                    : "rejeitada"
                } encontrada`}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 bg-white rounded-lg shadow-md border border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-sm"
              }`}
            >
              Anterior
            </button>
            <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === totalPages - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-sm"
              }`}
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
