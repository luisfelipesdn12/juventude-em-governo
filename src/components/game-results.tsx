"use client";

import { Room } from "@/lib/store/room-store";
import { Button } from "@/components/ui/button";
import { ScoreBalls } from "@/components/ui/score-balls";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from "next/navigation";
import { categoriesProperties } from "@/lib/categories-properties";
import { getItemById, getCategoryNameById } from "@/lib/data";
import { useEffect, useState } from "react";

interface GameResultsProps {
  room: Room;
  cityData: Room['cities'][0];
}

interface CategorySpending {
  name: string;
  value: number;
  color: string;
}

interface CityScore {
  id: number;
  name: string;
  averagePoints: number;
}

export function GameResults({ room, cityData }: GameResultsProps) {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherCities, setOtherCities] = useState<CityScore[]>([]);

  // Calculate real budget spending by category
  useEffect(() => {
    const calculateCategorySpending = async () => {
      setLoading(true);

      try {
        // Initialize spending tracker for each category
        const spendingByCategory: Record<string, number> = {};

        // Initialize all categories with 0 spending
        Object.keys(categoriesProperties).forEach(categoryName => {
          spendingByCategory[categoryName] = 0;
        });

        // Calculate spending for each purchased item
        for (const itemId of (cityData || []).items) {
          const item = await getItemById(itemId);
          if (item) {
            const categoryName = await getCategoryNameById(item.category_id);
            if (spendingByCategory.hasOwnProperty(categoryName)) {
              spendingByCategory[categoryName] += item.price;
            }
          }
        }

        // Convert to chart data format
        const chartData: CategorySpending[] = Object.entries(spendingByCategory)
          .filter(([, value]) => value > 0) // Only include categories with spending
          .map(([name, value]) => ({
            name,
            value,
            color: categoriesProperties[name]?.color || '#gray',
          }));

        setCategoryData(chartData);
      } catch (error) {
        console.error('Error calculating category spending:', error);
        setCategoryData([]);
      } finally {
        setLoading(false);
      }
    };

    calculateCategorySpending();
  }, [cityData.items]);

  // Calculate scores for all cities
  useEffect(() => {
    const calculateCityScores = () => {
      const cityScores: CityScore[] = room.cities
        .filter(city => city.id !== cityData.id) // Exclude current city
        .map(city => {
          const pointsValues = Object.values(city.points);
          const averagePoints = pointsValues.length > 0 
            ? pointsValues.reduce((acc, curr) => acc + (curr || 0), 0) / pointsValues.length
            : 0;
          
          return {
            id: city.id,
            name: city.name,
            averagePoints
          };
        })
        .sort((a, b) => b.averagePoints - a.averagePoints); // Sort by score descending

      setOtherCities(cityScores);
    };

    calculateCityScores();
  }, [room.cities, cityData.id]);

  // Calculate average points for current city
  const averagePoints = Object.values(cityData.points).reduce((acc, curr) => acc + curr || 0, 0) / Object.keys(cityData.points).length;

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto py-8 px-8 flex flex-col min-h-[90vh] justify-between">
      {/* City Name Header - Same as InGame */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">{cityData.name}</h1>
        <p className="text-lg text-muted-foreground">Sala #{room.id} - Resultados Finais</p>
      </div>

      {/* Results Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 mb-16">
        {/* Score Card */}
        <div className="w-full max-w-4xl text-start">
          <h1 className="text-2xl">Pontuação</h1>
          <ScoreBalls score={averagePoints} />
        </div>

        {/* Pie Chart */}
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl">Orçamento gasto</h1>
          {loading ? (
            <div className="h-96 w-full flex items-center justify-center">
              <p className="text-lg text-muted-foreground">Carregando dados...</p>
            </div>
          ) : categoryData.length > 0 ? (
            <>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      label={false}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                      labelFormatter={(label: string) => `Categoria: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-row gap-4 w-full justify-between flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento Inicial</p>
                  <p className="text-xl font-semibold">R$ {(cityData.initial_budget || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gasto</p>
                  <p className="text-xl font-semibold text-red-400">
                    R$ {categoryData.reduce((total, category) => total + category.value, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento Restante</p>
                  <p className="text-xl font-semibold text-green-400">
                    R$ {(cityData.budget || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 w-full flex items-center justify-center">
              <p className="text-lg text-muted-foreground">Nenhum gasto registrado</p>
            </div>
          )}
        </div>

        {/* Other Cities Scores */}
        {otherCities.length > 0 && (
          <div className="w-full max-w-4xl">
            <h1 className="text-2xl mb-4">Outras Cidades</h1>
            <ul className="space-y-4">
              {otherCities.map((city, index) => (
                <li key={city.id} className="flex flex-col gap-2 bg-black/60 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold">{city.name}</p>
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </div>
                  <ScoreBalls score={city.averagePoints} size="md" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center fixed bottom-0 left-0 w-full">
        <Button
          onClick={handleBackToHome}
          className="text-2xl w-full py-8"
        >
          Voltar para a Tela Inicial
        </Button>
      </div>
    </div>
  );
} 