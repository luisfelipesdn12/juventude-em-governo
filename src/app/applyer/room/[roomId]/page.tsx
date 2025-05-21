"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Copy, Loader2 } from "lucide-react";

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { loading, error, subscribeToRoom } = useRoomStore();
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  // This useEffect sets up a real-time listener to Firestore for the specific room
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [roomId, subscribeToRoom]);

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

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => router.push("/applyer/continue-room")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Salas
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{room.name}</CardTitle>
              <CardDescription>ID: {room.id}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyRoomId}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Copy className="h-4 w-4" /> Copiado!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Copiar ID
                </>
              )}
            </Button>
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
                  <p className="text-sm text-gray-500">
                    <strong>Criada em:</strong> {room.createdAt.toDate().toLocaleString()}
                  </p>
                )}
                {room.updatedAt && (
                  <p className="text-sm text-gray-500">
                    <strong>Última atualização:</strong> {room.updatedAt.toDate().toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Detalhes da Cidade</h3>
              <div className="space-y-2">
                {room.cities.map((city) => (
                  <div key={city.id} className="p-4 border rounded-md">
                    <p><strong>Nome:</strong> {city.name}</p>
                    <p><strong>Orçamento Inicial:</strong> {city.initial_budget} Dindins</p>
                    <p><strong>Orçamento Atual:</strong> {city.budget} Dindins</p>
                  </div>
                ))}
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
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="w-full sm:w-auto" 
            onClick={() => window.location.href = `/play?room=${room.id}`}
          >
            Visualizar como Jogador
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => navigator.share({
              title: `Sala: ${room.name}`,
              text: `Junte-se à sala "${room.name}" com o código: ${room.id}`,
              url: window.location.origin + `/play?room=${room.id}`
            }).catch(() => {
              // Fallback para navegadores que não suportam a API Web Share
              handleCopyRoomId();
            })}
          >
            <Share2 className="h-4 w-4 mr-2" /> Compartilhar Sala
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 