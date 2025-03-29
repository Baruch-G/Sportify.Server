import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserModel } from "../models/User";
import { EventModel } from "../models/Event.ts";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


// function who send all the info to the Ai+ prompt and return his response(Json only)
async function getSuggestEvents(userInfos:String, eventsBycityUser:any) {
  const genAI = new GoogleGenerativeAI("GEMINI_URI");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `I have a user profile and a list of sports events. Please return a JSON array of events ranked by user preferences. 
Here is the user profile: ${JSON.stringify(userInfos)} 
Here are the sports events: ${JSON.stringify(eventsBycityUser)}`;

  try {
    const result = await model.generateContent(prompt);
    const suggestedEvents = result.response.text(); 
    console.log("Suggested Events:", suggestedEvents);
    return JSON.parse(suggestedEvents);
  } catch (error) {
    console.error("Error during AI generation:", error);
  }
}

router.post("/:city",async (req:any,res:any)=>{
  try{
    const city= req.params.city;
    const {User}= req.body;
    const eventsBycityUser=await EventModel.find({city});
    const suggestedEvents=getSuggestEvents(User,eventsBycityUser);
    res.status(200).json(suggestedEvents);

  }catch(error){
    res.status(500).json({ message: "Error post suggestions:", error });
  }
})



export default router;