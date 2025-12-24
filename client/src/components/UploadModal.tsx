import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, Loader2, X } from "lucide-react";
import { useUploadTrack } from "@/hooks/use-tracks";
import { motion, AnimatePresence } from "framer-motion";

export function UploadModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUploadTrack();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-fill title with filename (without extension)
      const name = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith("audio/")) {
        setFile(selectedFile);
        const name = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    mutate({ file, title }, {
      onSuccess: () => {
        setOpen(false);
        setFile(null);
        setTitle("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
          <Upload className="mr-2 h-5 w-5" />
          Upload Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Upload Audio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div 
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
              ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
            `}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                    <Music className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setTitle("");
                    }}
                  >
                    Remove
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground">MP3, WAV up to 10MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input 
              id="title" 
              placeholder="Enter track name..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!file || !title || isPending}
              className="bg-primary hover:bg-primary/90 min-w-[100px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
