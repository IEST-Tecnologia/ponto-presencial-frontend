import { GetRequestById } from "@/lib/api/request";
import { redirect } from "next/navigation";
import Link from "next/link";
import RequestCalendar from "@/components/RequestCalendar";
import ApprovalActions from "./ApprovalActions";

export default async function Page({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await GetRequestById(requestId);
  if (!request) return redirect("/solicitacoes/aprovar");

  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";

  const getStatusText = () => {
    if (isApproved) return "Aprovada";
    if (isRejected) return "Rejeitada";
    return "Pendente";
  };

  const getStatusColorClass = () => {
    if (isApproved) return "bg-green-100 text-green-800 border-green-300";
    if (isRejected) return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  return (
    <div className="w-full h-full flex flex-col items-center py-6 max-w-2xl mx-auto px-4 space-y-6">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/solicitacoes/aprovar"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors flex items-center gap-2"
        >
          <span>←</span>
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Detalhes da Solicitação
        </h1>
        <div className="w-20"></div>
      </div>

      <div
        className={`w-full p-4 rounded-lg border-2 flex items-center justify-between ${getStatusColorClass()}`}
      >
        <div>
          <p className="text-sm font-semibold">Status</p>
          <p className="text-lg font-bold">{getStatusText()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`rounded-full h-3 w-3 ${
              isApproved
                ? "bg-green-500"
                : isRejected
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          ></div>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">
            Colaborador
          </p>
          <p className="text-gray-800 font-medium">
            {request.user || request.user_id}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">
            Data da solicitação
          </p>
          <p className="text-gray-800 font-medium">
            {new Date(request.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {!isPending && request.approved_at && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">
              {isApproved ? "Data de aprovação" : "Data de rejeição"}
            </p>
            <p className="text-gray-800 font-medium">
              {new Date(request.approved_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {!isPending && request.approver && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">
              Gestor responsável
            </p>
            <p className="text-gray-800 font-medium">{request.approver}</p>
          </div>
        )}
      </div>

      <div className="w-full">
        <RequestCalendar requestDate={request.request_date} />
      </div>

      <div className="w-full bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
          Motivo da solicitação
        </p>
        <p className="text-gray-800 whitespace-pre-wrap">{request.reason}</p>
      </div>

      {isPending && (
        <div className="w-full pt-4">
          <ApprovalActions requestId={requestId} />
        </div>
      )}

      {!isPending && (
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {isApproved
              ? "Esta solicitação foi aprovada e não pode mais ser modificada."
              : "Esta solicitação foi rejeitada e não pode mais ser modificada."}
          </p>
        </div>
      )}
    </div>
  );
}
