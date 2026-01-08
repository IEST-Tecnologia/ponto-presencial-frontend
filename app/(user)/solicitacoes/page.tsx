"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetUserRequests } from "@/lib/api/request";
import { Request } from "@/lib/api/request";
import { formatUTCDateToBrasilia } from "@/utils/date";

const ITEMS_PER_PAGE = 3;

export default function Page() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = requests.slice(startIndex, endIndex);

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

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      const req = await GetUserRequests();
      setRequests(req);
      setIsLoading(false);
    }

    fetchRequests();
  }, []);

  const handleNewRequest = () => {
    router.push("/solicitacoes/nova");
  };

  return (
    <>
      <div className="w-full max-w-7xl py-6">
        <div className="flex flex-col items-center  gap-3 mb-4">
          <p className="text-gray-700 font-semibold text-center sm:text-left">
            Acompanhe suas solicitações
          </p>
          <button
            onClick={handleNewRequest}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            + Nova Solicitação
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Carregando solicitações...</span>
            </div>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32"
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
                        Gestor responsável
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((solicitacao) => (
                      <tr
                        key={solicitacao.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-gray-500 font-medium text-sm whitespace-nowrap">
                          {formatUTCDateToBrasilia(solicitacao.request_date)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 w-36">
                          <div
                            className="truncate max-w-xs"
                            title={solicitacao.reason}
                          >
                            {solicitacao.reason}
                          </div>
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 w-full">
              {currentItems.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3 w-full"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 uppercase">
                        Dia solicitado
                      </p>
                      <p className="text-gray-500 font-medium text-sm">
                        {formatUTCDateToBrasilia(solicitacao.request_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full h-2 w-2 shrink-0 ${getStatusColorClass(
                          solicitacao.status
                        )}`}
                      ></div>
                      <span className="text-sm text-gray-500 font-medium">
                        {setStatus(solicitacao.status)}
                      </span>
                    </div>
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
                        Gestor responsável
                      </p>
                      <p className="text-gray-600 text-sm">
                        {solicitacao.approver || (
                          <span className="text-gray-400 italic">
                            Aguardando
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center text-gray-500">
            Nenhuma solicitação encontrada
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
    </>
  );
}
