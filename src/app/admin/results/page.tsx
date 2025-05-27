"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categoriesProperties } from "@/lib/categories-properties";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  getDocs,
  where,
  documentId,
  getCountFromServer,
} from 'firebase/firestore';
import { getCategoryNameById } from "@/lib/data";

interface CategorySpending {
  name: string;
  value: number;
  color: string;
}

interface AggregatedStats {
  totalBudgetSpent: number;
  totalInitialBudget: number;
  averagePoints: number;
  totalCities: number;
  totalRooms: number;
  spendingByCategory: CategorySpending[];
}

export default function AdminResults() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AggregatedStats>({
    totalBudgetSpent: 0,
    totalInitialBudget: 0,
    averagePoints: 0,
    totalCities: 0,
    totalRooms: 0,
    spendingByCategory: [],
  });

  useEffect(() => {
    async function fetchAggregatedStats() {
      try {
        setLoading(true);

        // Get rooms collection reference
        const roomsRef = collection(db, 'rooms');
        
        // Count total rooms using server-side count
        const roomsSnapshot = await getCountFromServer(query(roomsRef));
        const totalRooms = roomsSnapshot.data().count;

        // Get all rooms to process cities (we'll optimize this in a future update)
        const roomsQuery = query(roomsRef);
        const roomsData = await getDocs(roomsQuery);

        // Calculate total cities and initial budget
        let totalCities = 0;
        let totalInitialBudget = 0;
        let allCityItems: string[] = [];

        // First pass to collect all items and basic stats
        for (const roomDoc of roomsData.docs) {
          const room = roomDoc.data();
          if (room.cities) {
            for (const city of room.cities) {
              totalCities++;
              totalInitialBudget += city.initial_budget || 0;
              if (city.items) {
                allCityItems = allCityItems.concat(city.items);
              }
            }
          }
        }

        // Get unique items
        const uniqueItems = [...new Set(allCityItems)];

        // Batch query for all items at once
        const itemsRef = collection(db, 'items');
        const spendingByCategory: Record<string, number> = {};

        // Initialize categories
        Object.keys(categoriesProperties).forEach(categoryName => {
          spendingByCategory[categoryName] = 0;
        });

        // Process items in batches of 30 (Firestore limit)
        const batchSize = 30;
        for (let i = 0; i < uniqueItems.length; i += batchSize) {
          const batch = uniqueItems.slice(i, i + batchSize);
          const itemsQuery = query(itemsRef, where(documentId(), 'in', batch));
          const itemsSnapshot = await getDocs(itemsQuery);

          for (const itemDoc of itemsSnapshot.docs) {
            const item = itemDoc.data();
            const categoryName = await getCategoryNameById(item.category_id);
            if (spendingByCategory.hasOwnProperty(categoryName)) {
              // Count how many times this item appears in allCityItems
              const itemCount = allCityItems.filter(id => id === itemDoc.id).length;
              spendingByCategory[categoryName] += item.price * itemCount;
            }
          }
        }

        // Calculate points aggregation
        let totalPoints = 0;
        let citiesWithPoints = 0;

        // Process points in a single pass
        for (const roomDoc of roomsData.docs) {
          const room = roomDoc.data();
          if (room.cities) {
            for (const city of room.cities) {
              if (city.points) {
                const points = Object.values(city.points)
                  .filter((value): value is number => typeof value === 'number')
                  .reduce((acc, curr) => acc + curr, 0);
                totalPoints += points;
                citiesWithPoints++;
              }
            }
          }
        }

        // Calculate total spent
        const totalSpent = Object.values(spendingByCategory).reduce((acc, curr) => acc + curr, 0);

        // Convert spending by category to chart data format
        const chartData: CategorySpending[] = Object.entries(spendingByCategory)
          .filter(([, value]) => value > 0)
          .map(([name, value]) => ({
            name,
            value,
            color: categoriesProperties[name]?.color || '#gray',
          }));

        // Update stats
        setStats({
          totalBudgetSpent: totalSpent,
          totalInitialBudget: totalInitialBudget,
          averagePoints: citiesWithPoints > 0 ? totalPoints / citiesWithPoints : 0,
          totalCities,
          totalRooms,
          spendingByCategory: chartData,
        });
      } catch (err) {
        console.error('Error fetching aggregated stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchAggregatedStats();
  }, []);

  if (loading && stats.totalCities === 0) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar dados</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultados Gerais</CardTitle>
          <CardDescription>
            Estatísticas agregadas de todas as salas e cidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-black/60 p-4 rounded-lg">
              <h3 className="text-sm text-muted-foreground mb-1">Total de Salas</h3>
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg">
              <h3 className="text-sm text-muted-foreground mb-1">Total de Cidades</h3>
              <p className="text-2xl font-bold">{stats.totalCities}</p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg">
              <h3 className="text-sm text-muted-foreground mb-1">Média de Pontos</h3>
              <p className="text-2xl font-bold">{stats.averagePoints.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="h-48 sm:h-90 md:h-96 lg:h-96 xl:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.spendingByCategory}
                          cx="50%"
                          cy="50%"
                          label={false}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.spendingByCategory.map((entry, index) => (
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

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-4">
                    <div>
                      <p className="text-muted-foreground">Orçamento Total Inicial</p>
                      <p className="font-semibold">
                        R$ {stats.totalInitialBudget.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Gasto</p>
                      <p className="font-semibold text-red-400">
                        R$ {stats.totalBudgetSpent.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Restante</p>
                      <p className="font-semibold text-green-400">
                        R$ {(stats.totalInitialBudget - stats.totalBudgetSpent).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => router.push('/admin/continue-room')}
          className="text-muted-foreground hover:text-primary"
        >
          Ver resultados por sala →
        </Button>
      </div>
    </div>
  );
} 