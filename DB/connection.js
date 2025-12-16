import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://leena:leena@optibuy.ud9svq4.mongodb.net/OptiBuy');
    console.log(' MongoDB Atlas connected successfully');
  } catch (error) {
    console.error(' Database connection failed:', error);
  }
};

export default connectDb;