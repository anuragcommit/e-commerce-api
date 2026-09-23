// src/utils/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js"; // 👈 Import User model

dotenv.config({ path: "./.env" });

const SEED_CATEGORIES = [
    { name: "Mobiles", slug: "mobiles" },
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Beauty", slug: "beauty" },
    { name: "Home", slug: "home" },
    { name: "Appliances", slug: "appliances" },
    { name: "Books", slug: "books" },
    { name: "Men's Fashion", slug: "mens" },
    { name: "Women's Fashion", slug: "womens" },
];

const RAW_PRODUCTS = [
    {
        title: "Apple iPhone 15 (128 GB) - Black",
        description: "Dynamic Island, 48MP main camera, USB-C, and all-day battery life.",
        price: 71999,
        originalPrice: 79900,
        categorySlug: "mobiles",
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60"],
        stock: 15,
        rating: 4.7,
        numReviews: 1240
    },
    {
        title: "Sony WH-1000XM5 Wireless Headphones",
        description: "Industry-leading noise cancellation, 30 hours battery life, ultra-comfortable fit.",
        price: 26990,
        originalPrice: 34990,
        categorySlug: "electronics",
        brand: "Sony",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"],
        stock: 25,
        rating: 4.8,
        numReviews: 890
    },
    {
        title: "Men's Regular Fit Casual Cotton Shirt",
        description: "100% breathable pure cotton, pre-washed for extra softness.",
        price: 699,
        originalPrice: 1999,
        categorySlug: "fashion",
        brand: "Roadster",
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60"],
        stock: 40,
        rating: 4.1,
        numReviews: 320
    },
    {
        title: "Smart LED 4K Ultra HD TV 55 Inch",
        description: "Vibrant Dolby Vision display, hands-free voice control, stereo sound.",
        price: 34999,
        originalPrice: 54990,
        categorySlug: "appliances",
        brand: "OnePlus",
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=60"],
        stock: 8,
        rating: 4.4,
        numReviews: 450
    },
    {
        title: "Ergonomic High-Back Mesh Office Chair",
        description: "Adjustable lumbar support, pneumatic height adjustment, breathable backrest.",
        price: 4999,
        originalPrice: 9999,
        categorySlug: "home",
        brand: "Green Soul",
        images: ["https://images.unsplash.com/photo-1580481077195-72da413039d9?w=600&auto=format&fit=crop&q=60"],
        stock: 12,
        rating: 4.5,
        numReviews: 610
    },
    {
        title: "Atomic Habits by James Clear",
        description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
        price: 450,
        originalPrice: 799,
        categorySlug: "books",
        brand: "Penguin",
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60"],
        stock: 50,
        rating: 4.9,
        numReviews: 5200
    },
    {
    title: "Men's Slim Fit Denim Jacket",
    description: "Classic denim trucker jacket with button cuffs and chest pockets.",
    price: 1899,
    originalPrice: 3499,
    categorySlug: "mens",
    brand: "Levi's",
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=60"],
    stock: 20,
    rating: 4.4,
    numReviews: 210
},
{
    title: "Women's Floral Maxi Dress",
    description: "Lightweight, breathable summer dress with a flowy A-line silhouette.",
    price: 1299,
    originalPrice: 2499,
    categorySlug: "womens",
    brand: "Zara",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=60"],
    stock: 18,
    rating: 4.6,
    numReviews: 380
}
];

async function seedDatabase() {
    try {
        const uri =
            process.env.MONGODB_URI ||
            process.env.MONGOBD_URI ||
            process.env.MONGO_URI ||
            "mongodb://127.0.0.1:27017/ecommerceDB";

        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("Connected successfully.");

        // 1. Find or create a seller user to associate products with
        let sellerUser = await User.findOne({
            $or: [{ role: "seller" }, { roles: "seller" }]
        });

        if (!sellerUser) {
            sellerUser = await User.findOne(); // fallback to any existing user
        }

        if (!sellerUser) {
            // If the database is completely empty of users, create an official seller
            sellerUser = await User.create({
                name: "Official Retailer",
                email: "seller@mystore.com",
                phone: 9876543210,
                password: "Password@123",
                roles: ["customer", "seller"]
            });
            console.log("Created official seller user.");
        } else {
            console.log(`Using seller ID: ${sellerUser._id} (${sellerUser.name || sellerUser.email})`);
        }

        // 2. Ensure Categories exist or create them
        const categoryMap = {};
        for (const cat of SEED_CATEGORIES) {
            let existing = await Category.findOne({
                $or: [{ slug: cat.slug }, { name: new RegExp(`^${cat.name}$`, "i") }]
            });
            if (!existing) {
                existing = await Category.create(cat);
            }
            categoryMap[cat.slug] = existing._id;
        }
        console.log("Categories checked/created.");

        // 3. Prepare products with valid Category ObjectId and Seller ObjectId
        const productsToInsert = RAW_PRODUCTS.map((p) => {
            const { categorySlug, ...rest } = p;
            return {
                ...rest,
                category: categoryMap[categorySlug],
                seller: sellerUser._id // 👈 Required field satisfied
            };
        });

        // 4. Clear existing products and insert fresh data
        await Product.deleteMany({});
        await Product.insertMany(productsToInsert);

        console.log(`Successfully seeded ${productsToInsert.length} products!`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();