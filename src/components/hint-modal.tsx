import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type HintModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseOperation: () => void;
  onChoosePair: () => void;
};

export function HintModal({
  open,
  onOpenChange,
  onChooseOperation,
  onChoosePair,
}: HintModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Hint</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div className="grid gap-3 py-2">
          <Button
            onClick={onChooseOperation}
            variant="outline"
            className="text-lg sm:text-xl py-6"
          >
            Show first operation
          </Button>
          <Button
            onClick={onChoosePair}
            variant="outline"
            className="text-lg sm:text-xl py-6"
          >
            Show first two numbers
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
