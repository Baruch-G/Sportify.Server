import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "./User";

export interface ICoachReview extends Document {
  id: string;
  coach: mongoose.Schema.Types.ObjectId | IUser; // Reference to the coach (User)
  reviewer: mongoose.Schema.Types.ObjectId | IUser; // Reference to the reviewer (User)
  rating: number; // Rating from 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields for more detailed feedback
  categories?: {
    professionalism?: number; // 1-5 rating
    communication?: number; // 1-5 rating
    expertise?: number; // 1-5 rating
    valueForMoney?: number; // 1-5 rating
  };
  isVerified?: boolean; // Whether the reviewer actually had a session with the coach
  sessionDate?: Date; // Date of the coaching session if applicable
}

const CoachReviewSchema: Schema = new Schema({
  id: { type: String, default: uuidv4 },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  categories: {
    professionalism: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    expertise: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  sessionDate: {
    type: Date
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Indexes for better query performance
CoachReviewSchema.index({ coach: 1, createdAt: -1 });
CoachReviewSchema.index({ reviewer: 1, coach: 1 }, { unique: true }); // Prevent multiple reviews from the same user for the same coach

// Static method to calculate average rating for a coach
CoachReviewSchema.statics.calculateAverageRating = async function(coachId: mongoose.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { coach: coachId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        averageProfessionalism: { $avg: "$categories.professionalism" },
        averageCommunication: { $avg: "$categories.communication" },
        averageExpertise: { $avg: "$categories.expertise" },
        averageValueForMoney: { $avg: "$categories.valueForMoney" }
      }
    }
  ]);
  
  return result[0] || {
    averageRating: 0,
    totalReviews: 0,
    averageProfessionalism: 0,
    averageCommunication: 0,
    averageExpertise: 0,
    averageValueForMoney: 0
  };
};

export const CoachReviewModel = mongoose.model<ICoachReview>("CoachReview", CoachReviewSchema); 