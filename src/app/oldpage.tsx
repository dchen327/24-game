"use client";

import { useState, useEffect, useRef } from "react";
import Fraction from "fraction.js";

// Predefined puzzles for each difficulty level
const puzzleSets = {
  easy: [
    [2, 3, 4, 6],
    [1, 2, 8, 8],
    [2, 2, 6, 8],
    [1, 4, 6, 8],
  ],
  medium: [
    [2, 3, 8, 9],
    [2, 4, 7, 8],
    [3, 4, 6, 7],
    [1, 6, 6, 8],
  ],
  hard: [
    [1, 3, 7, 9],
    [2, 5, 7, 8],
    [3, 3, 8, 8],
    [4, 4, 6, 7],
  ],
  extreme: [
    [1, 2, 7, 9],
    [3, 3, 7, 7],
    [2, 3, 5, 9],
    [1, 4, 7, 8],
  ],
};

export default function Home2() {
  const [difficulty, setDifficulty] = useState<number>(0); // 0-3
  const [randomness, setRandomness] = useState<boolean>(true);
  const [selectedNumberIdx, setSelectedNumberIdx] = useState<number | null>(
    null
  );
  const [selectedOpIdx, setSelectedOpIdx] = useState<number | null>(null);
  const [gameNums, setGameNums] = useState<Fraction[]>([
    new Fraction(2),
    new Fraction(3),
    new Fraction(4),
    new Fraction(6),
  ]);
  const [originalGameNums, setOriginalGameNums] = useState<Fraction[]>([
    new Fraction(2),
    new Fraction(3),
    new Fraction(4),
    new Fraction(6),
  ]);
  const [showSolvedModal, setShowSolvedModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<Fraction[][]>([]);

  const operations: string[] = ["+", "-", "x", "÷"];
  const numberButtonsRef = useRef<HTMLDivElement>(null);
  const opButtonsRef = useRef<HTMLDivElement>(null);
  const rotationAngles: number[] = [-45, 45, 225, 135];

  // disable body scrolling
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        numberButtonsRef.current &&
        !numberButtonsRef.current.contains(event.target as Node) &&
        opButtonsRef.current &&
        !opButtonsRef.current.contains(event.target as Node)
      ) {
        setSelectedNumberIdx(null);
        setSelectedOpIdx(null);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, []);

  useEffect(() => {
    if (
      gameNums.filter((num) => num !== "").length === 1 &&
      gameNums.some((num) => num && num.valueOf() === 24)
    ) {
      setShowSolvedModal(true);
    }
  }, [gameNums]);

  const getRandomPuzzle = (difficultyLevel: number): number[] => {
    const puzzleSet = (() => {
      switch (difficultyLevel) {
        case 0:
          return puzzleSets.easy;
        case 1:
          return puzzleSets.medium;
        case 2:
          return puzzleSets.hard;
        case 3:
          return puzzleSets.extreme;
        default:
          return puzzleSets.easy;
      }
    })();

    const randomIndex = Math.floor(Math.random() * puzzleSet.length);
    return puzzleSet[randomIndex];
  };

  const handleNumberClick = (idx: number): void => {
    if (
      gameNums[idx] !== "" &&
      selectedNumberIdx !== null &&
      selectedOpIdx !== null
    ) {
      const num1 = gameNums[selectedNumberIdx];
      const num2 = gameNums[idx];
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
      setSelectedNumberIdx(idx);
      setSelectedOpIdx(null);
      setGameNums((prevNums) => {
        const newNums = [...prevNums];
        newNums[idx] = result;
        newNums[selectedNumberIdx] = "" as any;
        return newNums;
      });
      setGameHistory((prevHistory) => [...prevHistory, gameNums]);
    } else if (gameNums[idx] !== "") {
      setSelectedNumberIdx(idx);
    }
  };

  const handleOpClick = (idx: number): void => {
    setSelectedOpIdx(idx);
  };

  const handleResetClick = (): void => {
    setGameNums(originalGameNums);
    setSelectedNumberIdx(null);
    setSelectedOpIdx(null);
    setGameHistory([]);
  };

  const handleUndoClick = (): void => {
    if (gameHistory.length > 0) {
      const prevGameNums = gameHistory[gameHistory.length - 1];
      setGameNums(prevGameNums);
      setGameHistory((prevHistory) => prevHistory.slice(0, -1));
      setSelectedNumberIdx(null);
      setSelectedOpIdx(null);
    }
  };

  const handleNewPuzzleClick = (): void => {
    setShowSolvedModal(false);
    const newNums = getRandomPuzzle(difficulty);
    const newGameNums = newNums.map((num) => new Fraction(num));

    setGameNums(newGameNums);
    setOriginalGameNums(newGameNums);
    setSelectedNumberIdx(null);
    setSelectedOpIdx(null);
    setGameHistory([]);
  };

  const handleHintClick = (): void => {
    // TODO: Implement hint functionality
    console.log("Hint clicked");
  };

  const handleDifficultyChange = (value: string): void => {
    const newDifficulty = parseInt(value, 10);
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      handleNewPuzzleClick();
    }
  };

  return (
    <div className="flex flex-col items-center h-screen w-full mt-5">
      <div
        className="rotate-45 grow grid grid-cols-2 gap-4 m-10 aspect-square mt-10"
        style={{
          maxWidth: "35vh",
          maxHeight: "35vh",
        }}
        ref={numberButtonsRef}
      >
        {gameNums.map((num, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center p-2 rounded-full text-6xl border aspect-square min-w-[100px] ${
              selectedNumberIdx === idx ? "bg-blue-200" : "bg-gray-200"
            }`}
            style={{
              transform: `rotate(${rotationAngles[idx]}deg)`,
            }}
            onClick={() => handleNumberClick(idx)}
          >
            <p
              className={`flex items-center justify-center font-mono overflow-hidden select-none ${
                num === "" && "invisible"
              }`}
            >
              {num === "" ? "_" : num.toFraction()}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 m-3" ref={opButtonsRef}>
        {operations.map((op, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center p-4 rounded-md text-4xl border aspect-square ${
              selectedOpIdx === idx ? "bg-blue-200" : "bg-gray-200"
            }`}
            onClick={() => handleOpClick(idx)}
          >
            {op}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 m-3">
        <button onClick={() => setShowSettingsModal(true)}>Settings</button>
        <button onClick={handleResetClick}>Reset</button>
        <button onClick={handleUndoClick}>Undo</button>
        <button onClick={handleHintClick}>Hint</button>
        <button onClick={handleNewPuzzleClick}>New Puzzle</button>
      </div>
      {showSolvedModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => handleNewPuzzleClick()}
          ></div>
          <div className="bg-white p-8 rounded-lg z-10">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p>You have won the game!</p>
            <button className="mt-4" onClick={handleNewPuzzleClick}>
              Play again
            </button>
          </div>
        </div>
      )}
      {showSettingsModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => setShowSettingsModal(false)}
          ></div>
          <div className="bg-white p-8 rounded-lg z-10">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <button
                className="text-gray-600 p-1 mb-4"
                onClick={() => setShowSettingsModal(false)}
              >
                X
              </button>
            </div>
            <div className="flex flex-row justify-between">
              <label className="mr-2" htmlFor="difficulty">
                Difficulty:
              </label>
              <select
                name="difficulty"
                id="difficulty"
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
              >
                <option value={0}>Easy</option>
                <option value={1}>Medium</option>
                <option value={2}>Hard</option>
                <option value={3}>Extreme</option>
              </select>
            </div>
            <div className="flex flex-row justify-between">
              <label className="mr-2" htmlFor="randomness">
                Randomness:
              </label>
              <input
                className="mr-4"
                type="checkbox"
                name="randomness"
                id="randomness"
                checked={randomness}
                onChange={(e) => setRandomness(e.target.checked)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
