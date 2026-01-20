import mongoose from "mongoose";


const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI
    const connect = await mongoose.connect(uri);

    if (connect) {
      console.log("Database connected on atlas");
    }
  } catch (error) {
    console.error('Database Connection failed:',error);
  }
};


export default connectDb;
