"use client";

import Fraction from "fraction.js";
import puzzlesImport from "@/puzzles.json";
import { ArrowLeftRight, Lightbulb, RotateCcw, Settings } from "lucide-react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type GameNum = Fraction | null;

export default function Home() {
  // initially shuffle puzzles (3 lists easy, med, hard)
  const [puzzles, setPuzzles] = useState<Fraction[][][]>([]);
  const [loading, setLoading] = useState<boolean>(true); // for loading puzzles
  const [difficulty, setDifficulty] = useState<number>(0); // 0-2
  const [tempDifficulty, setTempDifficulty] = useState<number>(0); // for settings form
  const difficulties = ["Easy", "Medium", "Hard"];
  const [puzzleIdxs, setPuzzleIdxs] = useState<number[]>([0, 0, 0]);
  const [gameNums, setGameNums] = useState<GameNum[]>([]);
  const operations: string[] = ["+", "−", "×", "÷"];
  const [selectededNumIdx, setSelectedNumIdx] = useState<number | null>(null);
  const [selectedOpIdx, setSelectedOpIdx] = useState<number | null>(null);
  const [gameHistory, setGameHistory] = useState<GameNum[][]>([]);
  const [showSolvedModal, setShowSolvedModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Load puzzles
  useEffect(() => {
    // shuffle puzzles initially
    const puzzles = puzzlesImport.map((puzzleSet) =>
      shuffle(
        puzzleSet.map((puzzle) =>
          puzzle.split(" ").map((num) => new Fraction(num))
        )
      )
    );
    setPuzzles(puzzles);
    setLoading(false);
  }, []);

  // Display new puzzle
  useEffect(() => {
    if (loading) return;
    const gameNums = shuffle(puzzles[difficulty][puzzleIdxs[difficulty]]);
    setGameNums(gameNums);
    setGameHistory([gameNums]);
  }, [difficulty, puzzleIdxs, puzzles, loading]);

  // Check if solved
  useEffect(() => {
    if (
      gameNums.filter((num) => num !== null).length === 1 &&
      gameNums.some((num) => num?.valueOf() === 24)
    ) {
      setShowSolvedModal(true);
    }
  }, [gameNums]);

  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleNumClick = (index: number) => {
    if (
      selectededNumIdx !== null &&
      selectedOpIdx !== null &&
      index !== selectededNumIdx
    ) {
      const num1 = gameNums[selectededNumIdx]!;
      const num2 = gameNums[index]!;
      let result: Fraction;
      switch (selectedOpIdx) {
        case 0:
          result = num1.add(num2);
          break;
        case 1:
          result = num1.sub(num2);
          break;
        case 2:
          result = num1.mul(num2);
          break;
        case 3:
          result = num1.div(num2);
          break;
        default:
          return;
      }
      setSelectedNumIdx(index);
      setSelectedOpIdx(null);
      setGameNums((prevNums) => {
        const newNums = [...prevNums];
        newNums[index] = result;
        newNums[selectededNumIdx] = null;
        return newNums;
      });
      setGameHistory((prevHistory) => [...prevHistory, gameNums]);
    } else {
      setSelectedNumIdx(index);
    }
  };

  const handleOpClick = (index: number) => {
    setSelectedOpIdx(index);
  };

  const handleUndoClick = () => {
    if (gameHistory.length === 0) return;
    const prevGameNums = gameHistory[gameHistory.length - 1];
    setGameNums(prevGameNums);
    setGameHistory((prevHistory) => prevHistory.slice(0, -1));
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
  };

  const handleNewPuzzleClick = (): void => {
    setShowSolvedModal(false);
    // TODO: small chance of randomly picking another difficulty
    // update idx to be +1 mod len
    const newPuzzleIdxs = [...puzzleIdxs];
    newPuzzleIdxs[difficulty] =
      (puzzleIdxs[difficulty] + 1) % puzzles[difficulty].length;
    setPuzzleIdxs(newPuzzleIdxs);
    setSelectedNumIdx(null);
    setGameHistory([]);
  };

  const handleHintClick = () => {
    console.log("hint");
  };

  const handleOpenSettingsModal = () => {
    setTempDifficulty(difficulty);
    setShowSettingsModal(true);
  };

  const handleSaveSettingsClick = () => {
    setDifficulty(tempDifficulty);
    setShowSettingsModal(false);
  };

  return (
    <div className="flex flex-col h-svh bg-white">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-medium">{difficulties[difficulty]}</h1>
      </div>
      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 mx-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {gameNums.map((num, index) => (
            <button
              key={index}
              className={`aspect-square rounded-2xl flex items-center justify-center text-7xl font-medium ${
                selectededNumIdx === index
                  ? "bg-blue-100 border-2 border-gray-600"
                  : "bg-gray-100"
              }`}
              onClick={() => handleNumClick(index)}
            >
              {num?.valueOf()}
            </button>
          ))}
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-4 gap-8 mt-16 w-full max-w-sm">
          {operations.map((op, index) => (
            <button
              key={index}
              className={`text-5xl p-6 flex items-center justify-center w-16 h-16 ${
                selectedOpIdx === index
                  ? "border-2 border-gray-600 rounded-full"
                  : ""
              }`}
              onClick={() => handleOpClick(index)}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
      {/* Bottom Toolbar */}
      <div className="w-full">
        <div className="max-w-sm mx-auto py-4 bg-gray-50 rounded-xl">
          <div className="flex justify-around items-center">
            <button
              className="flex flex-col items-center gap-1"
              onClick={handleNewPuzzleClick}
            >
              <ArrowLeftRight className="h-6 w-6" />
              <span className="text-xs">New</span>
            </button>
            <button
              className="flex flex-col items-center gap-1"
              onClick={handleOpenSettingsModal}
            >
              <Settings className="h-6 w-6" />
              <span className="text-xs">Settings</span>
            </button>
            <button
              className="flex flex-col items-center gap-1"
              onClick={handleHintClick}
            >
              <Lightbulb className="h-6 w-6" />
              <span className="text-xs">Hint</span>
            </button>
            <button
              className="flex flex-col items-center gap-1"
              onClick={handleUndoClick}
            >
              <RotateCcw className="h-6 w-6" />
              <span className="text-xs">Undo</span>
            </button>
          </div>
        </div>
      </div>
      {/* Solved Modal */}
      <Dialog open={showSolvedModal} onOpenChange={setShowSolvedModal}>
        <DialogContent onInteractOutside={handleNewPuzzleClick}>
          <DialogHeader>
            <DialogTitle className="text-xl">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {gameHistory[0]?.map((num, index) => (
                <button
                  key={index}
                  className="aspect-square rounded-2xl flex items-center justify-center text-7xl font-medium bg-gray-100"
                >
                  {num?.valueOf()}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-blue-500" onClick={handleNewPuzzleClick}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="font-semibold text-right">Difficulty</Label>
              <Select
                value={tempDifficulty.toString()}
                onValueChange={(value) => setTempDifficulty(Number(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Easy</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSaveSettingsClick}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Save changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
