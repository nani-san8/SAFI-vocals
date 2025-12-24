import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  originalUrl: text("original_url").notNull(),
  vocalsUrl: text("vocals_url"),
  instrumentalUrl: text("instrumental_url"),
  replicateId: text("replicate_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  vocalsUrl: true,
  instrumentalUrl: true,
  replicateId: true,
  error: true
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
