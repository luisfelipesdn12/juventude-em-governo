"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { useGameStore } from "@/lib/store/game-store";
import { Button } from "@/components/ui/button";
import { Loader2, PencilIcon } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import CardsMarquee from "@/components/cards-marquee";
import AdvantageDisadvantageMarquee from "@/components/advantage-disadvantage-marquee";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { EditCityModal } from "@/components/edit-city-modal";

interface BeforeGameProps {
  roomId: string;
  cityId: number;
  room: Room;
  cityData: Room['cities'][0];
}

export function BeforeGame({ roomId, cityId, room, cityData }: BeforeGameProps) {
  const router = useRouter();
  const { updateCityInRoom, removeCityFromRoom } = useRoomStore();
  const { player, leaveRoom, updatePlayer } = usePlayerStore();
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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

  const startingGame = cityData?.state === 'ready';

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load existing data from Firebase when cityData changes
  useEffect(() => {
    if (cityData) {
      // Check if budget has been set (different from default 1000 or if initial_budget equals budget and both are not 1000)
      if (cityData.budget !== 1000 && cityData.initial_budget === cityData.budget) {
        setDindins(cityData.budget);
      }
      if (cityData.situation_cards) {
        setSituationCards(cityData.situation_cards);
      }
      if (cityData.advantage_disadvantage_cards) {
        setAdvantageDisadvantageCards(cityData.advantage_disadvantage_cards);
      }
    }
  }, [cityData, setDindins, setSituationCards, setAdvantageDisadvantageCards]);

  const handleSortearCards = async () => {
    const selectedCards = generateSituationCards();
    if (selectedCards) {
      const points = selectedCards.reduce((acc, card) => {
        acc[card.categoryId] = card.points;
        return acc;
      }, {} as Record<string, number>);

      // Save to Firebase
      try {
        await updateCityInRoom(roomId, cityId, {
          situation_cards: selectedCards,
          points,
          initial_points: points
        });
      } catch (error) {
        console.error('Error saving situation cards to Firebase:', error);
      }
    }
  };

  const handleSortearAdvDisadvCards = async () => {
    const selectedCards = await generateAdvantageDisadvantageCards();
    if (selectedCards) {
      const currentPoints = cityData?.points || {};
      const points = selectedCards.reduce((acc, card) => {
        acc[card.category_id] = currentPoints[card.category_id] + (card.points * (
          card.type === 'Vantagem' ? 1 : -1
        ));
        return acc;
      }, currentPoints);

      // Save to Firebase
      try {
        await updateCityInRoom(roomId, cityId, {
          advantage_disadvantage_cards: selectedCards,
          points,
          initial_points: points
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

  const handleEditCity = async (newCityName: string, newNumberOfPlayers: number) => {
    try {
      // Update city name in the room
      await updateCityInRoom(roomId, cityId, {
        name: newCityName
      });
      
      // Update player data if exists
      if (player?.id) {
        await updatePlayer(player.id, {
          cityName: newCityName,
          playerCount: newNumberOfPlayers
        });
      }
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Check if all elements are sorted (ready to start game)
  const allElementsSorted = dindins !== undefined &&
    situationCards !== undefined &&
    advantageDisadvantageCards !== undefined;

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
      <div className="flex gap-4 mx-auto items-center">
        <h1 className="text-2xl font-semibold text-center">Sala #{room.id} - {cityData.name}</h1>
        <Button size="icon" variant="outline" onClick={handleOpenEditModal}>
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>

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

      <EditCityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cityName={cityData.name}
        numberOfPlayers={player?.playerCount || 1}
        onSave={handleEditCity}
      />
    </div>
  );
} 