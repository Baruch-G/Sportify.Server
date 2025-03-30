import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { findUserById, IUser, UserModel } from "../models/User";
import dotenv from "dotenv";
import { findSportsInterestsById, IEvent } from "../models/Event";
dotenv.config();
const router = express.Router();

// function who send all the info to the Ai+ prompt and return his response(Json only)
async function getSuggestEvents(userInfos: string, eventsBycityUser: IEvent[]) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
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

router.post("/suggestEvents/:id", async (req: any, res: any) => {
  try {
    const user : IUser = await findUserById(req.params.id);
    const city: string = user.city;
    const sportsInterests = user.sportsInterests;
    const events : IEvent[] = await findSportsInterestsById(city)
    const suggestedEvents = await getSuggestEvents(sportsInterests?.join(",") || "", events);

    res.status(200).json(suggestedEvents);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to get suggestions", message: error.message });
  }
});

export default router;
