import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserModel } from "../models/User";
import { findCityById ,findSportsInterestsById } from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


// function who send all the info to the Ai+ prompt and return his response(Json only)
async function getSuggestEvents(userInfos:String, eventsBycityUser:any) {
  const genAI = new GoogleGenerativeAI("GEMINI_KEY");
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
router.post("/:id/suggestEvents", async (req: any, res: any) => {
  try {
    const city = await findCityById(req.params.id);
    const sportsInterests: any = await findSportsInterestsById(req.params.id);


    const suggestedEvents = await getSuggestEvents(sportsInterests, city);

    res.status(200).json(suggestedEvents);  
  } catch (error:any) {
    res.status(500).json({ error: "Failed to get suggestions", message: error.message });
  }
});


export default router;