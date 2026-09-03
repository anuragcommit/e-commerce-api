import "dotenv/config"
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.routes.js"

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);


export default app;
