import { ObjectId } from "mongodb";

import { IEvent } from "../models/Event";

export interface EventSuggestion {
  eventId: string;
  reason: string;
  score: number;
}

export interface UserPreferences {
  age: number;
  city: string;
  activityLevel: "low" | "moderate" | "high";
  sportsInterests: string[];
  fitnessGoal?: string;
}

// Extend IEvent to include MongoDB document fields
export interface EventWithId extends IEvent {
  _id: ObjectId;
}

export interface RequestParams {
  userId: string;
}
