import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { findUserById, findUserByMail, IUser, UserModel } from "../models/User";
import dotenv from "dotenv";
import { findSportsInterestsByCity, getAllEvents, IEvent } from "../models/Event";
import { ObjectId } from "mongodb";
dotenv.config();
const router = express.Router();

// function who send all the info to the Ai+ prompt and return his response(Json only)
async function getSuggestEvents(userInfos:any, events: any) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `I have a user profile and a list of sports events. Please return only a JSON array of events ranked by user preferences. 
    Here is the user infos: ${JSON.stringify(userInfos)} 
    Here are the sports events: ${JSON.stringify(events)}`;

  try {
    const result = await model.generateContent(prompt);
    const suggestedEvents = result.response.text();
    // console.log("Suggested Events:", suggestedEvents);
    return (suggestedEvents);
  } catch (error) {
    console.error("Error during AI generation:", error);
  }
}

//event reduce by city
router.get("/id_city", async (req: any, res: any) => {
  try {
    const idParam = req.body.id;
    if (!ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    var id :ObjectId= new ObjectId(idParam);
    const user: IUser = await findUserById(id);
    const userObject = user.toObject();//convert to an object JS
    const { email,password,addresse,username,createdAt, ...filteredUser}=userObject;// filter the data to not send private data to Ai
    const city: String = user.city;
    const events: IEvent[] = await findSportsInterestsByCity(city);//to reduce the number of events to send to the Gemini we filter the events firt by the User's city
    const suggestedEvents:any = await getSuggestEvents(filteredUser, events); //then we ask the Ai with the user's infos and events in his city
    var rawText = suggestedEvents.trim();
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
    var resultJSon = JSON.parse(rawText);
    res.status(200).json(resultJSon);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to get suggestions", message: error.message });
  }
});
//Get all the events suggestion Ordered BY Ai to suggests an User => not with city filter
router.get("/", async (req: any, res: any) => {
  try {
    const idParam = req.body.id;
    if (!ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const id:ObjectId = new ObjectId(idParam);
    const user: IUser = await findUserById(id);
    const userObject = user.toObject();//convert to an object JS
    const { email,password,addresse,username,createdAt, ...filteredUser}=userObject;// filter the data to not send private data to Ai
    //get all the event of the App
    const events: IEvent[] = await getAllEvents();

    const suggestedEvents:any = await getSuggestEvents(filteredUser, events);
    var rawText = suggestedEvents.trim();
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
    var resultJSon = JSON.parse(rawText);
  res.status(200).json(resultJSon);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to get suggestions", message: error.message });
  }
});

//if we want filter by Email
router.get("/byEmail_city", async (req: any, res: any) => {
  try {
    const mail=req.body.email;

  const user: any = await findUserByMail(mail);
  const city: String = user.city;
  const userObject = user.toObject();//convert to an object JS
  const { email,password,addresse,username,createdAt, ...filteredUser}=userObject;// filter the data to not send private data to Ai
  const events: IEvent[] = await findSportsInterestsByCity(city);//filter By city
  //then we ask the Ai with the user's infos and events in his city
  const suggestedEvents:any = await getSuggestEvents(filteredUser, events);
  var rawText = suggestedEvents.trim();
  rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
  var resultJSon = JSON.parse(rawText);
  res.status(200).json(resultJSon);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to get suggestions", message: error.message });
  }
});
export default router;
