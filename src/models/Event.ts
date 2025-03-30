import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IEvent extends Document {
  id: string; // Auto-generated GUID
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    country: string;
  };
  location: {
    longitude: number;
    latitude: number;
  };
  duration: number; // In hours
  difficultyLevel: number; // Levels (e.g., 1, 2, 3)
  organizer: string; // User GUID
  date: Date; // Date and time of the event
}

const EventSchema: Schema = new Schema({
  id: { type: String, default: uuidv4 }, // Auto-generate GUID
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  location: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  duration: { type: Number, required: true },
  difficultyLevel: { type: Number, required: true, min: 1, max: 3 },
  organizer: { type: String, required: true },
  date: { type: Date, required: true }, // Date and time combined
});

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);