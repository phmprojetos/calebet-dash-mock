import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";

export interface ImportResponse {
  message: string;
  imported_count: number;
}

interface ImportRequestConfig {
  params?: Record<string, string>;
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export const importService = {
  // Importar apostas via CSV
  importCSV: async (file: File, userId: string = DEMO_USER_ID): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    const sendRequest = (endpoint: string, config: ImportRequestConfig = {}) =>
      api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 segundos para upload
        ...config,
      });

    const response = await requestWithFallback([
      () =>
        sendRequest(`/import/csv`, { params: { user_id: userId } }).then((res) => res.data),
      () => sendRequest(`/users/${userId}/bets/import`).then((res) => res.data),
      () => sendRequest(`/import/`).then((res) => res.data),
    ]);

    const payload = unwrapApiResponse<unknown>(response);
    const payloadRecord = toRecord(payload);

    if (typeof payloadRecord["message"] === "string" && typeof payloadRecord["imported_count"] === "number") {
      return payloadRecord as ImportResponse;
    }

    const detail = payloadRecord["detail"];
    const message =
      typeof detail === "string"
        ? detail
        : (typeof payloadRecord["message"] === "string" ? (payloadRecord["message"] as string) : "Importação concluída");

    return {
      message,
      imported_count: toNumber(
        (payloadRecord["imported_count"] as unknown) ??
          (payloadRecord["count"] as unknown) ??
          (payloadRecord["total"] as unknown)
      ),
    };
  },
};
