import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function DonationModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const donationLinks = [
    {
      name: "Buy Me a Coffee",
      url: "https://buymeacoffee.com",
      color: "bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black",
    },
    {
      name: "PayPal",
      url: "https://paypal.com",
      color: "bg-[#003087] hover:bg-[#003087]/90 text-white",
    },
    {
      name: "Ko-fi",
      url: "https://ko-fi.com",
      color: "bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-accent/30 hover:border-accent/50 hover:text-accent"
        >
          <Heart className="w-4 h-4" />
          {t("donation")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            {t("support_development")}
          </DialogTitle>
          <DialogDescription>
            {t("donation_description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-6">
          {donationLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full px-4 py-3 rounded-lg font-medium text-center transition-all hover:scale-105 ${link.color}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">{t("why_donate")}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t("maintain_server")}</li>
            <li>• {t("develop_features")}</li>
            <li>• {t("improve_performance")}</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
