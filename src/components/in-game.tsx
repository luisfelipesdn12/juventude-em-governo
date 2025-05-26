"use client";

import { useEffect } from "react";
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

  return (
    <div className="container mx-auto py-8 px-8 flex flex-col min-h-[90vh] justify-between">
      {/* City Name Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">{cityData.name}</h1>
        <p className="text-lg text-muted-foreground">Sala #{room.id}</p>
      </div>

      {/* Cards Carousel */}
      <div className="flex items-center justify-center">
        {allCards.length > 0 ? (
          <div className="max-w-4xl w-[90%]">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className=""
            >
              <CarouselContent>
                {allCards.map((item, index) => (
                  <CarouselItem key={`${item.type}-${index}`} className="basis-[80%]">
                    <div className="p-2 h-full">
                      {item.type === 'situation' ? (
                        <GameCard
                          card={item.data.card}
                          categoryName={item.data.categoryName}
                          className="h-full"
                        />
                      ) : (
                        <GameCardAdvUnforeseen
                          card={item.data}
                          className="h-full"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
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
          D$ {cityData.budget}
        </Button>
        <Button className="col-span-2 text-2xl">
          Governo Aberto
        </Button>
        <Button className="col-span-1 text-2xl">
          Terminar
        </Button>
      </div>
    </div>
  );
} 