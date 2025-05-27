"use client";

import { Room } from "@/lib/store/room-store";
import { Button } from "@/components/ui/button";
import { ScoreBalls } from "@/components/ui/score-balls";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from "next/navigation";
import { categoriesProperties } from "@/lib/categories-properties";
import { getItemById, getCategoryNameById } from "@/lib/data";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface GameResultsProps {
  room: Room;
  cityData: Room['cities'][0];
  showBackButton?: boolean;
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

export function GameResults({ room, cityData, showBackButton = false }: GameResultsProps) {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherCities, setOtherCities] = useState<CityScore[]>([]);
  const [ranking, setRanking] = useState<number>(0);

  // Calculate city's ranking
  useEffect(() => {
    // Calculate all cities' scores
    const citiesWithScores = room.cities.map(city => {
      const points = city.points 
        ? Object.values(city.points).reduce((acc, curr) => acc + (curr || 0), 0) / Object.keys(city.points).length
        : 0;
      return { id: city.id, points };
    });

    // Sort by points descending
    citiesWithScores.sort((a, b) => b.points - a.points);

    // Find current city's position (1-based index)
    const position = citiesWithScores.findIndex(city => city.id === cityData.id) + 1;
    setRanking(position);
  }, [room.cities, cityData.id]);

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
        for (const itemId of (cityData?.items || [])) {
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
  }, [cityData?.items]);

  // Calculate scores for all cities - only if we're in player view
  useEffect(() => {
    if (!showBackButton) return; // Skip calculation if in applyer view

    const calculateCityScores = () => {
      const cityScores: CityScore[] = room.cities
        .filter(city => city.id !== cityData.id) // Exclude current city
        .map(city => {
          const pointsValues = Object.values(city.points || {});
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
  }, [room.cities, cityData.id, showBackButton]);

  // Calculate average points for current city
  const averagePoints = cityData.points 
    ? Object.values(cityData.points).reduce((acc, curr) => acc + (curr || 0), 0) / Object.keys(cityData.points).length
    : 0;

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <Card className="p-6 bg-transparent">
      {/* City Name Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-primary mb-1">{cityData.name}</h1>
          <Badge variant="outline" className="mb-1">#{ranking}</Badge>
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-6">
        {/* Score Card */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Pontuação</h2>
          <ScoreBalls score={averagePoints} size="sm" />
        </div>

        {/* Pie Chart */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Orçamento</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          ) : categoryData.length > 0 ? (
            <>
              <div className="h-48">
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
                      formatter={(value: number, label: string) => [`D$ ${value.toLocaleString('pt-BR')}`, `${label}`]}
                      labelFormatter={(label: string) => `Categoria: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                <div>
                  <p className="text-muted-foreground">Orçamento Inicial</p>
                  <p className="font-semibold">R$ {(cityData.initial_budget || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Gasto</p>
                  <p className="font-semibold text-red-400">
                    R$ {categoryData.reduce((total, category) => total + category.value, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Restante</p>
                  <p className="font-semibold text-green-400">
                    R$ {(cityData.budget || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>
            </div>
          )}
        </div>

        {/* Other Cities Scores - Only show in player view */}
        {showBackButton && otherCities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Outras Cidades</h2>
            <ul className="space-y-2">
              {otherCities.map((city, index) => (
                <li key={city.id} className="flex flex-col gap-1 bg-black/60 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{city.name}</p>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                  <ScoreBalls score={city.averagePoints} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Back Button - Only show if showBackButton is true */}
      {showBackButton && (
        <div className="text-center fixed bottom-0 left-0 w-full">
          <Button
            onClick={handleBackToHome}
            className="text-2xl w-full py-8"
          >
            Voltar para a Tela Inicial
          </Button>
        </div>
      )}
    </Card>
  );
} 