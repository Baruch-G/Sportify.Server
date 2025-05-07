import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "user" | "admin";

export interface IUser extends Document {
  username: string;
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
  gender: "male" | "female";
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
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: ["user", "admin"], default: ["user"] },
  isCoach: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  location: {
    longitude: { type: Number },
    latitude: { type: Number },
  },
  age: { type: Number, required: true },
  wheight: { type: Number }, // kg
  gender: { type: String, enum: ["male", "female"], required: true },
  height: { type: Number }, // cm
  fitnessGoal: { type: String }, // e.g. "Lose weight", "Build muscle", etc.
  activityLevel: {
    type: String,
    enum: ["low", "moderate", "high"],
    default: "moderate",
  },
  sportsInterests: {
    type: [String],
    ref: "Category",
    default: [],
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
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
