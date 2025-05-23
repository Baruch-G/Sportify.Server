// MongoDB shell script to insert coach users
db = db.getSiblingDB('sportify'); // Replace with your database name if different

// Function to hash password (in real application, this would be done by bcrypt)
function hashPassword(password) {
    return password; // In real application, use proper password hashing
}

// Insert first coach
db.users.insertOne({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@sportify.com",
    password: hashPassword("Coach123!"),
    image: "https://example.com/coach1.jpg",
    roles: ["user"],
    isCoach: true,
    address: {
        addressLine1: "123 Fitness Street",
        city: "New York",
        country: "USA"
    },
    location: {
        longitude: -73.935242,
        latitude: 40.730610
    },
    gender: "Female",
    height: 170,
    activityLevel: "very active",
    sportsInterests: ["Yoga", "Pilates", "Meditation"],
    coachProfile: {
        aboutMe: "Certified yoga instructor with 8 years of experience. Specializing in Vinyasa and Power Yoga.",
        coachingStartDate: new Date("2016-01-01"),
        specializations: ["Yoga", "Mindfulness", "Flexibility Training"],
        certifications: [
            "RYT-500 Yoga Alliance",
            "Pilates Mat Certification",
            "Mindfulness Meditation Teacher"
        ],
        coachingStyle: "Holistic approach focusing on mind-body connection",
        hourlyRate: 75,
        languages: ["English", "Spanish"],
        achievements: [
            "Featured in Yoga Journal 2022",
            "Led 1000+ group classes",
            "Specialized in therapeutic yoga"
        ]
    },
    createdAt: new Date()
});

// Insert second coach
db.users.insertOne({
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@sportify.com",
    password: hashPassword("Coach456!"),
    image: "https://example.com/coach2.jpg",
    roles: ["user"],
    isCoach: true,
    address: {
        addressLine1: "456 Sports Avenue",
        city: "Los Angeles",
        country: "USA"
    },
    location: {
        longitude: -118.243683,
        latitude: 34.052235
    },
    gender: "Male",
    height: 183,
    activityLevel: "athlete",
    sportsInterests: ["Strength Training", "CrossFit", "Nutrition"],
    coachProfile: {
        aboutMe: "Former competitive athlete turned strength and conditioning coach. Passionate about helping others achieve their fitness goals.",
        coachingStartDate: new Date("2018-06-01"),
        specializations: ["Strength Training", "CrossFit", "Sports Nutrition"],
        certifications: [
            "CrossFit Level 3 Trainer",
            "NSCA Certified Strength and Conditioning Specialist",
            "Precision Nutrition Level 2 Coach"
        ],
        coachingStyle: "High-intensity, results-driven approach with focus on proper form and technique",
        hourlyRate: 90,
        languages: ["English", "Mandarin"],
        achievements: [
            "Regional CrossFit Games Qualifier 2021",
            "Certified Olympic Weightlifting Coach",
            "Developed 50+ successful transformation programs"
        ]
    },
    createdAt: new Date()
});

print("Successfully inserted two coach users!"); 