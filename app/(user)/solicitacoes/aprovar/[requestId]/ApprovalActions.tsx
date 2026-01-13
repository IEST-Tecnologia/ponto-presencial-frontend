"use client";

import { useToast } from "@/contexts/ToastContext";
import { UpdateRequestStatus } from "@/lib/api/request";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface ApprovalActionsProps {
  requestId: string;
}

export default function ApprovalActions({ requestId }: ApprovalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const { showToast } = useToast();

  const handleApprove = () => {
    setActionType("approve");
    startTransition(async () => {
      try {
        const result = await UpdateRequestStatus(requestId, "approved");
        if (result) {
          showToast("Solicitação aprovada com sucesso");
          router.refresh();
        }
      } catch (error) {
        showToast("Erro ao aprovar solicitação");
        console.error("Erro ao aprovar:", error);
        setActionType(null);
      }
    });
  };

  const handleReject = () => {
    setActionType("reject");
    startTransition(async () => {
      try {
        const result = await UpdateRequestStatus(requestId, "rejected");
        if (result) {
          showToast("Solicitação rejeitada");
          router.refresh();
        }
      } catch (error) {
        showToast("Erro ao rejeitar solicitação");
        console.error("Erro ao rejeitar:", error);
        setActionType(null);
      }
    });
  };

  return (
    <div className="w-full flex gap-3">
      <button
        onClick={handleReject}
        disabled={isPending}
        className="flex-1 px-6 py-3 border border-red-300 text-red-700 font-medium rounded-lg bg-white hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && actionType === "reject" ? (
          <>
            <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            Rejeitando...
          </>
        ) : (
          "Rejeitar"
        )}
      </button>
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && actionType === "approve" ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Aprovando...
          </>
        ) : (
          "Aprovar"
        )}
      </button>
    </div>
  );
}
