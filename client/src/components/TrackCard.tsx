import { useState } from "react";
import { Track } from "@shared/schema";
import { AudioPlayer } from "./AudioPlayer";
import { useDeleteTrack } from "@/hooks/use-tracks";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TrackCard({ track }: { track: Track }) {
  const [expanded, setExpanded] = useState(false);
  const { mutate: deleteTrack, isPending: isDeleting } = useDeleteTrack();
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500";
      case "processing": return "text-blue-500";
      case "failed": return "text-destructive";
      default: return "text-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "processing": return <Loader2 className="w-4 h-4 animate-spin" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return t("status_completed");
      case "processing": return t("status_processing");
      case "failed": return t("status_failed");
      case "pending": return t("status_pending");
      default: return status;
    }
  };

  const getProgressStatusText = (progress: number) => {
    if (progress < 25) return t("status_uploading");
    if (progress < 60) return t("status_splitting");
    if (progress < 95) return t("status_applying");
    return t("status_ready");
  };

  return (
    <motion.div 
      layout
      className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-lg hover:border-border transition-colors duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-xl font-bold text-foreground truncate">{track.title}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`flex items-center gap-1.5 text-sm font-medium ${getStatusColor(track.status)}`}>
                {getStatusIcon(track.status)}
                {getStatusText(track.status)}
              </span>
            </div>
            {track.status === 'processing' && (
              <div className="mt-3 space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs font-medium text-primary">{getProgressStatusText(progress)}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("delete_track")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("delete_confirmation")} "{track.title}" {t("delete_and_stems")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteTrack(track.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    {isDeleting ? t("deleting") : t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="bg-secondary/20 hover:bg-secondary/40 border-transparent"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(expanded || track.status === 'completed') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-black/20"
          >
            <div className="p-6">
              {track.error ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{t("error_processing")}</p>
                    <p className="text-xs opacity-75 mt-1">{track.error}</p>
                  </div>
                </div>
              ) : (
                <AudioPlayer 
                  originalUrl={track.originalUrl}
                  vocalsUrl={track.vocalsUrl}
                  instrumentalUrl={track.instrumentalUrl}
                  status={track.status as any}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
