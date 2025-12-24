import { db } from "./db";
import { tracks, type Track, type InsertTrack } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack & { originalUrl: string }): Promise<Track>;
  updateTrack(id: number, updates: Partial<Track>): Promise<Track>;
  deleteTrack(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTracks(): Promise<Track[]> {
    return await db.select().from(tracks).orderBy(tracks.createdAt);
  }

  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

  async createTrack(track: InsertTrack & { originalUrl: string }): Promise<Track> {
    const [newTrack] = await db.insert(tracks).values(track).returning();
    return newTrack;
  }

  async updateTrack(id: number, updates: Partial<Track>): Promise<Track> {
    const [updated] = await db
      .update(tracks)
      .set(updates)
      .where(eq(tracks.id, id))
      .returning();
    return updated;
  }

  async deleteTrack(id: number): Promise<void> {
    await db.delete(tracks).where(eq(tracks.id, id));
  }
}

export const storage = new DatabaseStorage();
