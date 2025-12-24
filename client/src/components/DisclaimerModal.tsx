import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function DisclaimerModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t("terms_and_disclaimer")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            {t("disclaimer")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 space-y-4">
          <p className="text-sm leading-relaxed text-foreground">
            {t("disclaimer_text")}
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} variant="default">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
