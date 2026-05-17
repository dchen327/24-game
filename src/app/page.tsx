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

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { SettingsModal } from "@/components/settings-modal";
import { GameNum } from "@/types/game-types";
import { SolvedModal } from "@/components/solved-modal";
import { HintModal } from "@/components/hint-modal";
import { gameUtils, SolveStep } from "@/components/game-utils";

const DIFFICULTY_KEY = "game-difficulty";
const AUTOCOMPLETE_KEY = "game-autocomplete";
const RANDOM_PROB_KEY = "game-random-prob";
const VIBRATE_KEY = "game-vibrate";
const GAME_STATE_KEY = "game-state";
const TOTAL_SOLVED_KEY = "game-total-solved";
const FLAT_MODE_KEY = "game-flat-mode";

// Per-tile text rotations for flat / multiplayer mode. Each digit faces its
// own corner viewer (clockwise from top-left).
const FLAT_TILE_ROTATIONS = [
  "-rotate-45", // top-left tile -> top-left viewer
  "rotate-45", // top-right tile -> top-right viewer
  "-rotate-[135deg]", // bottom-left tile -> bottom-left viewer
  "rotate-[135deg]", // bottom-right tile -> bottom-right viewer
];

type SerializedGameNum = string | null;
type SerializedGameState = {
  gameNums: SerializedGameNum[];
  gameHistory: SerializedGameNum[][];
  solveSteps: string[];
  tempPuzzleDifficulty: number | null;
  // True once this specific puzzle has incremented the lifetime counter,
  // so undo/redo/relaunch doesn't double-count.
  puzzleCounted?: boolean;
};

const serializeNums = (nums: GameNum[]): SerializedGameNum[] =>
  nums.map((n) => (n ? n.toFraction() : null));

const deserializeNums = (nums: SerializedGameNum[]): GameNum[] =>
  nums.map((s) => (s ? new Fraction(s) : null));

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
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [totalSolved, setTotalSolved] = useState<number>(0);
  const [puzzleCounted, setPuzzleCounted] = useState<boolean>(false);
  const [flatMode, setFlatMode] = useState<boolean>(false);
  // Settings form
  const [difficultyForm, setDifficultyForm] = useState<number>(1);
  const [autocompleteForm, setAutocompleteForm] = useState<boolean>(true);
  const [randomProbForm, setRandomProbForm] = useState<number[]>([0.2]);
  const [vibrateForm, setVibrateForm] = useState<boolean>(true);
  const [flatModeForm, setFlatModeForm] = useState<boolean>(false);

  const vibrate = () => {
    if (vibrateEnabled) gameUtils.vibrate();
  };

  // True only on the first render after restoring saved game state, so the
  // "display new puzzle" effect doesn't immediately clobber the restored
  // gameNums/history with a fresh shuffle.
  const restoredFromStorage = useRef(false);

  // The two values to glow as a "show first two numbers" hint. Stored as
  // values (not indices) so that a shuffle, which rearranges tile positions
  // without removing any values, doesn't invalidate the hint — we just look
  // up where each value currently lives.
  const [hintPair, setHintPair] = useState<[Fraction, Fraction] | null>(null);
  // Index of the operation to highlight for a "show first operation" hint.
  const [hintOpIdx, setHintOpIdx] = useState<number | null>(null);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // Render-time derivation: where are the hinted values right now?
  // Returns null if either value has been combined away.
  const hintIndices: [number, number] | null = (() => {
    if (!hintPair) return null;
    const [valA, valB] = hintPair;
    const aIdx = gameNums.findIndex((n) => n !== null && n.equals(valA));
    if (aIdx === -1) return null;
    const bIdx = gameNums.findIndex(
      (n, i) => i !== aIdx && n !== null && n.equals(valB),
    );
    if (bIdx === -1) return null;
    return [aIdx, bIdx];
  })();

  // Load initial data: puzzles and stored difficulty
  useEffect(() => {
    const loadInitialData = () => {
      // Load puzzles
      const puzzles = puzzlesImport.map((puzzleSet) =>
        gameUtils.shuffle(
          puzzleSet.map((puzzle) =>
            puzzle.split(" ").map((num) => new Fraction(num)),
          ),
        ),
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
      const storedVibrate = localStorage.getItem(VIBRATE_KEY);
      if (storedVibrate !== null) {
        setVibrateEnabled(storedVibrate === "true");
      }
      const storedTotalSolved = localStorage.getItem(TOTAL_SOLVED_KEY);
      if (storedTotalSolved !== null) {
        const parsed = parseInt(storedTotalSolved, 10);
        if (!Number.isNaN(parsed)) setTotalSolved(parsed);
      }
      const storedFlatMode = localStorage.getItem(FLAT_MODE_KEY);
      if (storedFlatMode !== null) {
        setFlatMode(storedFlatMode === "true");
      }

      const storedGameState = localStorage.getItem(GAME_STATE_KEY);
      if (storedGameState !== null) {
        try {
          const parsed: SerializedGameState = JSON.parse(storedGameState);
          setGameNums(deserializeNums(parsed.gameNums));
          setGameHistory(parsed.gameHistory.map(deserializeNums));
          setSolveSteps(parsed.solveSteps);
          setTempPuzzleDifficulty(parsed.tempPuzzleDifficulty);
          setPuzzleCounted(parsed.puzzleCounted === true);
          restoredFromStorage.current = true;
        } catch {
          // corrupt entry — fall back to the normal fresh-puzzle flow
        }
      }

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Display new puzzle
  useEffect(() => {
    if (loading) return;
    if (restoredFromStorage.current) {
      restoredFromStorage.current = false;
      return;
    }
    const currDifficulty = tempPuzzleDifficulty ?? difficulty;
    const gameNums = gameUtils.shuffle(
      puzzles[currDifficulty][puzzleIdxs[currDifficulty]],
    );
    setGameNums(gameNums);
    setGameHistory([gameNums]);
    setHintPair(null);
    setHintOpIdx(null);
    setPuzzleCounted(false);
  }, [difficulty, puzzleIdxs, puzzles, loading, tempPuzzleDifficulty]);

  // Persist current game state so the same puzzle (and any in-progress work)
  // is restored when Android kills and relaunches the PWA process.
  useEffect(() => {
    if (loading) return;
    const payload: SerializedGameState = {
      gameNums: serializeNums(gameNums),
      gameHistory: gameHistory.map(serializeNums),
      solveSteps,
      tempPuzzleDifficulty,
      puzzleCounted,
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(payload));
  }, [
    gameNums,
    gameHistory,
    solveSteps,
    tempPuzzleDifficulty,
    puzzleCounted,
    loading,
  ]);

  // Persist the lifetime solved counter independently.
  useEffect(() => {
    if (loading) return;
    localStorage.setItem(TOTAL_SOLVED_KEY, String(totalSolved));
  }, [totalSolved, loading]);

  // Check if solved
  useEffect(() => {
    const markSolved = () => {
      setShowSolvedModal(true);
      if (!puzzleCounted) {
        setPuzzleCounted(true);
        setTotalSolved((prev) => prev + 1);
      }
    };

    if (
      gameNums.filter((num) => num !== null).length === 1 &&
      gameNums.some((num) => num?.valueOf() === 24)
    ) {
      markSolved();
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
        markSolved();
      }
    }
  }, [autocomplete, gameNums, puzzleCounted]);

  const handleOutsideClick = () => {
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
  };

  const handleNumClick = (index: number) => {
    vibrate();
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
    vibrate();
    setSelectedOpIdx(index === selectedOpIdx ? null : index);
  };

  const handleUndoClick = () => {
    vibrate();
    if (gameHistory.length === 0) return;
    const prevGameNums = gameHistory[gameHistory.length - 1];
    setGameNums(prevGameNums);
    setGameHistory((prevHistory) => prevHistory.slice(0, -1));
    setSolveSteps((prevSteps) => prevSteps.slice(0, -1));
    setSelectedNumIdx(null);
    setSelectedOpIdx(null);
  };

  const handleNewPuzzleClick = (): void => {
    vibrate();
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
    vibrate();
    // Pressing Hint again while a hint is already showing is a no-op.
    if (hintIndices !== null || hintOpIdx !== null) return;
    // Hint is only meaningful before the user has taken any steps; otherwise
    // "first step" semantics no longer apply.
    if (gameHistory.length > 1) {
      toast("Hint only works before any steps are taken.");
      return;
    }
    setShowHintModal(true);
  };

  const getFirstStep = (): SolveStep | null => {
    const nums = gameNums.filter((n): n is Fraction => n !== null);
    const solution = gameUtils.solve(nums);
    if (!solution || solution.length === 0) return null;
    return solution[0];
  };

  const handleHintShowOperation = () => {
    vibrate();
    const step = getFirstStep();
    setShowHintModal(false);
    if (!step) return;
    const opIdx = operations.indexOf(step.op);
    if (opIdx === -1) return;
    setHintOpIdx(opIdx);
  };

  const handleHintShowPair = () => {
    vibrate();
    const step = getFirstStep();
    setShowHintModal(false);
    if (!step) return;
    setHintPair([step.a, step.b]);
  };

  const handleOpenSettingsModal = () => {
    vibrate();
    setDifficultyForm(difficulty);
    setAutocompleteForm(autocomplete);
    setRandomProbForm([randomProb]);
    setVibrateForm(vibrateEnabled);
    setFlatModeForm(flatMode);
    setShowSettingsModal(true);
  };

  const handleSaveSettingsClick = () => {
    setDifficulty(difficultyForm);
    setAutocomplete(autocompleteForm);
    setRandomProb(randomProbForm[0]);
    setVibrateEnabled(vibrateForm);
    setFlatMode(flatModeForm);
    localStorage.setItem(DIFFICULTY_KEY, difficultyForm.toString());
    localStorage.setItem(AUTOCOMPLETE_KEY, autocompleteForm.toString());
    localStorage.setItem(RANDOM_PROB_KEY, randomProbForm[0].toString());
    localStorage.setItem(VIBRATE_KEY, vibrateForm.toString());
    localStorage.setItem(FLAT_MODE_KEY, flatModeForm.toString());
    setShowSettingsModal(false);
  };

  const handleShuffleClick = () => {
    vibrate();
    const maxAttempts = 10; // Limit the number of shuffle attempts
    let shuffledNums = [...gameNums];
    let attempts = 0;

    const areArraysEqual = (arr1: GameNum[], arr2: GameNum[]) => {
      return (
        arr1.length === arr2.length &&
        arr1.every(
          (num, index) => num?.toFraction() === arr2[index]?.toFraction(),
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
        <div className="w-12 flex items-center justify-start text-xl font-medium tabular-nums">
          {loading ? "" : totalSolved}
        </div>
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
          className="relative grid grid-cols-2 gap-4 w-full max-w-md px-4 mx-4 "
          onClick={(e) => e.stopPropagation()}
        >
          {flatMode && (
            <>
              {/* Center diamond - each edge sits under one digit as a baseline */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-1/4 aspect-square bg-white border-[2px] border-gray-300 rounded-md shadow-sm"
              />
            </>
          )}
          {gameNums.map((num, index) => {
            const isSelected =
              selectededNumIdx === index && gameNums[index] !== null;
            const isHinted =
              !isSelected &&
              hintIndices !== null &&
              (hintIndices[0] === index || hintIndices[1] === index);
            return (
              <button
                key={index}
                className={`aspect-square rounded-2xl flex items-center justify-center text-7xl font-medium ${
                  isSelected
                    ? "bg-blue-100 border-2 border-gray-600"
                    : isHinted
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : "bg-gray-100"
                }`}
                onClick={() => handleNumClick(index)}
              >
                <span
                  className={
                    flatMode ? `inline-block ${FLAT_TILE_ROTATIONS[index]}` : ""
                  }
                >
                  {num?.toFraction()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Operation Buttons */}
        <div
          className="grid grid-cols-4 gap-0 mx-4 my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {operations.map((op, index) => {
            const isOpSelected = selectedOpIdx === index;
            const isOpHinted = !isOpSelected && hintOpIdx === index;
            return (
              <button
                key={index}
                className={`text-5xl pb-12 pt-16 px-10 flex items-center justify-center max-w-28 max-h-28 ${
                  isOpSelected
                    ? "after:absolute after:w-16 after:h-16 after:border-2 after:border-gray-600 after:rounded-full"
                    : isOpHinted
                      ? "after:absolute after:w-16 after:h-16 after:border-2 after:border-yellow-400 after:rounded-full"
                      : ""
                }`}
                onClick={() => handleOpClick(index)}
              >
                {op}
              </button>
            );
          })}
        </div>
      </div>
      {/* Bottom Toolbar */}
      <div className="w-full">
        <div className="max-w-md mx-auto py-4 bg-gray-50 rounded-xl">
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
        vibrateForm={vibrateForm}
        setVibrateForm={setVibrateForm}
        flatModeForm={flatModeForm}
        setFlatModeForm={setFlatModeForm}
        handleSaveSettingsClick={handleSaveSettingsClick}
      />
      <HintModal
        open={showHintModal}
        onOpenChange={setShowHintModal}
        onChooseOperation={handleHintShowOperation}
        onChoosePair={handleHintShowPair}
      />
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2500, style: { fontSize: "1rem" } }}
      />
    </div>
  );
}
