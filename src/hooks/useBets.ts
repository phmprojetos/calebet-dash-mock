import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { betsService, CreateBetDTO, UpdateBetDTO } from "@/services/betsService";
import { DEMO_USER_ID } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta criada",
        description: "A nova aposta foi adicionada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar aposta",
        description: error.response?.data?.detail || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar aposta
  const updateMutation = useMutation({
    mutationFn: ({ ordemId, data }: { ordemId: string; data: UpdateBetDTO }) =>
      betsService.updateBet(ordemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar aposta",
        description: error.response?.data?.detail || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar aposta
  const deleteMutation = useMutation({
    mutationFn: (ordemId: string) => betsService.deleteBet(ordemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Aposta excluída",
        description: "A aposta foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir aposta",
        description: error.response?.data?.detail || "Tente novamente.",
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
