const express = require('express');

const app = express();

/* This will handle the test route */
app.use("/test",(req, res) => {
    res.send("Hello from the test route!");
});

/* This will handle all other routes */
app.use((req, res) => {
    res.send("Hello from the server!");
});

app.use("/", (req, res) => {
    res.send("Hello from the dashboard!");
});

app.listen(7777, () => {
    console.log('Server is running on port 7777');
});
