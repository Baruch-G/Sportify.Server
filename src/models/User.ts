import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { ICategory } from "./Category";

export type Role = "user" | "admin" | "coach";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: string;
  roles: Role[];
  isCoach: boolean;
  birthDay: Date;
  phone: string;
  coachProfile?: {
    aboutMe?: string;
    coachingStartDate?: Date;
    specializations?: mongoose.Schema.Types.ObjectId | ICategory[];
    certifications?: string[];
    coachingStyle?: string;
    hourlyRate?: number;
    languages?: string[];
    achievements?: string[];
  };
  createdAt: Date;
  wheight?: number;
  gender?: "male" | "female" | "other";
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
  activityLevel?: "sedentary" | "lightly active" | "moderately active" | "very active" | "extra active" | "athlete" | "bodybuilder";
  sportsInterests?: mongoose.Schema.Types.ObjectId | ICategory[];
  events?: any[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findUserById(id: string): Promise<IUser>;
  findUserByMail(email: string): Promise<IUser>;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  password: { type: String, required: true },
  roles: { type: [String], enum: ["user", "admin", "coach"], default: ["user"] },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  location: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true }
  },
  city: { type: String },
  birthDay: { type: Date },
  wheight: { type: Number }, // kg 
  gender: { type: String, enum: ["male", "female", "other"] },  
  height: { type: Number }, // cm
  fitnessGoal: { type: String },
  activityLevel: {
    type: String,
    enum: [
      "sedentary",
      "lightly active",
      "moderately active",
      "very active",
      "extra active",
      "athlete",
      "bodybuilder",
    ]
  },
  sportsInterests: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Category",
    default: []
  },
  isCoach: { type: Boolean, default: false },
  coachProfile: {
    aboutMe: { type: String },
    coachingStartDate: { type: Date },
    specializations: { 
      type: [mongoose.Schema.Types.ObjectId], 
      ref: "Category",
      default: [] 
    },
    certifications: { type: [String], default: [] },
    coachingStyle: { type: String },
    hourlyRate: { type: Number },
    languages: { type: [String], default: [] },
    achievements: { type: [String], default: [] }
  }
});

UserSchema.pre<IUser>("save", async function(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

UserSchema.statics.findUserById = async function(id: string): Promise<IUser> {
  const user = await this.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

UserSchema.statics.findUserByMail = async function(email: string): Promise<IUser> {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const UserModel = mongoose.model<IUser, IUserModel>("User", UserSchema);
