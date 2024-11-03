import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

app.use(express.json());

interface userData {
    id: string;
    name: string;
    address: string;
}

interface ValidationRequest extends Request {
    headers: {
        authorization: string;
    };
    userData: userData;
}

const accessValidation = (req: Request, res: Response, next: NextFunction) => {
    const validationReq = req as ValidationRequest;
    const { authorization } = validationReq.headers;

    if (!authorization) {
        return res.status(401).json({
            message: "Token is needed!",
        });
    }

    const token = authorization.split(" ")[1];
    const secret = process.env.JWT_SECRET!;

    try {
        const jwtDecode = jwt.verify(token, secret);

        if (typeof jwtDecode !== "string") {
            validationReq.userData = jwtDecode as userData;
        }
    } catch {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    next();
};

// REGISTER
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    res.json({
        message: "user created!",
    });
});

// LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found!",
        });
    }

    if (!user.password) {
        return res.status(404).json({
            message: "Password not set!",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    const payload = {
        id: user.id,
        name: user.name,
        address: user.address,
    };

    const secret = process.env.JWT_SECRET!;

    const expiresIn = 60 * 60 * 1;

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });

    if (isPasswordValid) {
        return res.json({
            data: {
                id: user.id,
                name: user.name,
                address: user.address,
            },
            token: token,
        });
    } else {
        return res.status(403).json({
            message: "Password Invalid!",
        });
    }
});

// POST
app.post("/users", accessValidation, async (req, res, next) => {
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
app.get("/users", accessValidation, async (req, res) => {
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
app.patch("/users/:id", accessValidation, async (req, res) => {
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
app.delete("/users/:id", accessValidation, async (req, res) => {
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
