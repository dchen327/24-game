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
  const difficulties = ["Easy", "Medium", "Hard"];
  const [puzzleIdxs, setPuzzleIdxs] = useState<number[]>([0, 0, 0]);
  const [gameNums, setGameNums] = useState<GameNum[]>([]);
  const operations: string[] = ["+", "−", "×", "÷"];
  const [selectededNumIdx, setSelectedNumIdx] = useState<number | null>(null);
  const [selectedOpIdx, setSelectedOpIdx] = useState<number | null>(null);

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

  const handleNumClick = (index: number) => {
    if (selectededNumIdx !== null && selectedOpIdx !== null) {
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
    } else {
      setSelectedNumIdx(index);
    }
  };

  const handleOpClick = (index: number) => {
    setSelectedOpIdx(index);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-medium">{difficulties[difficulty]}</h1>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
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
        <div className="grid grid-cols-4 gap-8 mt-16 w-full max-w-xs">
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
