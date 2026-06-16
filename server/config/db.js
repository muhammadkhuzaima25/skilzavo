import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

// Use Google DNS for SRV lookups (fix for local DNS blocking SRV records)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let mongoServer;

const getDbPath = () => {
  const dbPath = path.join(process.cwd(), '.mongodb-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
  return dbPath;
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || '';
  if (uri && uri !== 'your_mongodb_atlas_uri' && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}. Falling back to local in-memory database.`);
    }
  } else {
    console.log('MongoDB URI not configured. Starting in-memory database.');
  }

  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: getDbPath(),
        storageEngine: 'wiredTiger',
      },
    });
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`MongoDB Connected (in-memory): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Failed to start in-memory database: ${error.message}`);
  }
};

export default connectDB;
