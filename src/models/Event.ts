import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IPeriodicInfo {
  startDate: Date; // When the event series starts
  endDate?: Date; // Optional, for events that have a defined end date
  recurrence: {
    frequency: "daily" | "weekly" | "monthly"; // Frequency of recurrence
    interval: number; // Interval between recurrences (e.g., every 2 weeks)
    dayOfTheWeek?: string[]; // Applicable for weekly events (e.g., ["Monday", "Wednesday"])
    dayOfMonth?: number[]; // Applicable for monthly events (e.g., [1, 15])
  };
}

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
  periodicInfo?: IPeriodicInfo; // Optional, for periodic events
  duration: number; // In hours
  difficultyLevel: number; // Levels (e.g., 1, 2, 3)
  organizer: string; // User GUID
}

const PeriodicInfoSchema: Schema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  recurrence: {
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    interval: { type: Number, required: true },
    dayOfTheWeek: { type: [String], default: [] },
    dayOfMonth: { type: [Number], default: [] },
  },
});

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
  periodicInfo: { type: PeriodicInfoSchema },
  duration: { type: Number, required: true },
  difficultyLevel: { type: Number, required: true, min: 1, max: 3 },
  organizer: { type: String, required: true },
});

export async function findSportsInterestsByCity(city:any) {
  const events = await EventModel.find({"address.city":city});
  if (events.length===0) {
    throw new Error("Events not found");
  }
  return events; // Return the city of the found user
}
export async function getAllEvents() {
  const events = await EventModel.find();
  if (events.length===0) {
    throw new Error("Events not found");
  }
  return events; // Return the city of the found user
}
//if not the same tavnit for the user and the event on difficultLvel cant do this 
// export async function findSportsInterestsByactivityLevel(level:any) {
//   const events = await EventModel.find({"difficultyLevel":level});
//   if (events.length===0) {
//     throw new Error("Events not found");
//   }
//   return events; // Return the city of the found user
// }

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);
