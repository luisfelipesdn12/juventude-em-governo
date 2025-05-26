"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, Loader2, Play } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { differenceInSeconds } from "date-fns";

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [loading, setLoading] = useState(true);
  const { error, subscribeToRoom, updateRoom } = useRoomStore();
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for the timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle game finishing when time runs out
  useEffect(() => {
    if (!room?.startedAt || room.state !== 'started') return;
    
    const startTime = room.startedAt.toDate();
    const elapsedSeconds = differenceInSeconds(currentTime, startTime);
    const totalGameTimeSeconds = room.settings.time * 60;
    const remainingSeconds = Math.max(0, totalGameTimeSeconds - elapsedSeconds);
    
    if (remainingSeconds === 0) {
      console.log('Game time ended, finishing game...', { roomId, elapsedSeconds, totalGameTimeSeconds });
      updateRoom(roomId, { state: 'finished' })
        .then(() => {
          console.log('Game finished successfully');
        })
        .catch(error => {
          console.error('Error finishing game:', error);
          // Try again in case of network issues
          setTimeout(() => {
            updateRoom(roomId, { state: 'finished' })
              .catch(retryError => console.error('Retry error finishing game:', retryError));
          }, 2000);
        });
    }
  }, [room?.startedAt, room?.state, room?.settings.time, currentTime, roomId, updateRoom]);

  // This useEffect sets up a real-time listener to Firestore for the specific room
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [roomId, subscribeToRoom]);

  // Check if all cities are ready
  const allCitiesReady = room && room.cities.length > 0 && room.cities.every(city => city.state === 'ready');

  // Calculate remaining game time
  const getRemainingTime = () => {
    if (!room?.startedAt || room.state !== 'started') return null;
    
    const startTime = room.startedAt.toDate();
    const elapsedSeconds = differenceInSeconds(currentTime, startTime);
    const totalGameTimeSeconds = room.settings.time * 60; // Convert minutes to seconds
    const remainingSeconds = Math.max(0, totalGameTimeSeconds - elapsedSeconds);
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle starting the game
  const handleStartGame = async () => {
    if (!room || !allCitiesReady) return;

    setIsStartingGame(true);
    try {
      await updateRoom(roomId, { state: 'started', startedAt: Timestamp.fromDate(new Date()) });
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsStartingGame(false);
    }
  };

  // Get status badge variant and text
  const getStatusBadge = (state: Room['state']) => {
    switch (state) {
      case 'drawing':
        return { variant: 'secondary' as const, text: 'Preparando' };
      case 'started':
        return { variant: 'default' as const, text: 'Em Andamento' };
      case 'finished':
        return { variant: 'outline' as const, text: 'Finalizado' };
      default:
        return { variant: 'secondary' as const, text: 'Desconhecido' };
    }
  };

  // Get city status badge variant and text
  const getCityStatusBadge = (state: Room['cities'][0]['state']) => {
    switch (state) {
      case 'drawing':
        return { variant: 'secondary' as const, text: 'Preparando' };
      case 'ready':
        return { variant: 'default' as const, text: 'Pronto' };
      default:
        return { variant: 'secondary' as const, text: 'Desconhecido' };
    }
  };

  if (loading && !room) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações da sala...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar sala</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sala não encontrada</CardTitle>
            <CardDescription>
              A sala que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/applyer/continue-room")} className="w-full">
              Voltar para Salas
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(room.state);

  return (
    <div className="container mx-auto py-8 px-6 gap-6 flex flex-col">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Sala #{room.id}</h1>
        <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 w-full justify-between">
              <CardTitle className="text-2xl">{room.name}</CardTitle>
              {room.startedAt && room.state === 'started' && (
                <div className="flex flex-col items-end">
                  <p className="text-sm text-muted-foreground">Tempo Restante</p>
                  <p className="text-xl font-mono font-bold text-primary">
                    {getRemainingTime()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Detalhes da Sala</h3>
              <div className="space-y-2">
                <p><strong>Instituição:</strong> {room.institution}</p>
                <p><strong>Classe/Série:</strong> {room.class}</p>
                <p><strong>Tempo de Jogo:</strong> {room.settings.time} minutos</p>
                {room.createdAt && (
                  <p className="text-sm">
                    <strong>Criada em:</strong> {room.createdAt.toDate().toLocaleString()}
                  </p>
                )}
                {room.startedAt && (
                  <p className="text-sm">
                    <strong>Jogo começou em:</strong> {room.startedAt?.toDate().toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Como jogar</h3>
            <p className="mb-4">
              Compartilhe o ID da sala ({room.id}) com seus alunos para que eles possam acessar o jogo.
              Os alunos podem usar o ID para se conectar à sala através da opção &quot;Entrar em uma Sala&quot; na tela inicial.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Cidades</h2>
        {room.state === 'drawing' && (
          <Button 
            onClick={handleStartGame}
            disabled={!allCitiesReady || isStartingGame}
            className="flex items-center gap-2"
          >
            {isStartingGame ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Iniciar Jogo
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {room.cities.map((city) => {
          const cityStatusBadge = getCityStatusBadge(city.state);
          return (
            <Card key={city.id} className="p-2 border rounded-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{city.name}</CardTitle>
                  <Badge variant={cityStatusBadge.variant}>{cityStatusBadge.text}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1">
                  {city.situation_cards ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Cartas situação sorteadas
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sorteando situação...
                    </>
                  )}
                </p>
                <p className="flex items-center gap-1">
                  {city.advantage_disadvantage_cards ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Vantagem/imprevistos sorteadas
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sorteando vantagem/imprevistos...
                    </>
                  )}
                </p>
                <p className="flex items-center gap-1">
                  {city.initial_budget ? (
                    <>
                      D$ {city.initial_budget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sorteando dindins...
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          );
        })}
        {room.cities.length % 2 === 1 && (
          <Card className="p-2 border rounded-md bg-transparent border-dashed">
            <CardHeader>
            </CardHeader>
          </Card>
        )}
        {room.cities.length === 0 && (
          <p className="text-center col-span-2">Nenhuma cidade disponível...</p>
        )}
      </div>
    </div>
  );
}
