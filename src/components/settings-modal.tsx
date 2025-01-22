import {
  Dialog,
  DialogContent,
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
import { Checkbox } from "./ui/checkbox";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Slider } from "./ui/slider";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  difficultyForm: number;
  setDifficultyForm: (value: number) => void;
  autocompleteForm: boolean;
  setAutocompleteForm: (value: boolean) => void;
  randomProbForm: number[];
  setRandomProbForm: (value: number[]) => void;
  handleSaveSettingsClick: () => void;
};

export function SettingsModal({
  open,
  onOpenChange,
  difficultyForm,
  setDifficultyForm,
  autocompleteForm,
  setAutocompleteForm,
  randomProbForm,
  setRandomProbForm,
  handleSaveSettingsClick,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div className="grid gap-4 py-4 mb-2">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="difficulty" className="font-semibold text-xl">
              Difficulty:
            </Label>
            <Select
              value={difficultyForm.toString()}
              onValueChange={(value) => setDifficultyForm(Number(value))}
            >
              <SelectTrigger className="text-xl">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" className="text-xl py-3">
                  Easy
                </SelectItem>
                <SelectItem value="1" className="text-xl py-3">
                  Medium
                </SelectItem>
                <SelectItem value="2" className="text-xl py-3">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label
              htmlFor="autocomplete"
              className="col-span-2 font-semibold text-xl"
            >
              Autocomplete:
            </Label>
            <div className="flex justify-end">
              <Checkbox
                id="autocomplete"
                checked={autocompleteForm}
                onCheckedChange={setAutocompleteForm}
                aria-label="Toggle autocomplete"
                className="scale-125"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label
              htmlFor="randomProb"
              className="col-span-2 font-semibold text-xl"
            >
              Random Probability:
            </Label>
            <div className="text-xl text-right">{randomProbForm[0]}</div>
            <Slider
              id="randomProb"
              value={randomProbForm}
              onValueChange={setRandomProbForm}
              min={0}
              max={1}
              step={0.1}
              className="col-span-3 w-full"
            />
          </div>
        </div>
        <Button
          onClick={handleSaveSettingsClick}
          className="bg-blue-500 text-xl hover:bg-blue-600 py-7"
        >
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
