"use client";

import { useEffect, useState } from "react";
import { Room } from "@/lib/store/room-store";
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
import { Button } from "./ui/button";
import { ValueTableDrawer } from "./value-table-drawer";
import { FullscreenCardsOverlay } from "./FullscreenCardsOverlay";
import { FullscreenAdvDisadvOverlay } from "./FullscreenAdvDisadvOverlay";

interface InGameProps {
  room: Room;
  cityData: Room['cities'][0];
}

export function InGame({ room, cityData }: InGameProps) {
  // Game store state and actions
  const {
    situationCards,
    advantageDisadvantageCards,
    setDindins,
    setSituationCards,
    setAdvantageDisadvantageCards,
  } = useGameStore();

  // State for fullscreen overlays
  const [isSituationOverlayOpen, setIsSituationOverlayOpen] = useState(false);
  const [isAdvDisadvOverlayOpen, setIsAdvDisadvOverlayOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

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
    }))
  ];

  // Handle card click for fullscreen view
  const handleCardClick = (index: number, cardType: 'situation' | 'advantage-disadvantage') => {
    if (cardType === 'situation') {
      // Find the index within situation cards only
      const situationCardIndex = allCards.slice(0, index + 1).filter(card => card.type === 'situation').length - 1;
      setSelectedCardIndex(situationCardIndex);
      setIsSituationOverlayOpen(true);
    } else {
      // Find the index within advantage/disadvantage cards only
      const advDisadvCardIndex = allCards.slice(0, index + 1).filter(card => card.type === 'advantage-disadvantage').length - 1;
      setSelectedCardIndex(advDisadvCardIndex);
      setIsAdvDisadvOverlayOpen(true);
    }
  };

  const handleCloseSituationOverlay = () => {
    setIsSituationOverlayOpen(false);
  };

  const handleCloseAdvDisadvOverlay = () => {
    setIsAdvDisadvOverlayOpen(false);
  };

  return (
    <>
      <div className="container mx-auto py-8 px-8 flex flex-col min-h-[90vh] justify-between">
        {/* City Name Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{cityData.name}</h1>
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
                            onClick={() => handleCardClick(index, 'situation')}
                          />
                        ) : (
                          <GameCardAdvUnforeseen
                            card={item.data}
                            className="h-full"
                            onClick={() => handleCardClick(index, 'advantage-disadvantage')}
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
          <Button className="col-span-2 text-2xl">
            Governo Aberto
          </Button>
          <Button className="col-span-1 text-2xl">
            Terminar
          </Button>
        </div>
      </div>

      {/* Fullscreen Overlays */}
      {situationCards && (
        <FullscreenCardsOverlay
          cards={situationCards}
          isOpen={isSituationOverlayOpen}
          onClose={handleCloseSituationOverlay}
          initialIndex={selectedCardIndex}
        />
      )}

      {advantageDisadvantageCards && (
        <FullscreenAdvDisadvOverlay
          cards={advantageDisadvantageCards}
          isOpen={isAdvDisadvOverlayOpen}
          onClose={handleCloseAdvDisadvOverlay}
          initialIndex={selectedCardIndex}
        />
      )}
    </>
  );
} 