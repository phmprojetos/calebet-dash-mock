import { api, DEMO_USER_ID } from "@/lib/api";

export interface ImportResponse {
  message: string;
  imported_count: number;
}

export const importService = {
  // Importar apostas via CSV
  importCSV: async (file: File, userId: string = DEMO_USER_ID): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    const response = await api.post<ImportResponse>("/import/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 segundos para upload
    });

    return response.data;
  },
};
