import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, Zap, Music, Scissors, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioEditorProps {
  audioUrl: string;
}

export function AudioEditor({ audioUrl }: AudioEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setTrimEnd(audio.duration);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, speed]);

  const downloadEdited = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/process-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl,
          volume,
          speed,
          pitch,
          trimStart,
          trimEnd,
        }),
      });

      if (!response.ok) throw new Error("Processing failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Safi-Processed-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Please try again - حدث خطأ ما، يرجى المحاولة مرة أخرى");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border p-6 space-y-6">
      <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />

      <div>
        <h3 className="text-lg font-semibold mb-1">Safi Smart Editor</h3>
        <p className="text-sm text-muted-foreground">Professional AI adjustments for your audio</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="w-4 h-4 text-accent" />
          Volume: {Math.round(volume * 100)}%
        </label>
        <Slider value={[volume]} max={2} step={0.05} onValueChange={(val) => setVolume(val[0])} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4 text-primary" />
          Speed: {speed.toFixed(2)}x
        </label>
        <Slider value={[speed]} min={0.5} max={2} step={0.1} onValueChange={(val) => setSpeed(val[0])} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Music className="w-4 h-4 text-primary" />
          Pitch: {pitch > 1 ? '+' : ''}{Math.round((pitch - 1) * 100)}%
        </label>
        <Slider value={[pitch]} min={0.5} max={2} step={0.1} onValueChange={(val) => setPitch(val[0])} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Scissors className="w-4 h-4 text-destructive" />
          Trim: {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
        </label>
        <div className="space-y-3">
          <Slider value={[trimStart]} max={duration} step={0.1} onValueChange={(val) => setTrimStart(Math.min(val[0], trimEnd - 0.5))} />
          <Slider value={[trimEnd]} max={duration} step={0.1} onValueChange={(val) => setTrimEnd(Math.max(val[0], trimStart + 0.5))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = trimStart;
            audioRef.current.play();
          }
        }}>
          Preview
        </Button>
        <Button variant="default" onClick={downloadEdited} disabled={isProcessing}>
          <Download className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Export"}
        </Button>
      </div>

      <div className="text-center py-2">
         {navigator.language.startsWith('ar') ? (
           <p className="text-sm font-medium text-primary animate-pulse italic">صلي على النبي ﷺ</p>
         ) : (
           <p className="text-[11px] font-medium text-primary animate-pulse italic">Pray for the Prophet ﷺ</p>
         )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
        <p className="text-xs font-medium text-primary">Tips:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          <li>• Adjust speed to slow down vocals for karaoke</li>
          <li>• Use pitch to match key with other tracks</li>
          <li>• Trim unwanted sections and boost volume</li>
        </ul>
      </div>
    </div>
  );
}
