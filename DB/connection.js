import mongoose from "mongoose"

const connectDb = async()=>{
    return await mongoose.connect(process.env.DB).
    then(() => {
        console.log("database connection established");
    })
    .catch((err)=>{
        console.log(`error to connect : ${err}`);
    })
}

export default connectDb;