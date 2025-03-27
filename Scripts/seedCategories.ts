import mongoose from "mongoose";
import { CategoryModel } from "../src/models/Category.ts"; // adjust path
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const categoriesData = [
  {
    name: "Fitness & Training",
    subcategories: [
      "Weightlifting", "CrossFit", "Functional Training", "HIIT", "Circuit Training", "Bootcamp"
    ],
  },
  {
    name: "Yoga & Mindfulness",
    subcategories: [
      "Vinyasa Yoga", "Hatha Yoga", "Power Yoga", "Meditation", "Pilates", "Yin Yoga"
    ],
  },
  {
    name: "Team Sports",
    subcategories: [
      "Soccer", "Basketball", "Volleyball", "Handball", "Ultimate Frisbee", "Rugby"
    ],
  },
  {
    name: "Racket Sports",
    subcategories: [
      "Tennis", "Table Tennis", "Badminton", "Squash", "Paddle Tennis"
    ],
  },
  {
    name: "Outdoor & Adventure",
    subcategories: [
      "Hiking", "Rock Climbing", "Trail Running", "Mountain Biking", "Orienteering", "Camping"
    ],
  },
  {
    name: "Running & Walking",
    subcategories: [
      "5K Training", "Marathon", "Trail Running", "Power Walking", "Nordic Walking"
    ],
  },
  {
    name: "Aquatic Sports",
    subcategories: [
      "Swimming", "Diving", "Water Polo", "Surfing", "Paddleboarding", "Kayaking"
    ],
  },
  {
    name: "Martial Arts",
    subcategories: [
      "Karate", "Judo", "Kickboxing", "Boxing", "Brazilian Jiu-Jitsu", "Taekwondo", "Muay Thai"
    ],
  },
  {
    name: "Dance & Movement",
    subcategories: [
      "Zumba", "Hip Hop", "Ballet", "Contemporary Dance", "Jazz Dance", "Salsa"
    ],
  },
  {
    name: "Winter Sports",
    subcategories: [
      "Skiing", "Snowboarding", "Ice Skating", "Ice Hockey", "Snowshoeing"
    ],
  },
  {
    name: "Cycling",
    subcategories: [
      "Road Cycling", "Mountain Biking", "Spinning (Indoor Cycling)", "BMX", "Gravel Riding"
    ],
  },
  {
    name: "Rehabilitation & Health",
    subcategories: [
      "Physiotherapy Sessions", "Mobility Training", "Postnatal Fitness", "Injury Prevention"
    ],
  },
  {
    name: "Mind-Body Wellness",
    subcategories: [
      "Breathwork", "Tai Chi", "Qi Gong", "Guided Visualization"
    ],
  },
  {
    name: "Extreme Sports",
    subcategories: [
      "Parkour", "Skateboarding", "BMX Freestyle", "Free Running"
    ],
  },
  {
    name: "Gymnastics & Acrobatics",
    subcategories: [
      "Artistic Gymnastics", "Trampoline", "Aerial Silks", "AcroYoga"
    ],
  },
  {
    name: "Combat Sports",
    subcategories: [
      "MMA", "Wrestling", "Sambo", "Bare-Knuckle Boxing"
    ],
  },
  {
    name: "Climbing & Vertical Sports",
    subcategories: [
      "Indoor Climbing", "Bouldering", "Via Ferrata", "Speed Climbing"
    ],
  },
  {
    name: "Water Fitness",
    subcategories: [
      "Aqua Aerobics", "Aqua Zumba", "Hydrospinning", "Deep Water Running"
    ],
  },
  {
    name: "Motor Sports",
    subcategories: [
      "Go-Karting", "Motocross", "Enduro", "Rally Driving"
    ],
  },
  {
    name: "Inclusive Sports",
    subcategories: [
      "Adaptive Yoga", "Wheelchair Basketball", "Para Swimming", "Seated Volleyball"
    ],
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sportift");

    console.log("🌱 Starting category seeding...");

    for (const group of categoriesData) {
        
        // Save the parent category to DB and retrieve the generated id
        const parent = await CategoryModel.create({
          name: group.name,
          description: `${group.name} related activities`,
          imageURL: "/images/placeholder.jpg",
          parentCategoryId: null,
          difficultyLevel: 2,
          popularityScore: 0,
        });
      
        const parentId = parent.id; // ✅ This is the actual saved id
      
        // Create children and link them to the real parent id
        for (const sub of group.subcategories) {
          await CategoryModel.create({
            name: sub,
            description: `${sub} under ${group.name}`,
            imageURL: "/images/placeholder.jpg",
            parentCategoryId: parentId, // ✅ Correct parent linkage
            difficultyLevel: 2,
            popularityScore: 0,
          });
        }
      }
      

    console.log("✅ Category seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories();
