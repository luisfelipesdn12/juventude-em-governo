"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useGameStore } from "@/lib/store/game-store";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { CheckCircle, Loader2 } from "lucide-react";
import { calculateCardAverage, OpenGovernmentCard } from "@/lib/data";
import { openGovCategoriesProperties } from "@/lib/categories-properties";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface OpenGovernmentDrawerProps {
    children: React.ReactNode;
}

export function OpenGovernmentDrawer({ children }: OpenGovernmentDrawerProps) {
    const [open, setOpen] = useState(false);
    const [openGovCards, setOpenGovCards] = useState<OpenGovernmentCard[]>([]);
    const [cardsByCategory, setCardsByCategory] = useState<Record<string, OpenGovernmentCard[]>>({});
    const [currentDindins, setCurrentDindins] = useState<number>(0);
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>(undefined);
    const [currentCityData, setCurrentCityData] = useState<Room['cities'][0] | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    // Try to get room/city info from URL params if available
    const params = useParams();
    const urlRoomId = params?.roomId as string;
    const urlCityId = params?.cityId ? parseInt(params.cityId as string) : undefined;

    // Game store for budget
    const { dindins, setDindins } = useGameStore();

    // Room and player stores for real-time budget updates
    const { subscribeToRoom, updateCityInRoom } = useRoomStore();
    const { player } = usePlayerStore();

    // Load open government cards
    const fetchOpenGovernmentCards = async () => {
        try {
            setLoading(true);
            const openGovCardsRef = collection(db, 'open_government_cards');
            const openGovCardsSnapshot = await getDocs(openGovCardsRef);
            const cardsData = openGovCardsSnapshot.docs.map(doc => ({
                id: doc.id,
                category: doc.data().category,
                text: doc.data().text,
                price: doc.data().price,
                reward: doc.data().reward,
            }));
            setOpenGovCards(cardsData);
        } catch (error) {
            console.error('Error fetching open government cards:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load data when drawer opens
    useEffect(() => {
        if (open) {
            fetchOpenGovernmentCards();
        }
    }, [open]);

    // Set up real-time room subscription to get budget updates
    useEffect(() => {
        if (open) {
            // Try to get room and city info from URL params first, then fallback to player store
            const roomId = urlRoomId || player?.roomId;
            const cityId = urlCityId || player?.cityId;

            if (roomId && cityId !== undefined) {
                const unsubscribeRoom = subscribeToRoom(roomId, (room: Room | undefined) => {
                    if (room) {
                        setCurrentRoom(room);
                        const cityData = room.cities.find(c => c.id === cityId);
                        if (cityData) {
                            setCurrentCityData(cityData);
                            // Update game store dindins with the real-time budget
                            setDindins(cityData.budget);
                            setCurrentDindins(cityData.budget);
                        }
                    }
                });

                return () => {
                    unsubscribeRoom();
                };
            }
        }
    }, [open, urlRoomId, urlCityId, player?.roomId, player?.cityId, subscribeToRoom, setDindins]);

    // Use current dindins (either from real-time updates or fallback to game store)
    const displayDindins = currentDindins || dindins || 0;

    // Group cards by category
    useEffect(() => {
        if (openGovCards.length > 0) {
            const grouped = openGovCards.reduce((acc, card) => {
                const category = card.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(card);
                return acc;
            }, {} as Record<string, OpenGovernmentCard[]>);

            setCardsByCategory(grouped);
        }
    }, [openGovCards]);

    // Function to handle card purchase
    const handleCardPurchase = async (card: OpenGovernmentCard) => {
        if (!currentRoom || !currentCityData) return;
        
        const roomId = urlRoomId || player?.roomId;
        const cityId = urlCityId || player?.cityId;
        
        if (!roomId || cityId === undefined) return;

        // Check if can buy
        const canBuy = displayDindins >= card.price;
        const alreadyBought = currentCityData.open_government_cards?.some(ownedCard => ownedCard.id === card.id) || false;
        
        if (!canBuy || alreadyBought) return;

        try {
            // Calculate new budget
            let newBudget = currentCityData.budget - card.price;
            
            // Add card to purchased cards
            const newOpenGovCards = [...(currentCityData.open_government_cards || []), card];
            
            // Apply reward based on type
            if (card.reward.type === "dindins") {
                newBudget += card.reward.quantity;
            } else if (card.reward.type === "points") {
                // Get current situation cards
                const currentSituationCards = [...(currentCityData.situation_cards || [])];

                // Apply points to the specified category or all categories
                if (card.reward.category_id) {
                    // Apply to specific category
                    currentSituationCards.forEach(situationCard => {
                        if (situationCard.categoryId === card.reward.category_id) {
                            situationCard.card.metrics.forEach(metric => {
                                metric.points = Math.min(5, metric.points + card.reward.quantity);
                            });
                        }
                    });
                } else {
                    // Apply to all categories
                    currentSituationCards.forEach(situationCard => {
                        situationCard.card.metrics.forEach(metric => {
                            metric.points = Math.min(5, metric.points + card.reward.quantity);
                        });
                    });
                }

                // Calculate card average of new situation cards
                const newSituationCardsWithAverage = currentSituationCards.map(situationCard => ({
                    ...situationCard,
                    points: calculateCardAverage(situationCard.card.metrics)
                }));

                // Calculate new points
                const newPoints = newSituationCardsWithAverage.reduce((acc, card) => {
                    acc[card.categoryId] = card.points;
                    return acc;
                }, {} as Record<string, number>);

                // Update city in room with situation cards and points
                await updateCityInRoom(roomId, cityId, {
                    budget: newBudget,
                    open_government_cards: newOpenGovCards,
                    situation_cards: newSituationCardsWithAverage,
                    points: newPoints,
                });
                
                return;
            }

            // Update city in room (for dindins reward or no points reward)
            await updateCityInRoom(roomId, cityId, {
                budget: newBudget,
                open_government_cards: newOpenGovCards,
            });

        } catch (error) {
            console.error('Error purchasing open government card:', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const categories = Object.keys(openGovCategoriesProperties);

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
                <DrawerHeader>
                    <DrawerTitle>Governo Aberto</DrawerTitle>
                </DrawerHeader>

                <div className="px-4 pb-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Carregando cartas...</span>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                        </div>
                    ) : (
                        <Tabs defaultValue={categories[0]} className="w-full">
                            <TabsList className="flex w-full">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        title={category}
                                    >
                                        <div className="aspect-square w-full rounded-full bg-muted-foreground max-w-32" style={{
                                            backgroundColor: openGovCategoriesProperties[category]?.color,
                                            backgroundImage: `url(${openGovCategoriesProperties[category]?.icon})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }}>

                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categories.map((category) => (
                                <TabsContent key={category} value={category} className="space-y-3">
                                    {cardsByCategory[category]?.length > 0 ? (
                                        <div className="grid gap-3">
                                            {cardsByCategory[category].map((card, index) => {
                                                const canBuy = displayDindins && displayDindins >= card.price;
                                                const alreadyBought = currentCityData?.open_government_cards?.some(ownedCard => ownedCard.id === card.id) || false;

                                                return (
                                                    <Card key={card.id}
                                                        className="p-4 cursor-pointer transition-all hover:scale-[1.02]"
                                                        style={{
                                                            backgroundColor: openGovCategoriesProperties[category]?.color,
                                                            opacity: canBuy && !alreadyBought ? 1 : 0.5,
                                                        }}
                                                        onClick={() => handleCardPurchase(card)}
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <p className="text-2xl font-semibold leading-relaxed">{card.category} {index + 1}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-bold text-2xl">
                                                                    {alreadyBought ? (
                                                                        <>
                                                                            <CheckCircle className="w-6 h-6" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            D$ {formatPrice(card.price)}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                Nenhuma carta encontrada nesta categoria
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>

                <DrawerFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-4xl font-bold flex justify-between w-full">
                            <h1>
                                Total
                            </h1>
                            <p>
                                D$ {displayDindins ? formatPrice(displayDindins) : "0"}
                            </p>
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 