"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { useGameStore } from "@/lib/store/game-store";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import CardsMarquee from "@/components/cards-marquee";
import AdvantageDisadvantageMarquee from "@/components/advantage-disadvantage-marquee";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function PlayerRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const cityId = parseInt(params.cityId as string);

  const [roomLoading, setRoomLoading] = useState(true);
  const { error: roomError, subscribeToRoom, updateCityInRoom, removeCityFromRoom } = useRoomStore();
  const { player, loading: playerLoading, error: playerError, subscribeToPlayer, leaveRoom } = usePlayerStore();
  
  // Game store state and actions
  const {
    dindins,
    situationCards,
    advantageDisadvantageCards,
    categories,
    loadingCards,
    loadingAdvDisadvCards,
    setDindins,
    setSituationCards,
    setAdvantageDisadvantageCards,
    loadCategories,
    generateRandomDindins,
    generateSituationCards,
    generateAdvantageDisadvantageCards,
  } = useGameStore();

  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [cityData, setCityData] = useState<Room['cities'][0] | undefined>(undefined);

  const startingGame = useMemo(() => {
    return cityData?.state === 'ready';
  }, [cityData]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // This useEffect sets up a real-time listener to Firestore for the specific room
  useEffect(() => {
    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setRoomLoading(false);
      // Find the player's city in the room
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

  // Subscribe to player updates if we have a player in state
  useEffect(() => {
    if (player?.id) {
      const unsubscribe = subscribeToPlayer(player.id, () => {
        // We're already updating the player state in the store
      });

      return () => unsubscribe();
    }
  }, [player?.id, subscribeToPlayer]);

  const handleSortearCards = async () => {
    const selectedCards = generateSituationCards();
    if (selectedCards) {
      // Save to Firebase
      try {
        await updateCityInRoom(roomId, cityId, {
          situation_cards: selectedCards
        });
      } catch (error) {
        console.error('Error saving situation cards to Firebase:', error);
      }
    }
  };

  const handleSortearAdvDisadvCards = async () => {
    const selectedCards = await generateAdvantageDisadvantageCards();
    if (selectedCards) {
      // Save to Firebase
      try {
        await updateCityInRoom(roomId, cityId, {
          advantage_disadvantage_cards: selectedCards
        });
      } catch (error) {
        console.error('Error selecting/saving advantage/disadvantage cards:', error);
      }
    }
  };

  const handleSortearDindins = async () => {
    const newDindins = generateRandomDindins();

    // Save to Firebase
    try {
      await updateCityInRoom(roomId, cityId, {
        initial_budget: newDindins,
        budget: newDindins
      });
    } catch (error) {
      console.error('Error saving budget to Firebase:', error);
    }
  };

  const handleComecarJogo = async () => {
    try {
      // Update city state from "drawing" to "ready"
      await updateCityInRoom(roomId, cityId, {
        state: 'ready'
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSairDoJogo = async () => {
    try {
      // Remove city from room
      await removeCityFromRoom(roomId, cityId);
      
      // Delete player if exists
      if (player?.id) {
        await leaveRoom(player.id);
      }
      
      // Navigate back to home page
      router.push('/');
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  // Check if all elements are sorted (ready to start game)
  const allElementsSorted = dindins !== undefined &&
    situationCards !== undefined &&
    advantageDisadvantageCards !== undefined;

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

  // Show fullscreen loading when starting game
  if (startingGame) {
    // Calculate ready cities count
    const readyCitiesCount = room?.cities.filter(city => city.state === 'ready').length || 0;
    const totalCitiesCount = room?.cities.length || 0;

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <DotLottieReact
            src="/assets/loading-animation.json"
            loop
            autoplay
          />
          <p className="text-xl font-semibold">
            Aguarde o jogo começar...
          </p>
          <p className="mb-6">
            {readyCitiesCount} de {totalCitiesCount} salas estão prontas para começar
          </p>
          <Button 
            variant="outline" 
            onClick={handleSairDoJogo}
            className="mt-4"
          >
            Sair do jogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-8 flex flex-col">
      <h1 className="text-2xl font-semibold text-center">Sala #{room.id}</h1>

      <div className="flex flex-col gap-4 w-full justify-start items-start">
        <div className="flex gap-4 w-full justify-between items-center">
          <h2 className="text-xl font-semibold">Cartas situação</h2>
          <Button
            onClick={handleSortearCards}
            disabled={situationCards !== undefined || loadingCards || categories.length === 0}
          >
            {loadingCards ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando...
              </>
            ) : (
              'Sortear'
            )}
          </Button>
        </div>

        <CardsMarquee cards={situationCards} />
      </div>

      <div className="flex flex-col gap-4 w-full justify-start items-start">
        <div className="flex gap-4 w-full justify-between items-center">
          <h2 className="text-xl font-semibold">Cartas vantagem desvantagem</h2>
          <Button
            onClick={handleSortearAdvDisadvCards}
            disabled={advantageDisadvantageCards !== undefined || loadingAdvDisadvCards}
          >
            {loadingAdvDisadvCards ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando...
              </>
            ) : (
              'Sortear'
            )}
          </Button>
        </div>

        <AdvantageDisadvantageMarquee cards={advantageDisadvantageCards} />
      </div>

      <div className="flex gap-4 w-full justify-between items-center">
        <h2 className="text-xl font-semibold">
          Dindins
          <br />
          {dindins ? (
            <>
              D$ <NumberTicker
                value={dindins ?? 0}
                decimalPlaces={2}
                className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white"
              />
            </>
          ) : (
            <>
              D$ ??????
            </>
          )}
        </h2>

        <Button
          onClick={handleSortearDindins}
          disabled={dindins !== undefined}
        >
          Sortear
        </Button>
      </div>
      <footer className="fixed bottom-0 left-0 right-0">
        <Button
          className="w-full"
          onClick={handleComecarJogo}
          disabled={!allElementsSorted || startingGame}
        >
          {startingGame ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando...
            </>
          ) : (
            'Começar jogo'
          )}
        </Button>
      </footer>
    </div>
  );
}
