import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB Atlas using Mongoose.
 * Exits the process on failure — a misconfigured DB is unrecoverable at startup.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ has these as defaults, but kept explicit for clarity
      serverSelectionTimeoutMS: 5000,   // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,           // close idle sockets after 45 s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // non-zero exit signals crash to process manager / Docker
  }
};

// Mongoose global event listeners for post-startup connectivity changes
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect…")
);

mongoose.connection.on("reconnected", () =>
  console.log("✅ MongoDB reconnected.")
);

export default connectDB;
