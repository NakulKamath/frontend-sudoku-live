"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";

function isValidName(name: string) {
  return /^[a-zA-Z0-9_ ]+$/.test(name);
}

interface NameDialogProps {
  handleMovePos: (pos: number | null) => void;
}

export default function NameDialog({ handleMovePos }: NameDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem('name');
    console.log("Stored name:", storedName);
    if (!storedName) {
      setOpen(true);
    } else {
      setName(storedName);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setError("");
  };

  const handleEnter = () => {
    if (!input.trim()) {
      setError("Name is required.");
      return;
    }
    if (!isValidName(input.trim())) {
      setError("No special characters allowed.");
      return;
    }
    setName(input.trim());
    console.log(name);
    handleMovePos(null);
    localStorage.setItem('name', input.trim());
    setOpen(false);
    toast.success("Username set successfully!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="">
            Change Username
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your username</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Username"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => {
              if (e.key === "Enter") handleEnter();
            }}
            autoFocus
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          <DialogFooter>
            <Button onClick={handleEnter}>Enter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}