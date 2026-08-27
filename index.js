import "dotenv/config" ;
import connectDB from "./src/db/db.js";
import app from "./src/app.js";

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log("Server is running on port: ", port);
        });
    })
    .catch((err) => {
        console.error("Server initiliazation error", err);
    });

