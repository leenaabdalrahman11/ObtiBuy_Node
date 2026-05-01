import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    if (!process.env.DB) {
      throw new Error('DB environment variable is missing');
    }

    await mongoose.connect(process.env.DB);

    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDb;