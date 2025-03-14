import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GameNum } from "@/types/game-types";

type SolvedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameHistory: GameNum[][];
  difficulty: string;
  solveSteps: string[];
  handleNewPuzzleClick: () => void;
};

export function SolvedModal({
  open,
  onOpenChange,
  gameHistory,
  difficulty,
  solveSteps,
  handleNewPuzzleClick,
}: SolvedModalProps) {
  const parseEquation = (step: string) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={handleNewPuzzleClick}
        className="max-h-screen"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Congratulations!</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div className="text-center text-xl font-normal">
          Actual Difficulty: {difficulty}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 mx-10 max-h-[25vh]">
          <div className="grid grid-cols-2 gap-4 min-w-[250px]">
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
            className="bg-blue-500 text-xl hover:bg-blue-600 py-7"
            onClick={handleNewPuzzleClick}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
