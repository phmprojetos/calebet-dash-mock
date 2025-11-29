import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { betsService, CreateBetDTO, UpdateBetDTO } from "@/services/betsService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bet, GetBetsParams } from "@/lib/mockData";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const detail = error.response?.data as { detail?: string } | undefined;
    if (detail?.detail) {
      return detail.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Tente novamente.";
};

export interface UseBetsOptions {
  filter?: GetBetsParams["filter"];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const useBets = (options: UseBetsOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = user?.id || "";

  const { filter, start_date, end_date, page = 1, limit = 20 } = options;

  // Query para listar apostas com paginação
  const betsQuery = useQuery({
    queryKey: ["bets", userId, { filter, start_date, end_date, page, limit }],
    queryFn: () =>
      betsService.getBets({
        user_id: userId,
        filter,
        start_date,
        end_date,
        page,
        limit,
      }),
  });

  // Mutation para criar aposta
  const createMutation = useMutation({
    mutationFn: (bet: Omit<CreateBetDTO, "user_id">) =>
      betsService.createBet({ ...bet, user_id: userId || undefined }),
    onSuccess: (newBet) => {
      // Invalidar todas as queries de bets para recarregar com os novos dados
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta criada",
        description:
          newBet.event?.trim().length
            ? `Aposta em "${newBet.event}" registrada com sucesso.`
            : "A nova aposta foi adicionada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar aposta",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar aposta
  const updateMutation = useMutation({
    mutationFn: ({ betId, data }: { betId: string; data: UpdateBetDTO }) =>
      betsService.updateBet(betId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar aposta",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar aposta
  const deleteMutation = useMutation({
    mutationFn: (betId: string) => betsService.deleteBet(betId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta excluída",
        description: "A aposta foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir aposta",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const paginatedData = betsQuery.data;

  return {
    bets: paginatedData?.items || [],
    total: paginatedData?.total || 0,
    page: paginatedData?.page || 1,
    limit: paginatedData?.limit || 20,
    totalPages: paginatedData?.total_pages || 1,
    isLoading: betsQuery.isLoading,
    isError: betsQuery.isError,
    error: betsQuery.error,
    refetch: betsQuery.refetch,
    createBet: createMutation.mutate,
    createBetAsync: createMutation.mutateAsync,
    updateBet: updateMutation.mutate,
    deleteBet: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
