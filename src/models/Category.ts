import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICategory extends Document {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  popularityScore?: number;
  difficultyLevel?: number;
}

const CategorySchema: Schema = new Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageURL: { type: String, required: true },

  popularityScore: {
    type: Number,
    default: 0,
    min: 0,
  },

  difficultyLevel: {
    type: Number,
    enum: [1, 2, 3], // 1 = Beginner, 2 = Intermediate, 3 = Advanced
    default: 1,
  },
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
