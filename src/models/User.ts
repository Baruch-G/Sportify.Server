import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

  
  export interface IUser extends Document {
    id:string,
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt: Date;
    age: number;
    wheight: number;
    gender: "male" | "female";
    addresse:string;
    city:string;
    height?: number;
    fitnessGoal?: string;
    activityLevel?: "low" | "moderate" | "high";
    sportsInterests?: string[];
  
    //  Favorite category IDs (referencing Category collection)
    favoriteCategoryIds?: string[];
  }
  

  const UserSchema: Schema = new Schema({
    id: { type: String, default: uuidv4 },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    addresse:{type:String,require:true,},
    city:{type:String,require:true},
    age: { type: Number, required: true },
    wheight: { type: Number }, // kg 
    gender: { type: String, enum: ["male", "female"], required: true },  
    height: { type: Number }, // cm
    fitnessGoal: { type: String }, // e.g. "Lose weight", "Build muscle", etc.
    activityLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate"
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


  UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export async function findUserById(id: any) {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export async function findUserByMail(email:any) {
  const user = await UserModel.findOne({email});
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}


export const UserModel = mongoose.model<IUser>("User", UserSchema);
