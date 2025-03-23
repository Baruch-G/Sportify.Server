import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";



export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt: Date;
    age:number;
    wheight: number;
    gender: "male" | "female";
  }

  const UserSchema: Schema = new Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    age: {type: Number,required:true}
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


export const UserModel = mongoose.model<IUser>("User", UserSchema);
