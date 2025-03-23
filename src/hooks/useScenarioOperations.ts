
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchScenarios, createScenario, updateScenario } from '@/services/api';
import type { ScenarioCreateInput } from '@/types/api.types';

export function useScenarioOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { 
    data: scenarios = [], 
    isLoading: isLoadingScenarios,
    refetch: refetchScenarios
  } = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });

  const createScenarioMutation = useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      refetchScenarios();
      toast.success('Novo cenário criado');
    },
    onError: (error) => {
      console.error('Error creating scenario:', error);
      toast.error('Erro ao criar cenário');
    }
  });

  const updateScenarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateScenario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      toast.success('Cenário atualizado');
    },
    onError: (error) => {
      console.error('Error updating scenario:', error);
      toast.error('Erro ao atualizar cenário');
    }
  });

  const handleAddScenario = () => {
    if (createScenarioMutation.isPending) return;
    
    setIsLoading(true);
    createScenarioMutation.mutate({
      title: 'Novo Cenário',
      description: 'Descrição do novo cenário',
      formatted_description: '<p>Descrição do novo cenário</p>'
    }, {
      onSettled: () => setIsLoading(false)
    });
  };

  const handleUpdateScenario = (id: string, title: string, description: string) => {
    updateScenarioMutation.mutate({
      id,
      data: { 
        title, 
        description,
        formatted_description: description 
      },
    });
  };

  return {
    scenarios,
    isLoadingScenarios,
    isLoading: isLoading || createScenarioMutation.isPending,
    handleAddScenario,
    handleUpdateScenario,
  };
}
