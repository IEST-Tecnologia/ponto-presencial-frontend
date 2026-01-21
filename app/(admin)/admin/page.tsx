"use client";

import DateRangePicker from "@/components/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { GetValidCompanies, GetUsersByCompany, User } from "@/lib/api/companies";
import { downloadAttendanceReport } from "@/lib/api/reports";
import Link from "next/link";
import React, { useState, useTransition, useCallback, useEffect, useRef } from "react";

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const usersDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    async function fetchUsers() {
      if (selectedCompany === ALL_COMPANIES) {
        setUsers([]);
        setSelectedUsers([]);
        return;
      }

      setIsLoadingUsers(true);
      const response = await GetUsersByCompany(selectedCompany);
      const fetchedUsers = response.data ?? [];
      setUsers(fetchedUsers);
      setSelectedUsers(fetchedUsers.map((user) => user.id));
      setIsLoadingUsers(false);
    }

    fetchUsers();
  }, [selectedCompany]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (usersDropdownRef.current && !usersDropdownRef.current.contains(event.target as Node)) {
        setIsUsersDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadReport = async ({ startDate, endDate }: DateProps) => {
    startTransition(async () => {
      try {
        if (startDate && endDate) {
          // Se todos os usuários estão selecionados, não precisa enviar a lista
          const usersToSend = selectedUsers.length === users.length ? undefined : selectedUsers;

          const result = await downloadAttendanceReport(
            startDate,
            endDate,
            selectedCompany,
            usersToSend
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

      {selectedCompany !== ALL_COMPANIES && (
        <div className="w-full relative" ref={usersDropdownRef}>
          <label className="text-xs text-gray-500 block mb-1">Colaboradores</label>
          {isLoadingUsers ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Carregando colaboradores...</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors bg-white flex items-center justify-between"
              >
                <span>
                  {selectedUsers.length === users.length
                    ? "Todos selecionados"
                    : `${selectedUsers.length} de ${users.length} selecionado(s)`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isUsersDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isUsersDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto shadow-lg">
                  {users.length > 0 ? (
                    <>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map((user) => user.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 font-medium">Selecionar todos</span>
                      </label>
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                              }
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{user.name}</span>
                        </label>
                      ))}
                    </>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

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
