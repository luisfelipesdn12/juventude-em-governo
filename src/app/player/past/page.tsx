"use client";

import { usePastGames } from "@/lib/hooks/usePastGames";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PastGamesPage() {
  const router = useRouter();
  const { pastGames, removePastGame, clearPastGames } = usePastGames();

  const handleRemoveGame = (roomId: string, cityId: number) => {
    removePastGame(roomId, cityId);
  };

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico de jogos?")) {
      clearPastGames();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Últimos Jogos</h1>
        </div>
        
        {pastGames.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleClearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Histórico
          </Button>
        )}
      </div>

      {pastGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-semibold mb-2">Nenhum jogo encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não participou de nenhum jogo. Que tal começar agora?
          </p>
          <Link href="/play">
            <Button>Jogar Agora</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastGames.map((game, index) => (
            <Card key={`${game.roomId}-${game.cityId}-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {game.cityName || `Cidade ${game.cityId}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(game.joinedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveGame(game.roomId, game.cityId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Sala:</span> #{game.roomId}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">ID da Cidade:</span> {game.cityId}
                  </p>
                </div>
                <Link href={`/player/room/${game.roomId}/${game.cityId}`}>
                  <Button className="w-full">
                    Voltar ao Jogo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 