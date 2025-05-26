"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  institution: z.string().min(2, { message: "Nome da instituição deve ter pelo menos 2 caracteres" }),
  class: z.string().min(1, { message: "Classe/série é obrigatória" }),
  time: z.coerce.number().min(1, { message: "Tempo deve ser pelo menos 1 minuto" }).max(120, { message: "Tempo não deve ultrapassar 120 minutos" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRoom() {
  const router = useRouter();
  const addRoom = useRoomStore((state) => state.addRoom);
  const loading = useRoomStore((state) => state.loading);
  const error = useRoomStore((state) => state.error);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      institution: "",
      class: "",
      time: 10,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    try {
      // Create a new room object from form data
      const newRoom: Omit<Room, 'id'> = {
        name: data.name,
        institution: data.institution,
        class: data.class,
        settings: {
          time: data.time,
        },
        cities: [],
        state: "drawing"
      }; 

      // Add the room to the store
      const room = await addRoom(newRoom);
      
      // Navigate to the room details page
      router.push(`/applyer/room/${room.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Criar Nova Sala</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para criar uma nova sala para seus alunos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Sala</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Turma de Governo 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instituição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escola Municipal João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe/Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 9º ano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Sala"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        {error && (
          <CardFooter className="text-red-500 text-sm">
            Erro ao criar sala: {error}
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 