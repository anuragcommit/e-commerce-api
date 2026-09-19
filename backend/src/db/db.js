import "dotenv/config" ;
import mongoose from "mongoose";

const connectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(process.env.MONGOBD_URI);
        // console.log(connectionInstance);
        console.log(`\n MongoDB connected! DB host: ${connectionInstance.connection.host}`)

    } catch (error) {
        console.error(`MongoDB connection failed:, ${error}, ${error.message} `);
        process.exit(1);
    }
}

export default connectDB;