"use client"

import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group"
import { Button } from "@/app/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSocket } from "./components/SocketContext"
import { toast } from "sonner"

export default function StartGameDialog() {
  const [difficulty, setDifficulty] = useState("")
  const [input, setInput] = useState("")
  const [loadingText, setLoadingText] = useState("Start game")
  const { socket } = useSocket()
  const router = useRouter()

  const id = socket?.id

  const onSubmitHandler = async () => {
    if (!input || !difficulty) {
      return
    }
    setLoadingText("Creating game...")
    localStorage.setItem("name", input)

    try {
      if (!socket?.id) {
        toast.error("Could not connect to the server")
        setLoadingText("Start game")
        return
      }
      router.push(`/room/${id}?difficulty=${difficulty}`)
    } catch (error) {
      console.log(error)
    }
  }

  const isDisabled = !input || !difficulty || loadingText === "Creating game..."

  return (
    <div className="flex flex-col gap-4 md:px-[30dvw] py-[10dvh] max-h-[80dvh]">
      <h1 className="text-6xl font-bold text-center">Sudoku-Live</h1>
      <h3 className="text-2xl font-bold text-center mb-15">Start a new game</h3>
      <div className="grid gap-6">
        <Label>Name</Label>
        <Input
          placeholder="Enter your name"
          minLength={1}
          id="name"
          type="text"
          required
          value={input}
          className="peer [&:user-invalid:not(:focus)]:border-red-500"
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="hidden text-red-500 text-sm peer-[&:user-invalid:not(:focus)]:block">
          This field is required
        </p>
      </div>
      <div className="grid gap-6">
        <div className="flex items-center">
          <Label>Difficulty</Label>
        </div>
        <ToggleGroup
          type="single"
          className="w-full flex-col items-start gap-4"
          onValueChange={(type : string) => setDifficulty(type)}
        >
          {['easy', 'medium', 'hard', 'expert'].map((difficulty) => (
            <ToggleGroupItem
              key={difficulty}
              value={difficulty}
              aria-label={`Toggle ${difficulty}`}
              className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/50 hover:text-white transition-colors duration-400 data-[state=on]:bg-primary/20"
            >
              {difficulty}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Button
        variant={"destructive"}
        className="w-full cursor-pointer p-6 mt-10"
        disabled={isDisabled}
        onClick={onSubmitHandler}>
          {loadingText}
      </Button>
    </div>
  )
}