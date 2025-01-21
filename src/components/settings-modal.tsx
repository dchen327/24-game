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

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempDifficultyForm: number;
  setTempDifficultyForm: (value: number) => void;
  autocomplete: boolean;
  setAutocomplete: (value: boolean) => void;
  handleSaveSettingsClick: () => void;
};

export function SettingsModal({
  open,
  onOpenChange,
  tempDifficultyForm,
  setTempDifficultyForm,
  autocomplete,
  setAutocomplete,
  handleSaveSettingsClick,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="difficulty" className="font-semibold text-xl">
              Difficulty:
            </Label>
            <Select
              value={tempDifficultyForm.toString()}
              onValueChange={(value) => setTempDifficultyForm(Number(value))}
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
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="autocomplete" className="font-semibold text-xl">
              Autocomplete:
            </Label>
            <div className="flex justify-end">
              <Checkbox
                id="autocomplete"
                checked={autocomplete}
                onCheckedChange={setAutocomplete}
                aria-label="Toggle autocomplete"
                className="scale-125"
              />
            </div>
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
