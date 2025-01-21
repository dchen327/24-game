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

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempDifficultyForm: number;
  setTempDifficultyForm: (value: number) => void;
  handleSaveSettingsClick: () => void;
};

export function SettingsModal({
  open,
  onOpenChange,
  tempDifficultyForm,
  setTempDifficultyForm,
  handleSaveSettingsClick,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
