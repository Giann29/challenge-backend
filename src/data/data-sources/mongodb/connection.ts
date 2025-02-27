import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/challenge";

export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI); // No need for deprecated options
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the application if the connection fails
  }
}
