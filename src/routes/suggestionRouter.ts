import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { findUserById } from "../models/User";
import { getAllEvents } from "../models/Event";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { EventWithId } from "../types/suggestions";
import { getPersonalizedSuggestions } from "../utils/suggestions";
import { ICategory } from "../models/Category";

dotenv.config();
const router = express.Router();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

router.get("/:userId", async (req: any, res: any) => {
  try {
    const idParam = req.params.userId;

    // Validate ObjectId
    if (!ObjectId.isValid(idParam)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const userId = new ObjectId(idParam);

    // Get user and events
    const user = await findUserById(userId);
    const events = (await getAllEvents()) as EventWithId[];

    // Get personalized suggestions
    const suggestions = await getPersonalizedSuggestions(user, events);

    // Map suggestions to full event data
    const finalResults = suggestions
      .map(({ eventId, reason, score }) => {
        const event = events.find((e) => e._id.toString() === eventId);
        if (!event) return null;

        return {
          ...event.toObject(),
          reason,
          relevanceScore: score,
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null);

    res.status(200).json(finalResults);
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({
      error: "Failed to get personalized suggestions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/text-suggestions", async (req: any, res: any) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Get all events to use as context
    const events = (await getAllEvents()) as EventWithId[];

    // Create a formatted string of available events for context
    const eventsContext = events
      .map(
        (event) =>
          `Event ID: ${event._id}, Name: ${(event.category as ICategory).name}, Level: ${
            event.difficultyLevel
          }, Date: ${event.date}`
      )
      .join("\n");

    // Create the AI prompt
    const aiPrompt = `Given the following user request and available events, provide personalized sport suggestions in a friendly, conversational tone.
    
User Request: ${prompt}

Available Events:
${eventsContext}

Please provide suggestions in the following format:
1. A brief, friendly analysis of what the user might enjoy
2. 2-3 specific event recommendations with explanations
   For each recommendation, provide:
   - A user-friendly description
   - The event ID (in parentheses at the end of each recommendation)
3. A short, encouraging piece of advice

Keep the response casual and engaging, as if you're having a friendly conversation. Format the event IDs as (ID: [event_id]) at the end of each recommendation.`;

    // Get AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract event IDs from the text
    const eventIdRegex = /\(ID: ([a-f0-9]+)\)/g;
    const recommendedEventIds = Array.from(text.matchAll(eventIdRegex)).map(match => match[1]);

    // Create a map of event IDs to their names for link generation
    const eventMap = new Map(
      events.map(event => [event._id.toString(), (event.category as ICategory).name])
    );

    // Replace event IDs with clickable links
    let userFacingResponse = text;
    recommendedEventIds.forEach(eventId => {
      const eventName = eventMap.get(eventId);
      if (eventName) {
        const link = `[${eventName}](/events/${eventId})`;
        userFacingResponse = userFacingResponse.replace(
          `(ID: ${eventId})`,
          `(${link})`
        );
      }
    });

    res.status(200).json({
      suggestions: userFacingResponse,
      recommendedEventIds,
      availableEvents: events.map((e) => ({
        id: e._id.toString(),
        name: (e.category as ICategory).name,
        difficultyLevel: e.difficultyLevel,
        date: e.date,
      })),
    });
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    res.status(500).json({
      error: "Failed to generate suggestions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
