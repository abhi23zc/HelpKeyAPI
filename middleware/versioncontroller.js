// routes/postRoutes.js
const express = require('express');// Import your Mongoose model
const apiKeyMiddleware =require('./apikeymiddleware')
const router = express.Router();
const cors = require('./cors')

// POST route to add new data
router.get('/version',cors, apiKeyMiddleware, async (req, res) => {
    try {
        res.status(200).json({version : "1.0.0"}); // Send saved sale as a response
    } catch (err) {
        res.status(500).json({ message: 'Error fecthing version' });
    }
});

module.exports = router; // Export the router