// model.js

const mongoose = require('mongoose');

// Define the schema for the website document
const WebsiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  summary: {
    type: String,
    required: true,
  },
  // You can include additional fields as needed
  // For example, a timestamp for when the summary was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model for the website
const WebsiteModel = mongoose.model('Website', WebsiteSchema);

module.exports = WebsiteModel;