import React, { useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  isLoading?: boolean;
  errorText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  isLoading = false,
  errorText,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {description && <p className="text-sm text-slate-300">{description}</p>}
        {errorText && <p className="text-xs text-rose-400">{errorText}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onCancel} size="md">
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            size="md"
            disabled={isLoading}
            className={danger ? "bg-rose-600 hover:bg-rose-500" : ""}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
