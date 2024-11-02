import express from "express";

const app = express();
const PORT = 3000 ;

// POST
app.post("/users", (req, res, next) => {
    res.json({message: "User Created"});
});

// GET
app.get("/users", (req, res) => {
    res.json({message: "User Lists"});
});

// UPDATE
app.patch("/users/:id", (req, res) => {
    const {id} = req.params;
    res.json({message: `user ${id} updated`});
});

// DELETE
app.delete("/users/:id", (req, res) => {
    const {id} = req.params;
    res.json({message: `user ${id} deleted`});
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});