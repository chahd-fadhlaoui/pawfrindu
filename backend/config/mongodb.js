import mongoose from "mongoose";
import LostAndFound from "../models/lostAndFoundModel.js"; 

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/pawfrindu`);

    // Ensure indexes for LostAndFound collection
    await LostAndFound.createIndexes();
    console.log("Indexes created for LostAndFound collection");
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    throw error;
  }
};

export default connectDB;