import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("Chat API is running...");
});

import chatRoutes from "./routes/chatRoutes.js";
app.use("/api", chatRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//Swagger Con
const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Chat API",
        version: "1.0.0",
        description: "API for a chatbot application",
      },
      servers: [{ url: "http://localhost:5000" }],
    },
    apis: ["./routes/chatRoutes.js"],
  };
  
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  