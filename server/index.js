import express from "express";

const app =  express();

app.get("/", (req,res) => {
    res.send("<h2>Hey guys, start contributing by editing this file(server.js)👀. All the best to y'all✨</h2>")
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

