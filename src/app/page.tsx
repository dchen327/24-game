"use client";

import Fraction from "fraction.js";
import puzzlesImport from "@/puzzles.json";
import {
  ArrowLeftRight,
  Lightbulb,
  RotateCcw,
  Settings,
  Shuffle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/settings-modal";
import { GameNum } from "@/types/game-types";
import { SolvedModal } from "@/components/solved-modal";
import { gameUtils } from "@/components/game-utils";

const DIFFICULTY_KEY = "game-difficulty";
const AUTOCOMPLETE_KEY = "game-autocomplete";
const RANDOM_PROB_KEY = "game-random-prob";

export default function Home() {
  // Initially shuffle puzzles (3 lists easy, med, hard)
  const [puzzles, setPuzzles] = useState<Fraction[][][]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading puzzles and localStorage
  const [difficulty, setDifficulty] = useState<number>(1); // 0-2 (easy-hard)
  const [tempPuzzleDifficulty, setTempPuzzleDifficulty] = useState<
    number | null
  >(null); // For when randomly adding another question from another difficulty
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
  const [autocomplete, setAutocomplete] = useState<boolean>(true);
  const [randomProb, setRandomProb] = useState<number>(0.2);
  // Settings form
  const [difficultyForm, setDifficultyForm] = useState<number>(1);
  const [autocompleteForm, setAutocompleteForm] = useState<boolean>(true);
  const [randomProbForm, setRandomProbForm] = useState<number[]>([0.2]);

  // Load initial data: puzzles and stored difficulty
  useEffect(() => {
    const loadInitialData = () => {
      // Load puzzles
      const puzzles = puzzlesImport.map((puzzleSet) =>
        gameUtils.shuffle(
          puzzleSet.map((puzzle) =>
            puzzle.split(" ").map((num) => new Fraction(num))
          )
        )
      );
      setPuzzles(puzzles);

      // Load local storage
      const storedDifficulty = localStorage.getItem(DIFFICULTY_KEY);
      if (storedDifficulty !== null) {
        setDifficulty(parseInt(storedDifficulty));
      }
      const storedAutocomplete = localStorage.getItem(AUTOCOMPLETE_KEY);
      if (storedAutocomplete !== null) {
        setAutocomplete(storedAutocomplete === "true");
      }
      const storedRandomProb = localStorage.getItem(RANDOM_PROB_KEY);
      if (storedRandomProb !== null) {
        setRandomProb(parseFloat(storedRandomProb));
      }

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Display new puzzle
  useEffect(() => {
    if (loading) return;
    const currDifficulty = tempPuzzleDifficulty ?? difficulty;
    const gameNums = gameUtils.shuffle(
      puzzles[currDifficulty][puzzleIdxs[currDifficulty]]
    );
    setGameNums(gameNums);
    setGameHistory([gameNums]);
  }, [difficulty, puzzleIdxs, puzzles, loading, tempPuzzleDifficulty]);

  // Check if solved
  useEffect(() => {
    if (
      gameNums.filter((num) => num !== null).length === 1 &&
      gameNums.some((num) => num?.valueOf() === 24)
    ) {
      setShowSolvedModal(true);
      // Autocomplete last step
    } else if (
      autocomplete &&
      gameNums.filter((num) => num !== null).length === 2
    ) {
      // Check if can get to 24 with last 2
      const nonNull = gameNums.filter((num) => num !== null);
      const num1 = nonNull[0]!;
      const num2 = nonNull[1]!;
      const soln = gameUtils.checkLastTwoNums(num1, num2);
      if (soln) {
        setSolveSteps((prevSteps) => [...prevSteps, soln]);
        setShowSolvedModal(true);
      }
    }
  }, [autocomplete, gameNums]);

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
      if (num1 === null || num2 === null) return;
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
    if (difficulty > 0 && Math.random() < randomProb) {
      // randomly pick another easier difficulty
      const otherDifficulties = [0, 1, 2].filter((d) => d < difficulty);
      const newDifficulty =
        otherDifficulties[Math.floor(Math.random() * otherDifficulties.length)];
      newPuzzleIdxs[newDifficulty] =
        (puzzleIdxs[newDifficulty] + 1) % puzzles[newDifficulty].length;
      setTempPuzzleDifficulty(newDifficulty);
    } else {
      // normal case: stay on same difficulty and increment
      newPuzzleIdxs[difficulty] =
        (puzzleIdxs[difficulty] + 1) % puzzles[difficulty].length;
      setTempPuzzleDifficulty(null);
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
    setDifficultyForm(difficulty);
    setAutocompleteForm(autocomplete);
    setRandomProbForm([randomProb]);
    setShowSettingsModal(true);
  };

  const handleSaveSettingsClick = () => {
    setDifficulty(difficultyForm);
    setAutocomplete(autocompleteForm);
    setRandomProb(randomProbForm[0]);
    localStorage.setItem(DIFFICULTY_KEY, difficultyForm.toString());
    localStorage.setItem(AUTOCOMPLETE_KEY, autocompleteForm.toString());
    localStorage.setItem(RANDOM_PROB_KEY, randomProbForm[0].toString());
    setShowSettingsModal(false);
  };

  const handleShuffleClick = () => {
    const maxAttempts = 10; // Limit the number of shuffle attempts
    let shuffledNums = [...gameNums];
    let attempts = 0;

    const areArraysEqual = (arr1: GameNum[], arr2: GameNum[]) => {
      return (
        arr1.length === arr2.length &&
        arr1.every(
          (num, index) => num?.toFraction() === arr2[index]?.toFraction()
        )
      );
    };

    do {
      shuffledNums = gameUtils.shuffle([...gameNums]);
      attempts++;
    } while (areArraysEqual(shuffledNums, gameNums) && attempts < maxAttempts);

    setGameNums(shuffledNums);
  };

  return (
    <div className="flex flex-col h-svh bg-white" onClick={handleOutsideClick}>
      {/* Header */}
      <div
        className="flex items-center justify-between pt-4 px-4"
        onClick={handleOpenSettingsModal}
      >
        <div className="w-12" />
        <h1 className="text-2xl font-medium flex-grow text-center">
          {loading ? "" : difficulties[difficulty]}
        </h1>
        <button className="w-12 h-12 flex items-center justify-center">
          <Settings className="h-6 w-6" />
        </button>
      </div>
      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="grid grid-cols-2 gap-4 w-full max-w-sm px-4 mx-4 "
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
          className="grid grid-cols-4 gap-0 mx-4 my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {operations.map((op, index) => (
            <button
              key={index}
              className={`text-5xl pb-12 pt-16 px-10 flex items-center justify-center max-w-24 max-h-24 ${
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
              onClick={handleShuffleClick}
            >
              <Shuffle className="h-6 w-6" />
              <span className="text-xs">Shuffle</span>
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
      <SolvedModal
        open={showSolvedModal}
        onOpenChange={setShowSolvedModal}
        gameHistory={gameHistory}
        difficulty={difficulties[tempPuzzleDifficulty ?? difficulty]}
        solveSteps={solveSteps}
        handleNewPuzzleClick={handleNewPuzzleClick}
      />
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        autocompleteForm={autocompleteForm}
        setAutocompleteForm={setAutocompleteForm}
        difficultyForm={difficultyForm}
        setDifficultyForm={setDifficultyForm}
        randomProbForm={randomProbForm}
        setRandomProbForm={setRandomProbForm}
        handleSaveSettingsClick={handleSaveSettingsClick}
      />
    </div>
  );
}
