// Import necessary modules and models
var express = require('express');
var router = express.Router();
const rp = require('request-promise');
const OpenAI = require("openai");
const mongoose = require('mongoose');
const WebsiteModel = require('C:/Users/Hp/ihec_back/model.js'); // Assuming the model.js file is in the same directory
process.env.OPENAI_KEY

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY});

// Function to remove HTML tags
const removeTags = (text) => {
  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://bediouiwafa:Nzln86DMDVKaumSb@cluster0.xqhifcp.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define the API endpoint
router.post('/', async function (req, res) {
  const url = req.body.url;
  const lang = req.body.language;

  try {
    // Check if the URL exists in the database
    const existingWebsite = await WebsiteModel.findOne({ url });

    if (existingWebsite) {
      // URL exists in the database, use the stored summary
      console.log("Using summary from the database");
      res.send({ result: existingWebsite.summary });
    } else {
      // URL doesn't exist in the database, proceed with OpenAI API
      console.log("URL not found in the database, using OpenAI API");

      // Fetch the content from the URL
      const rpResponse = await rp(url);
      const parsedText = removeTags(rpResponse);

      // Generate summary using OpenAI API
      const response = await openai.chat.completions.create({
        max_tokens: 300,
        model: "gpt-3.5-turbo",
        messages: [
          { "role": "system", "content": "This is the content of the website of a company, summarize it in a few sentences (3-4) so that we know what they do. I need you to give me your summary in " + lang },
          { "role": "user", "content": parsedText }
        ]
      });

      // Check if the response structure is as expected
      if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
        const summaryFromOpenAI = response.choices[0].message.content;

        // Save the URL and its summary to the database for future use
        const newWebsite = new WebsiteModel({
          url,
          summary: summaryFromOpenAI,
        });
        await newWebsite.save();

        res.send({ result: summaryFromOpenAI });

      } else {
        console.error("Error: Unexpected response structure from OpenAI API");
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
