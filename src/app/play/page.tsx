"use client"
import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define validation schema
const formSchema = z.object({
  players: z.number().min(1, "Mínimo de 1 jogador").max(4, "Máximo de 4 jogadores"),
  cityName: z.string().min(2, "Nome da cidade deve ter pelo menos 2 caracteres").max(50, "Nome da cidade não pode exceder 50 caracteres"),
  code: z.string().min(4, "Código deve ter pelo menos 4 caracteres").max(10, "Código não pode exceder 10 caracteres"),
})

// Define type from schema
type FormValues = z.infer<typeof formSchema>

export default function Home() {
  // Initialize form with default values and validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      players: 1,
      cityName: "",
      code: "",
    },
  })

  // Get values and state from form
  const { watch, setValue } = form
  const players = watch("players")

  // Handle player count changes
  const incrementPlayers = () => {
    const newValue = Math.min(players + 1, 4)
    setValue("players", newValue, { shouldValidate: true })
  }

  const decrementPlayers = () => {
    const newValue = Math.max(players - 1, 1)
    setValue("players", newValue, { shouldValidate: true })
  }

  // Handle form submission
  function onSubmit(data: FormValues) {
    console.log("Form submitted with:", data)
    // Here you can proceed with your game setup using the data
    alert(`Iniciando jogo com ${data.players} jogadores na cidade ${data.cityName} com código ${data.code}!`)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm">
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <FormField
              control={form.control}
              name="players"
              render={() => (
                <FormItem className="w-full">
                  <FormLabel>Número de Jogadores</FormLabel>
                  <div className="p-4 pb-0">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={decrementPlayers}
                        disabled={players <= 1}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <FormControl>
                        <div className="flex-1 text-center">
                          <div className="text-7xl font-bold tracking-tighter">
                            {players}
                          </div>
                          <div className="text-[0.70rem] uppercase text-muted-foreground">
                            Jogadores
                          </div>
                        </div>
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={incrementPlayers}
                        disabled={players >= 4}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                  </div>
                  <FormMessage className="text-center mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cityName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nome da Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-4 w-full">
              Iniciar Jogo
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
