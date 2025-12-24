import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Mic, Music2, Sliders, Headphones } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AudioEditor } from "./AudioEditor";

interface AudioPlayerProps {
  originalUrl: string;
  vocalsUrl: string | null;
  instrumentalUrl: string | null;
  status: "pending" | "processing" | "completed" | "failed";
}

type AudioMode = "original" | "vocals" | "instrumental" | "clean_vocals";

interface AudioDevice {
  id: string;
  label: string;
}

export function AudioPlayer({ originalUrl, vocalsUrl, instrumentalUrl, status }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<AudioMode>("original");
  const [mode, setMode] = useState<"player" | "editor">("player");
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("default");

  const audioRef = useRef<HTMLAudioElement>(null);

  // Determine which source to play
  const currentSrc = 
    (activeTrack === "vocals" || activeTrack === "clean_vocals") && vocalsUrl ? vocalsUrl :
    activeTrack === "instrumental" && instrumentalUrl ? instrumentalUrl :
    originalUrl;

  // Enumerate audio output devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices
          .filter((device) => device.kind === "audiooutput")
          .map((device) => ({
            id: device.deviceId,
            label: device.label || `Audio Output ${device.deviceId.slice(0, 5)}`,
          }));
        
        if (audioOutputs.length > 0) {
          setAudioDevices(audioOutputs);
        }
      } catch (error) {
        console.error("Error enumerating audio devices:", error);
      }
    };

    enumerateDevices();
    navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
    return () => navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
  }, []);

  // Handle device change
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (audioRef.current && "setSinkId" in audioRef.current) {
      try {
        await (audioRef.current as any).setSinkId(deviceId);
      } catch (error) {
        console.error("Error setting audio sink:", error);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Sync playback position when switching tracks
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Remember current time and playing state
    const wasPlaying = !audio.paused;
    const time = audio.currentTime;
    
    // Changing src happens automatically via the <audio src={currentSrc}> prop
    // But we need to restore state after it loads
    const restoreState = () => {
      audio.currentTime = time;
      if (wasPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    // Need a small timeout or event listener to wait for load
    audio.addEventListener('loadeddata', restoreState, { once: true });
    
  }, [currentSrc]);

  const getTrackButtonColor = (track: AudioMode) => {
    return activeTrack === track ? "bg-primary/20 border-primary" : "bg-secondary/10 hover:bg-secondary/20";
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (status !== "completed") {
    return (
      <div className="w-full h-48 bg-muted/20 rounded-xl border border-border/50 flex flex-col items-center justify-center text-muted-foreground">
        <Music2 className="w-12 h-12 mb-4 opacity-50" />
        <p>Audio controls available when processing completes</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-xl border border-border p-6 shadow-xl shadow-black/20">
      <audio ref={audioRef} src={currentSrc} />

      {/* Mode Tabs & Device Selector */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-border/50 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("player")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              mode === "player"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Player
          </button>
          <button
            onClick={() => setMode("editor")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              mode === "editor"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Audio Device Selector */}
        {audioDevices.length > 0 && (
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select output device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Device</SelectItem>
                {audioDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Editor Mode */}
      {mode === "editor" && (
        <AudioEditor audioUrl={currentSrc} />
      )}

      {/* Player Mode */}
      {mode === "player" && (
        <>
      {/* Stem Switcher */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTrack("original")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTrack === "original" 
              ? "bg-secondary text-foreground shadow-lg shadow-black/20" 
              : "text-muted-foreground hover:bg-secondary/50"
          )}
        >
          Original Mix
        </button>
        <button
          onClick={() => setActiveTrack("vocals")}
          disabled={!vocalsUrl}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
            activeTrack === "vocals" 
              ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
              : "text-muted-foreground hover:bg-secondary/50",
            !vocalsUrl && "opacity-50 cursor-not-allowed"
          )}
        >
          <Mic className="w-4 h-4" />
          Vocals Only
        </button>
        <button
          onClick={() => setActiveTrack("instrumental")}
          disabled={!instrumentalUrl}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
            activeTrack === "instrumental" 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-muted-foreground hover:bg-secondary/50",
            !instrumentalUrl && "opacity-50 cursor-not-allowed"
          )}
        >
          <Music2 className="w-4 h-4" />
          Instrumental
        </button>
        <button
          onClick={() => setActiveTrack("clean_vocals")}
          disabled={!vocalsUrl}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
            activeTrack === "clean_vocals" 
              ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
              : "text-muted-foreground hover:bg-secondary/50",
            !vocalsUrl && "opacity-50 cursor-not-allowed"
          )}
        >
          <Mic className="w-4 h-4" />
          Clean Vocals (No Music)
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2 w-1/4 group">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime -= 10;
            }}
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-white/10"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime += 10;
            }}
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Placeholder for balance/other controls */}
        <div className="w-1/4 flex justify-end">
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${activeTrack === 'original' ? 'bg-secondary text-muted-foreground' : ''}
            ${activeTrack === 'vocals' ? 'bg-accent/10 text-accent' : ''}
            ${activeTrack === 'instrumental' ? 'bg-primary/10 text-primary' : ''}
          `}>
            {activeTrack}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
