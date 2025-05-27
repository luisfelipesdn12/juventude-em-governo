"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { Room, useRoomStore } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { useGameStore } from "@/lib/store/game-store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCard } from "@/components/GameCard";
import { GameCardAdvUnforeseen } from "./GameCardAdvUnforeseen";
import { GameCardOpenGov } from "./GameCardOpenGov";
import { Button } from "./ui/button";
import { PencilIcon } from "lucide-react";
import { ValueTableDrawer } from "./value-table-drawer";
import { FullscreenUnifiedCardsOverlay } from "./FullscreenUnifiedCardsOverlay";
import { EditCityModal } from "@/components/edit-city-modal";
import { OpenGovernmentDrawer } from "@/components/open-government-drawer";
import { openGovCategoriesProperties } from "@/lib/categories-properties";

interface InGameProps {
  roomId: string;
  cityId: number;
  room: Room;
  cityData: Room['cities'][0];
}

export function InGame({ roomId, cityId, room, cityData }: InGameProps) {
  const { updateCityInRoom } = useRoomStore();
  const { player, updatePlayer } = usePlayerStore();
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Game store state and actions
  const {
    situationCards,
    advantageDisadvantageCards,
    setDindins,
    setSituationCards,
    setAdvantageDisadvantageCards,
  } = useGameStore();

  // State for fullscreen overlays
  const [isUnifiedOverlayOpen, setIsUnifiedOverlayOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  
  // State for current time to calculate remaining time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for the timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate remaining time percentage
  const getRemainingTimePercentage = () => {
    if (!room?.startedAt || room.state !== 'started') return 100;
    
    const startTime = room.startedAt.toDate();
    const elapsedSeconds = differenceInSeconds(currentTime, startTime);
    const totalGameTimeSeconds = room.settings.time * 60; // Convert minutes to seconds
    const remainingSeconds = Math.max(0, totalGameTimeSeconds - elapsedSeconds);
    
    return Math.max(0, (remainingSeconds / totalGameTimeSeconds) * 100);
  };

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

  // Combine all cards into a single array for the carousel
  const allCards = [
    ...(situationCards || []).map(item => ({
      type: 'situation' as const,
      data: item
    })),
    ...(advantageDisadvantageCards || []).map(item => ({
      type: 'advantage-disadvantage' as const,
      data: item
    })),
    ...(cityData.open_government_cards || []).map(item => ({
      type: 'open-government' as const,
      data: item
    }))
  ];

  // Handle card click for fullscreen view
  const handleCardClick = (index: number) => {
    setSelectedCardIndex(index);
    setIsUnifiedOverlayOpen(true);
  };

  const handleCloseUnifiedOverlay = () => {
    setIsUnifiedOverlayOpen(false);
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

  const handleFinishGame = async () => {
    try {
      await updateCityInRoom(roomId, cityId, {
        state: 'finished'
      });
    } catch (error) {
      console.error('Error finishing game:', error);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 px-8 flex flex-col min-h-[90vh] justify-between">
        {/* City Name Header */}
        <div className="text-center mb-8">
          <div className="flex gap-4 mx-auto items-center justify-center">
            <h1 className="text-4xl font-bold text-primary">{cityData.name}</h1>
            <Button size="icon" variant="outline" onClick={handleOpenEditModal}>
              <PencilIcon className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">Sala #{room.id}</p>
        </div>

        {/* Cards Carousel */}
        <div className="flex items-center justify-center">
          {allCards.length > 0 ? (
            <div className="max-w-4xl w-[100%]">
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {allCards.map((item, index) => (
                    <CarouselItem key={`${item.type}-${index}`} className="basis-[80%] md:basis-[60%] lg:basis-[40%]">
                      <div className="p-2 h-full">
                        {item.type === 'situation' ? (
                          <GameCard
                            card={item.data.card}
                            categoryName={item.data.categoryName}
                            className="h-full"
                            onClick={() => handleCardClick(index)}
                          />
                        ) : item.type === 'advantage-disadvantage' ? (
                          <GameCardAdvUnforeseen
                            card={item.data}
                            className="h-full"
                            onClick={() => handleCardClick(index)}
                          />
                        ) : (
                          <GameCardOpenGov
                            card={item.data}
                            categoryName={item.data.category}
                            cardBg={openGovCategoriesProperties[item.data.category].cardBg}
                            className="h-full"
                            onClick={() => handleCardClick(index)}
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-6" />
                <CarouselNext className="-right-6" />
              </Carousel>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Nenhuma carta disponível para exibir.
              </p>
            </div>
          )}
        </div>

        {/* Game Info Footer */}
        <div className="mt-8 text-center grid grid-cols-3 gap-2 grid-rows-2">
          <ValueTableDrawer>
            <Button className="col-span-2 text-2xl">
              Tabela de Valores
            </Button>
          </ValueTableDrawer>
          <Button className="col-span-1 text-2xl">
            D$ {cityData.budget?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Button>
          <OpenGovernmentDrawer>
            <Button className="col-span-2 text-2xl">
              Governo Aberto
            </Button>
          </OpenGovernmentDrawer>
          <Button className="col-span-1 text-2xl relative" onClick={handleFinishGame}>
            <div className="absolute left-0 top-0 h-full bg-white/20" style={{
              width: `${getRemainingTimePercentage() <= 100 ? getRemainingTimePercentage() : 100}%`
             }}></div>
            Terminar
          </Button>
        </div>
      </div>

      {/* Fullscreen Overlays */}
      <FullscreenUnifiedCardsOverlay
        situationCards={situationCards}
        advantageDisadvantageCards={advantageDisadvantageCards}
        openGovernmentCards={cityData.open_government_cards}
        isOpen={isUnifiedOverlayOpen}
        onClose={handleCloseUnifiedOverlay}
        initialIndex={selectedCardIndex}
      />
      
      <EditCityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cityName={cityData.name}
        numberOfPlayers={player?.playerCount || 1}
        onSave={handleEditCity}
      />
    </>
  );
}

