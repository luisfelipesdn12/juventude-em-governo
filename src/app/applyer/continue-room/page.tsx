"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ContinueRoom() {
  const router = useRouter();
  const { rooms, loading, error, subscribeToRooms } = useRoomStore();
  const [localRooms, setLocalRooms] = useState<Room[]>([]);

  // This useEffect sets up a real-time listener to Firestore
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRooms((updatedRooms) => {
      setLocalRooms(updatedRooms);
    });

    // Initial loading
    setLocalRooms(rooms);

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [subscribeToRooms, rooms]);

  function handleRoomClick(id: string) {
    router.push(`/applyer/room/${id}`);
  }

  function handleCreateNewRoom() {
    router.push("/applyer/create-room");
  }

  if (loading && localRooms.length === 0) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando salas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar salas</CardTitle>
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

  if (localRooms.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Nenhuma sala encontrada</CardTitle>
            <CardDescription>
              Você ainda não criou nenhuma sala. Crie uma nova sala para começar.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleCreateNewRoom} className="w-full">
              Criar Nova Sala
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Suas Salas</h1>
        <Button onClick={handleCreateNewRoom}>Criar Nova Sala</Button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {localRooms.map((room) => (
          <Card 
            key={room.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleRoomClick(room.id)}
          >
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>ID: {room.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-1"><strong>Instituição:</strong> {room.institution}</p>
              <p className="text-sm mb-1"><strong>Classe:</strong> {room.class}</p>
              <p className="text-sm"><strong>Tempo:</strong> {room.settings.time} minutos</p>
              {room.createdAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Criada em: {room.createdAt.toDate().toLocaleString()}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={(e) => {
                e.stopPropagation();
                handleRoomClick(room.id);
              }}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 