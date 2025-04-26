import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICategory } from "./Category";

export interface IEvent extends Document {
  category: mongoose.Schema.Types.ObjectId | ICategory; // Category identifier
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

const EventSchema: Schema = new Schema<IEvent>({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
    select: "name description imageURL"  
  }, // Category identifier
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

export async function findSportsInterestsByCity(city:any) {
  const events = await EventModel.find({"address.city":city});
  if (events.length===0) {
    throw new Error("Events not found");
  }
  return events; // Return the city of the found user
}
export async function getAllEvents() {
  const events = await EventModel.find().populate('category');
  if (events.length===0) {
    throw new Error("Events not found");
  }
  return events;
}
export const EventModel = mongoose.model<IEvent>("Event", EventSchema);
