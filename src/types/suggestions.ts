import { ObjectId } from "mongodb";

import { IEvent } from "../models/Event";
import { ICategory } from "../models/Category";
import mongoose from "mongoose";
export interface EventSuggestion {
  eventId: string;
  reason: string;
  score: number;
}

export interface UserPreferences {
  birthDay: Date;
  city: string;
  activityLevel: "sedentary" | "lightly active" | "moderately active" | "very active" | "extra active" | "athlete" | "bodybuilder";
  sportsInterests: mongoose.Schema.Types.ObjectId | ICategory[];
  fitnessGoal?: string;
}

// Extend IEvent to include MongoDB document fields
export interface EventWithId extends IEvent {
  _id: ObjectId;
}

export interface RequestParams {
  userId: string;
}
