import { api, DEMO_USER_ID } from "@/lib/api";
import { Bet } from "@/lib/mockData";

export interface CreateBetDTO {
  user_id: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  result: "win" | "loss" | "pending" | "void" | "cashout";
  profit: number;
  created_at?: string;
}

export interface UpdateBetDTO {
  event?: string;
  market?: string;
  odd?: number;
  stake?: number;
  result?: "win" | "loss" | "pending" | "void" | "cashout";
  profit?: number;
}

export const betsService = {
  // Listar todas as apostas
  getBets: async (userId: string = DEMO_USER_ID): Promise<Bet[]> => {
    const response = await api.get<Bet[]>(`/bets/`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  // Criar nova aposta
  createBet: async (bet: Omit<CreateBetDTO, "user_id">): Promise<Bet> => {
    const response = await api.post<Bet>(`/bets/`, {
      ...bet,
      user_id: DEMO_USER_ID,
    });
    return response.data;
  },

  // Atualizar aposta existente
  updateBet: async (ordemId: string, data: UpdateBetDTO): Promise<Bet> => {
    const response = await api.patch<Bet>(`/bets/${ordemId}`, data);
    return response.data;
  },

  // Deletar aposta
  deleteBet: async (ordemId: string): Promise<void> => {
    await api.delete(`/bets/${ordemId}`);
  },
};
