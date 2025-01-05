"use client";

import Fraction from "fraction.js";
import puzzlesImport from "@/puzzles.json";
import {
  ArrowLeftRight,
  Lightbulb,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

import { useEffect, useState } from "react";

type GameNum = Fraction | null;

export default function Home() {
  // initially shuffle puzzles (3 lists easy, med, hard)
  const [puzzles, setPuzzles] = useState<Fraction[][][]>([]);
  const [loading, setLoading] = useState<boolean>(true); // for loading puzzles
  const [difficulty, setDifficulty] = useState<number>(0); // 0-2
  const [puzzleIdxs, setPuzzleIdxs] = useState<number[]>([0, 0, 0]);
  const [gameNums, setGameNums] = useState<GameNum[]>([]);

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

  useEffect(() => {
    if (loading) return;
    const gameNums = puzzles[difficulty][puzzleIdxs[difficulty]];
    setGameNums(shuffle(gameNums));
    // update idx to be +1 mod len
    // const newPuzzleIdxs = [...puzzleIdxs];
    // newPuzzleIdxs[difficulty] =
    //   (puzzleIdxs[difficulty] + 1) % puzzles[difficulty].length;
    // setPuzzleIdxs(newPuzzleIdxs);
  }, [difficulty, puzzleIdxs, puzzles, loading]);

  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-medium">Hard</h1>
        <div className="text-lg">00:05</div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {gameNums.map((num, index) => (
            <button
              key={index}
              className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-4xl font-medium"
            >
              {num?.valueOf()}
            </button>
          ))}
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-4 gap-8 mt-16 w-full max-w-xs">
          <button className="text-3xl">+</button>
          <button className="text-3xl">-</button>
          <button className="text-3xl">×</button>
          <button className="text-3xl">÷</button>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex justify-around items-center py-4 bg-gray-50">
        <button className="flex flex-col items-center gap-1">
          <ArrowLeftRight className="h-6 w-6" />
          <span className="text-xs">New</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs">Ask</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Lightbulb className="h-6 w-6" />
          <span className="text-xs">Hint</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <RotateCcw className="h-6 w-6" />
          <span className="text-xs">Undo</span>
        </button>
      </div>
    </div>
  );
}
