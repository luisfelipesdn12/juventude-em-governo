"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { useGameStore } from "@/lib/store/game-store";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BeforeGame } from "@/components/before-game";
import { InGame } from "@/components/in-game";
import { GameResults } from "@/components/game-results";

export default function PlayerRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const cityId = parseInt(params.cityId as string);

  const [roomLoading, setRoomLoading] = useState(true);
  const { error: roomError, subscribeToRoom } = useRoomStore();
  
  // Game store state and actions
  const {
    setDindins,
    setSituationCards,
    setAdvantageDisadvantageCards,
    loading: cityLoading,
    error: cityError,
  } = useGameStore();

  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [cityData, setCityData] = useState<Room['cities'][0] | undefined>(undefined);

  // This useEffect sets up a real-time listener to Firestore for the specific room
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setRoomLoading(false);
      // Find the city in the room
      if (updatedRoom) {
        const city = updatedRoom.cities.find(c => c.id === cityId);
        setCityData(city);

        // Load existing data from Firebase
        if (city) {
          // Check if budget has been set (different from default 1000 or if initial_budget equals budget and both are not 1000)
          if (city.budget !== 1000 && city.initial_budget === city.budget) {
            setDindins(city.budget);
          }
          if (city.situation_cards) {
            setSituationCards(city.situation_cards);
          }
          if (city.advantage_disadvantage_cards) {
            setAdvantageDisadvantageCards(city.advantage_disadvantage_cards);
          }
        }
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [roomId, cityId, subscribeToRoom, setDindins, setSituationCards, setAdvantageDisadvantageCards]);

  if ((roomLoading && !room) || cityLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações da sala...</p>
        </div>
      </div>
    );
  }

  if (roomError || cityError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar sala</CardTitle>
            <CardDescription>
              {roomError || cityError}
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

  // Render based on room state
  if (room.state === "started" && cityData?.state !== "finished") {
    return (
      <InGame 
        roomId={roomId}
        cityId={cityId}
        room={room}
        cityData={cityData}
      />
    );
  }

  if (room.state === "finished" || cityData?.state === "finished") {
    return (
      <GameResults 
        room={room}
        cityData={cityData}
        showBackButton={true}
      />
    );
  }

  return (
    <BeforeGame
      roomId={roomId}
      cityId={cityId}
      room={room}
      cityData={cityData}
    />
  );
}
