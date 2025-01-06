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
  const [difficulty, setDifficulty] = useState<number>(1); // 0-2
  const [tempPuzzleDifficulty, setTempPuzzleDifficulty] = useState<
    number | null
  >(null); // for when randomly adding another question from another difficulty
  const [tempDifficultyForm, setTempDifficultyForm] = useState<number>(0); // for settings form
  const difficulties = ["Easy", "Medium", "Hard"];
  const [puzzleIdxs, setPuzzleIdxs] = useState<number[]>([0, 0, 0]);
  const [gameNums, setGameNums] = useState<GameNum[]>([null, null, null, null]);
  const operations: string[] = ["+", "−", "×", "÷"];
  const [selectededNumIdx, setSelectedNumIdx] = useState<number | null>(null);
  const [selectedOpIdx, setSelectedOpIdx] = useState<number | null>(null);
  const [gameHistory, setGameHistory] = useState<GameNum[][]>([]);
  const [solveSteps, setSolveSteps] = useState<string[]>([]);
  const [showSolvedModal, setShowSolvedModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const randomProb = 0.15; // TODO: make this a setting

  const findSoln24 = (num1: Fraction, num2: Fraction): string | null => {
    const operations = [
      { fn: () => num1.add(num2), symbol: "+" },
      { fn: () => num1.sub(num2), symbol: "−" },
      { fn: () => num2.sub(num1), symbol: "−", reverse: true },
      { fn: () => num1.mul(num2), symbol: "×" },
      { fn: () => (num2.valueOf() !== 0 ? num1.div(num2) : null), symbol: "÷" },
      {
        fn: () => (num1.valueOf() !== 0 ? num2.div(num1) : null),
        symbol: "÷",
        reverse: true,
      },
    ];

    for (const op of operations) {
      const result = op.fn();
      if (result?.equals(24)) {
        const n1 = op.reverse ? num2.toFraction() : num1.toFraction();
        const n2 = op.reverse ? num1.toFraction() : num2.toFraction();
        return `${n1} ${op.symbol} ${n2} = 24`;
      }
    }

    return null;
  };

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
    const currDifficulty = tempPuzzleDifficulty ?? difficulty;
    const gameNums = shuffle(puzzles[currDifficulty][puzzleIdxs[difficulty]]);
    setGameNums(gameNums);
    setGameHistory([gameNums]);
  }, [difficulty, puzzleIdxs, puzzles, loading, tempPuzzleDifficulty]);

  // Check if solved, will auto solve if 2 nums left and can get to 24
  useEffect(() => {
    if (
      gameNums.filter((num) => num !== null).length === 1 &&
      gameNums.some((num) => num?.valueOf() === 24)
    ) {
      setShowSolvedModal(true);
    } else if (gameNums.filter((num) => num !== null).length === 2) {
      // check if can get to 24
      const nonNull = gameNums.filter((num) => num !== null);
      const num1 = nonNull[0]!;
      const num2 = nonNull[1]!;
      const soln = findSoln24(num1, num2);
      if (soln) {
        setSolveSteps((prevSteps) => [...prevSteps, soln]);
        setShowSolvedModal(true);
      }
    }
  }, [gameNums]);

  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleOutsideClick = () => {
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
  };

  const handleNumClick = (index: number) => {
    if (index === selectededNumIdx) {
      setSelectedNumIdx(null);
      return;
    }
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
          if (num2.valueOf() === 0) return;
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
      setSolveSteps((prevSteps) => [
        ...prevSteps,
        `${num1.toFraction()} ${
          operations[selectedOpIdx]
        } ${num2.toFraction()} = ${result.toFraction()}`,
      ]);
    } else {
      setSelectedNumIdx(index);
    }
  };

  const handleOpClick = (index: number) => {
    setSelectedOpIdx(index === selectedOpIdx ? null : index);
  };

  const handleUndoClick = () => {
    console.log(solveSteps);
    if (gameHistory.length === 0) return;
    const prevGameNums = gameHistory[gameHistory.length - 1];
    setGameNums(prevGameNums);
    setGameHistory((prevHistory) => prevHistory.slice(0, -1));
    setSolveSteps((prevSteps) => prevSteps.slice(0, -1));
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
  };

  const handleNewPuzzleClick = (): void => {
    setShowSolvedModal(false);
    const newPuzzleIdxs = [...puzzleIdxs];
    if (tempPuzzleDifficulty !== null) {
      // just finished temp puzzle, go back to original difficulty and increment
      setTempPuzzleDifficulty(null);
      newPuzzleIdxs[difficulty] =
        (puzzleIdxs[difficulty] + 1) % puzzles[difficulty].length;
    } else if (Math.random() < randomProb) {
      // randomly pick another difficulty out of the other 2
      const otherDifficulties = [0, 1, 2].filter((d) => d !== difficulty);
      const newDifficulty = otherDifficulties[Math.floor(Math.random() * 2)];
      newPuzzleIdxs[newDifficulty] =
        (puzzleIdxs[newDifficulty] + 1) % puzzles[newDifficulty].length;
      setTempPuzzleDifficulty(newDifficulty);
    } else {
      // normal case: stay on same difficulty and increment
      newPuzzleIdxs[difficulty] =
        (puzzleIdxs[difficulty] + 1) % puzzles[difficulty].length;
    }
    setPuzzleIdxs(newPuzzleIdxs);
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
    setGameHistory([]);
    setSolveSteps([]);
  };

  const handleHintClick = () => {
    console.log("hint");
  };

  const handleOpenSettingsModal = () => {
    setTempDifficultyForm(difficulty);
    setShowSettingsModal(true);
  };

  const handleSaveSettingsClick = () => {
    setDifficulty(tempDifficultyForm);
    setShowSettingsModal(false);
  };

  const parseEquation = (step: string) => {
    console.log(step);
    const [leftSide, rightSide] = step.split("=");
    const parts = leftSide.trim().split(" ");
    return {
      A: parts[0].trim(),
      op: parts[1].trim(),
      B: parts[2].trim(),
      C: rightSide.trim(),
    };
  };

  return (
    <div className="flex flex-col h-svh bg-white" onClick={handleOutsideClick}>
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-medium">{difficulties[difficulty]}</h1>
      </div>
      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 mx-4">
        <div
          className="grid grid-cols-2 gap-4 w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {gameNums.map((num, index) => (
            <button
              key={index}
              className={`aspect-square rounded-2xl flex items-center justify-center text-7xl font-medium ${
                selectededNumIdx === index && gameNums[index] !== null
                  ? "bg-blue-100 border-2 border-gray-600"
                  : "bg-gray-100"
              }`}
              onClick={() => handleNumClick(index)}
            >
              {num?.toFraction()}
            </button>
          ))}
        </div>

        {/* Operation Buttons */}
        <div
          className="grid grid-cols-4 gap-8 mt-16 w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {operations.map((op, index) => (
            <button
              key={index}
              className={`text-5xl p-8 flex items-center justify-center w-24 h-24 relative ${
                selectedOpIdx === index
                  ? "after:absolute after:w-16 after:h-16 after:border-2 after:border-gray-600 after:rounded-full"
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
            <DialogTitle className="text-2xl">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center px-4 mx-10">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {gameHistory[0]?.map((num, index) => (
                <button
                  key={index}
                  className="aspect-square rounded-2xl flex items-center justify-center text-5xl font-medium bg-gray-100"
                >
                  {num?.valueOf()}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 mx-auto p-4">
            {solveSteps.map((step, idx) => {
              const { A, op, B, C } = parseEquation(step);
              return (
                <div key={idx} className="grid grid-cols-5 items-center">
                  <div className="bg-gray-100 rounded p-2 text-center">{A}</div>
                  <div className="text-center p-2">{op}</div>
                  <div className="bg-gray-100 rounded p-2 text-center">{B}</div>
                  <div className="text-center p-2">=</div>
                  <div className="bg-gray-100 rounded p-2 text-center">{C}</div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              className="bg-blue-500 text-lg hover:bg-blue-600 py-6"
              onClick={handleNewPuzzleClick}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="font-semibold text-right text-lg">
                Difficulty:
              </Label>
              <Select
                value={tempDifficultyForm.toString()}
                onValueChange={(value) => setTempDifficultyForm(Number(value))}
              >
                <SelectTrigger className="col-span-3 text-lg">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-lg py-3">
                    Easy
                  </SelectItem>
                  <SelectItem value="1" className="text-lg py-3">
                    Medium
                  </SelectItem>
                  <SelectItem value="2" className="text-lg py-3">
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSaveSettingsClick}
            className="bg-blue-500 text-lg hover:bg-blue-600 py-6"
          >
            Save changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
