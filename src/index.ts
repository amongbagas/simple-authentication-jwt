import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(express.json());

// POST
app.post("/users", async (req, res, next) => {
    const { name, email, address } = req.body;
    const result = await prisma.user.create({
        data: {
            name: name,
            email: email,
            address: address,
        },
    });
    res.json({
        data: result,
        message: "user created!",
    });
});

// GET
app.get("/users", async (req, res) => {
    const result = await prisma.user.findMany({
        select: {
            name: true,
            email: true,
            address: true,
        },
    });
    res.json({
        message: "User Lists",
        data: result,
    });
});

// UPDATE
app.patch("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { email, name, address } = req.body;
    const result = await prisma.user.update({
        where: {
            id: Number(id),
        },
        data: {
            name: name,
            email: email,
            address: address,
        },
    });
    res.json({ message: `user ${id} updated` });
});

// DELETE
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    const result = await prisma.user.delete({
        where: {
            id: Number(id),
        },
    });
    res.json({ message: `user ${id} deleted` });
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
