import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { betsService, CreateBetDTO, UpdateBetDTO } from "@/services/betsService";
import { DEMO_USER_ID } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bet } from "@/lib/mockData";

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

export const useBets = (userId: string = DEMO_USER_ID) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para listar apostas
  const betsQuery = useQuery({
    queryKey: ["bets", userId],
    queryFn: () => betsService.getBets(userId),
  });

  // Mutation para criar aposta
  const createMutation = useMutation({
    mutationFn: (bet: Omit<CreateBetDTO, "user_id">) => betsService.createBet(bet),
    onSuccess: (newBet) => {
      queryClient.setQueryData<Bet[]>(["bets", userId], (previous = []) => [newBet, ...previous]);
      queryClient.invalidateQueries({ queryKey: ["bets", userId] });
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

  return {
    bets: betsQuery.data || [],
    isLoading: betsQuery.isLoading,
    isError: betsQuery.isError,
    error: betsQuery.error,
    createBet: createMutation.mutate,
    updateBet: updateMutation.mutate,
    deleteBet: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
