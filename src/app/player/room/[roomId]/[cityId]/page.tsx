"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PlayerRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const cityId = parseInt(params.cityId as string);
  
  const { loading: roomLoading, error: roomError, subscribeToRoom } = useRoomStore();
  const { player, loading: playerLoading, error: playerError, subscribeToPlayer } = usePlayerStore();
  
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [cityData, setCityData] = useState<Room['cities'][0] | undefined>(undefined);

  // This useEffect sets up a real-time listener to Firestore for the specific room
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      
      // Find the player's city in the room
      if (updatedRoom) {
        const city = updatedRoom.cities.find(c => c.id === cityId);
        setCityData(city);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [roomId, cityId, subscribeToRoom]);

  // Subscribe to player updates if we have a player in state
  useEffect(() => {
    if (player?.id) {
      const unsubscribe = subscribeToPlayer(player.id, () => {
        // We're already updating the player state in the store
      });
      
      return () => unsubscribe();
    }
  }, [player?.id, subscribeToPlayer]);

  // If there's no player in state, navigate back to play page
  useEffect(() => {
    if (!playerLoading && !player) {
      router.push('/play');
    }
  }, [player, playerLoading, router]);

  if ((roomLoading && !room) || (playerLoading && !player)) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações da sala...</p>
        </div>
      </div>
    );
  }

  if (roomError || playerError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar sala</CardTitle>
            <CardDescription>
              {roomError || playerError}
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
            <Button onClick={() => router.push("/play")} className="w-full">
              Voltar para Entrar na Sala
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Cidade não encontrada</CardTitle>
            <CardDescription>
              A cidade que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/play")} className="w-full">
              Voltar para Entrar na Sala
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 gap-6 flex flex-col">
      <h1 className="text-2xl font-semibold text-center">Sala #{room.id}</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 w-full justify-between">
              <CardTitle className="text-2xl">{room.name}</CardTitle>
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold text-center">Sua Cidade</h2>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{cityData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            <strong>Orçamento:</strong> {cityData.budget} Dindins
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 