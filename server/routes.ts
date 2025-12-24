import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import Replicate from "replicate";
import express from "express";

const execAsync = promisify(exec);

// Supported audio and video formats
const SUPPORTED_FORMATS = {
  audio: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma'],
  video: ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'wmv']
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for video support
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const isSupported = SUPPORTED_FORMATS.audio.includes(ext) || SUPPORTED_FORMATS.video.includes(ext);
    
    if (isSupported) {
      cb(null, true);
    } else {
      cb(new Error(`File format .${ext} is not supported. Please upload audio (MP3, WAV, FLAC, M4A, AAC) or video (MP4, MKV, MOV) files.`));
    }
  }
});

// Convert video/audio to WAV using FFmpeg
async function convertToWav(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace(/\.[^.]+$/, '.wav');
  
  try {
    await execAsync(`ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 44100 -ac 2 "${outputPath}" -y`, {
      timeout: 120000, // 2 minute timeout
      maxBuffer: 50 * 1024 * 1024
    });
    
    // Delete original file after conversion
    fs.unlink(inputPath, (err) => {
      if (err) console.error(`Failed to delete original file ${inputPath}:`, err);
    });
    
    return outputPath;
  } catch (error) {
    console.error('FFmpeg conversion error:', error);
    // If conversion fails, return original path and let Replicate handle it
    return inputPath;
  }
}

// Cleanup function for old files
function startCleanupInterval() {
  setInterval(() => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) return;

    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error("Error reading uploads directory:", err);
        return;
      }

      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) return;

          // Delete files older than 10 minutes
          if (now - stats.mtimeMs > tenMinutesMs) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Failed to delete file ${file}:`, unlinkErr);
              } else {
                console.log(`Cleaned up old file: ${file}`);
              }
            });
          }
        });
      });
    });
  }, 60000); // Check every minute
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start cleanup interval on initialization
  startCleanupInterval();

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get(api.tracks.list.path, async (req, res) => {
    const tracks = await storage.getTracks();
    res.json(tracks);
  });

  app.get(api.tracks.get.path, async (req, res) => {
    const track = await storage.getTrack(Number(req.params.id));
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.json(track);
  });

  app.post(api.tracks.create.path, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Create track entry
      const track = await storage.createTrack({
        title: req.file.originalname,
        originalUrl: `/uploads/${req.file.filename}`,
        status: 'processing'
      });

      // Trigger Replicate processing in background
      processAudio(track.id, req.file.path).catch(console.error);

      res.status(201).json(track);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: "Upload failed. Please try again" });
    }
  });

  app.delete(api.tracks.delete.path, async (req, res) => {
    await storage.deleteTrack(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}

async function processAudio(trackId: number, filePath: string) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is missing");
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    let processPath = filePath;
    const ext = path.extname(filePath).toLowerCase().slice(1);
    
    // Convert to WAV if it's a video or non-mp3
    if (SUPPORTED_FORMATS.video.includes(ext) || (SUPPORTED_FORMATS.audio.includes(ext) && ext !== 'mp3')) {
      processPath = await convertToWav(filePath);
    }

    const fileBuffer = fs.readFileSync(processPath);
    const base64Audio = `data:audio/wav;base64,${fileBuffer.toString('base64')}`;
    
    const output = await replicate.run(
      "lucataco/isolate-vocals:7337965761899986348ef11352e82110757d9036a445582f6e9e436214f447f5",
      {
        input: {
          audio: base64Audio
        }
      }
    ) as any;

    // Smart check for output URLs
    const vUrl = output.vocals || (Array.isArray(output) ? output[0] : null);
    const iUrl = output.instrumental || output.accompaniment || (Array.isArray(output) ? output[1] : null);

    if (vUrl) {
      await storage.updateTrack(trackId, {
        status: 'completed',
        vocalsUrl: vUrl,
        instrumentalUrl: iUrl
      });
    } else {
      throw new Error("No output from AI");
    }

  } catch (error: any) {
    console.error('Replicate error:', error);
    await storage.updateTrack(trackId, {
      status: 'failed',
      error: 'Processing failed. Please try again'
    });
  }
}
