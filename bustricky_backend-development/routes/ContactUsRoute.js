const express = require("express");
const router = express.Router();
const MsgController = require("../controllers/ContactUsController");  // Changed to lowercase 'controllers'

// Add new message/support ticket
router.post("/", MsgController.addMessage);

// Get messages by email
router.get("/email/:gmail", MsgController.getByEmail);

// Get messages by userId (for user profile)
router.get("/user/:userId", MsgController.getByUserId);

// Get message by ID
router.get("/id/:id", MsgController.getById);

// Update message (for editing tickets)
router.put("/id/:id", MsgController.updateMessage);

// Delete message
router.delete("/id/:id", MsgController.deleteMsg);

module.exports = router;