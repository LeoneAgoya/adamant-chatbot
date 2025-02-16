import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";


const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
  });
  
  const conversationIdSchema = z.object({
    id: z.string().uuid("Invalid conversation ID"),
  });
  

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     responses:
 *       200:
 *         description: Successfully created a conversation
 */


// Create a new conversation with initial bot message
router.post("/conversations", async (req, res) => {
  try {
    const conversation = await prisma.conversation.create({
      data: { name: "New Conversation" },
    });

    // Save "How can I help you?" in the database
    await prisma.message.create({
      data: {
        content: "How can I help you?",
        role: "ASSISTANT",
        conversationId: conversation.id,
      },
    });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});


    // Send message with validation
    router.post("/conversations/:id/messages", async (req, res) => {
        try {
        const { id } = req.params;
        const { content } = req.body;
    
        // Validate input
        conversationIdSchema.parse({ id });
        createMessageSchema.parse({ content });
    
        // Save user message
        const userMessage = await prisma.message.create({
            data: { content, role: "USER", conversationId: id },
        });
    
        // Simulate chatbot delay (2 seconds)
        setTimeout(async () => {
            await prisma.message.create({
            data: { content: "This is an AI Generated Response", role: "ASSISTANT", conversationId: id },
            });
        }, 2000);
    
        res.json(userMessage);
        } catch (error) {
        res.status(400).json({ error: error.errors || "Invalid request" });
        }
    });
    

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get all conversations
 *     responses:
 *       200:
 *         description: Successfully fetched conversations
 */



// Get all conversations
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the conversation
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */



// Send a message & chatbot response
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: "USER",
        conversationId: id,
      },
    });

    // Simulate chatbot delay (2 seconds)
    setTimeout(async () => {
      await prisma.message.create({
        data: {
          content: "This is an AI Generated Response",
          role: "ASSISTANT",
          conversationId: id,
        },
      });
    }, 2000);

    res.json(userMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Delete a conversation
router.delete("/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.conversation.delete({ where: { id } });
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// Update conversation name
router.put("/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Conversation name cannot be empty" });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { name },
    });

    res.json(updatedConversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to update conversation name" });
  }
});


export default router;
