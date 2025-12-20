"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", variant = "default" }) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const variantStyles = {
    default: {
      confirmBtn: "bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700",
      icon: "text-orange-400",
      iconBg: "bg-orange-500/10",
    },
    danger: {
      confirmBtn: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      icon: "text-red-400",
      iconBg: "bg-red-500/10",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-purple-500/30 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${currentVariant.icon}`} />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-base pt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <button onClick={handleCancel} className="flex-1 px-4 py-3 bg-card/50 hover:bg-accent/50 text-foreground rounded-lg font-semibold transition-all border border-border">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={`flex-1 px-4 py-3 ${currentVariant.confirmBtn} text-white rounded-lg font-semibold shadow-lg transition-all`}>
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
