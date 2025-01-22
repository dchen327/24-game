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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <InfoIcon className="h-5 w-5" />
                    <span className="sr-only">Autocomplete Info</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full border border-black p-2">
                  <p>Autocomplete last step</p>
                </PopoverContent>
              </Popover>
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
            <div className="col-span-2 flex items-center gap-2">
              <Label htmlFor="randomProb" className="font-semibold text-xl">
                Random Probability:
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <InfoIcon className="h-5 w-5" />
                      <span className="sr-only">Random Probability Info</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full border border-black p-2">
                    <p>Probability of getting an easier problem</p>
                  </PopoverContent>
                </Popover>
              </Label>
            </div>
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
