import { IUser } from "../models/User";
import { EventSuggestion, EventWithId, UserPreferences } from "../types/suggestions";

// Calculate a relevance score for an event based on user preferences
export function calculateEventScore(event: EventWithId, userPrefs: UserPreferences): number {
    let score = 0;
    
    // Location match (highest weight)
    if (event.address.city.toLowerCase() === userPrefs.city.toLowerCase()) {
      score += 5;
    }
    
    // Activity level match
    const difficultyMap = {
      low: 1,
      moderate: 2,
      high: 3
    };
    
    const userDifficulty = difficultyMap[userPrefs.activityLevel];
    const difficultyDiff = Math.abs(event.difficultyLevel - userDifficulty);
    score += (3 - difficultyDiff) * 2;
    
    // Sports interests match
    if (userPrefs.sportsInterests.includes(event.category.toString())) {
      score += 4;
    }
    
    // Date relevance (events in the next 7 days get a boost)
    const now = new Date();
    const eventDate = new Date(event.date);
    const daysUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
      score += 3;
    }
    
    return score;
  }
  
  // Get personalized event suggestions
  export async function getPersonalizedSuggestions(user: IUser, events: EventWithId[]): Promise<EventSuggestion[]> {
    const userPrefs: UserPreferences = {
      birthDay: user.birthDay,
      city: user.address.city,
      activityLevel: user.activityLevel || "moderate",
      sportsInterests: user.sportsInterests || [],
      fitnessGoal: user.fitnessGoal
    };
  
    // Calculate scores for all events
    const scoredEvents = events.map(event => ({
      eventId: event._id.toString(),
      score: calculateEventScore(event, userPrefs),
      reason: generateReason(event, userPrefs)
    }));
  
    // Sort by score and take top 10
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
  
  // Generate a human-readable reason for the suggestion
  export function generateReason(event: EventWithId, userPrefs: UserPreferences): string {
    const reasons: string[] = [];
    
    if (event.address.city.toLowerCase() === userPrefs.city.toLowerCase()) {
      reasons.push("in your city");
    }
    
    if (userPrefs.sportsInterests.includes(event.category.toString())) {
      reasons.push("matches your sports interests");
    }
    
    const difficultyMap = {
      low: "beginner-friendly",
      moderate: "moderate intensity",
      high: "challenging"
    };
    
    if (event.difficultyLevel === 1 && userPrefs.activityLevel === "low") {
      reasons.push("perfect for your activity level");
    }
    
    return reasons.join(" and ");
  }
  