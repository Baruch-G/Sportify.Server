import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
export type Role = "user" | "admin";


export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: Role[];
  isCoach: boolean;
  aboutMe?: string;
  createdAt: Date;
  age: number;
  wheight: number;
  gender: "Male" | "Female";
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
  height?: number;
  fitnessGoal?: string;
  activityLevel?: "low" | "moderate" | "high";
  sportsInterests?: string[];
  events?: any[];
}

  const UserSchema: Schema = new Schema({
    id: { type: String, default: uuidv4 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    address:{type:String,require:true,},
    location: {
      longitude: { type: Number},
      latitude: { type: Number},
    },
    city:{type:String,require:false},
    birthDay: { type: Date, required: false },
    wheight: { type: Number }, // kg 
    gender: { type: String, enum: ["Male", "Female"], required: false },  
    height: { type: Number }, // cm
    fitnessGoal: { type: String }, // e.g. "Lose weight", "Build muscle", etc.
    activityLevel: {
      type: String,
      // enum: ["low", "moderate", "high"],
      enum: ["sedentary",
      "lightly active",
      "moderately active",
      "very active",
      "extra active",
      "athlete",
      "bodybuilder",
      "powerlifter",
      "crossfitter",
      "endurance athlete"],
    },
    sportsInterests: {
      type: [String],
      default: []
    },
  
    // Relation to favorite categories (Category IDs)
    favoriteCategoryIds: {
      type: [String], // Your custom UUIDs for categories
      ref: "Category",
      default: []
    },
  });

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export async function findUserById(id: any) {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export async function findUserByMail(email: any) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
