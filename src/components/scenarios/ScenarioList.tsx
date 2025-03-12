
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Carousel from '@/components/ui/carousel';
import ProductCard from '@/components/ui/ProductCard';
import { Scenario } from '@/types/api.types';

interface ScenarioListProps {
  scenarios: Scenario[];
  selectedScenario: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onScenarioSelect: (id: string) => void;
  onAddScenario: () => void;
  onUpdateScenario: (id: string, title: string, description: string) => void;
}

const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  selectedScenario,
  isLoading,
  isCreating,
  onScenarioSelect,
  onAddScenario,
  onUpdateScenario,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Carregando cenários...</p>
      </div>
    );
  }

  return (
    <section className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Cenários</h2>
          {user?.isAdmin && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onAddScenario}
              disabled={isCreating}
            >
              <Plus size={16} className="mr-1" />
              {isCreating ? 'Adicionando...' : 'Adicionar'}
            </Button>
          )}
        </div>

        {scenarios.length > 0 ? (
          <Carousel itemsPerView={4} spacing={16}>
            {scenarios.map((scenario) => (
              <ProductCard
                key={scenario.id}
                id={scenario.id}
                title={scenario.title}
                description={scenario.formatted_description || scenario.description}
                selected={selectedScenario === scenario.id}
                onClick={() => onScenarioSelect(scenario.id)}
                onUpdate={onUpdateScenario}
                isScenario={true}
              />
            ))}
          </Carousel>
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum cenário cadastrado.
            </p>
            {user?.isAdmin && (
              <Button 
                variant="outline"
                className="mt-4"
                onClick={onAddScenario}
                disabled={isCreating}
              >
                <Plus size={16} className="mr-1" />
                {isCreating ? 'Adicionando...' : 'Adicionar Cenário'}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ScenarioList;
