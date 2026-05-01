import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface BreakReasonDialogProps {
  open: boolean;
  activityName: string;
  streakLength: number;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function BreakReasonDialog({
  open,
  activityName,
  streakLength,
  onConfirm,
  onCancel,
}: BreakReasonDialogProps) {
  const [reason, setReason] = useState("");
  const isValid = reason.trim().length >= 5;

  function handleConfirm() {
    if (!isValid) return;
    onConfirm(reason.trim());
    setReason("");
  }

  function handleCancel() {
    setReason("");
    onCancel();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent
        className="max-w-md border-border bg-card"
        data-ocid="break_reason.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            An act of honesty
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Recording your reason is an act of integrity, not failure.
            <br />
            <span className="text-foreground/70">
              {activityName} · {streakLength} day streak
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            data-ocid="break_reason.textarea"
            placeholder="What brought you to this moment?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none bg-background border-input focus-visible:ring-ring placeholder:text-muted-foreground/60"
          />
          {reason.length > 0 && reason.trim().length < 5 && (
            <p
              className="text-destructive text-xs mt-1"
              data-ocid="break_reason.field_error"
            >
              Please write at least a few words.
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            data-ocid="break_reason.cancel_button"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid}
            data-ocid="break_reason.confirm_button"
            className="flex-1"
          >
            Reset Streak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
