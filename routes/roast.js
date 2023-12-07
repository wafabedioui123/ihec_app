var express = require('express');
var router = express.Router();
const rp = require('request-promise');
const OpenAI = require ("openai");
const { response } = require('../app');
const openai = new OpenAI({apiKey:'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'})
const removeTags = (text) => {
    return text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

router.post('/', async function(req, res) {
  console.log(req.body);
  const url = req.body.url;
  const lang = req.body.language;

  const rpResponse = await rp(url);
  console.log(rpResponse);
  const parsedText= removeTags(rpResponse);
  completion = await openai.chat.completions.create({
    max_tokens:1024,
    model:"gpt-3.5-turbo",
    messages:[
      {"role": "system", "content": "This is the content of the website of a company , roast it in a few sentences(3-4) to make fun of ot. I need you to give me the result in "+lang},
      {"role": "user", "content": parsedText}
    ]
  }
    
)
res.send(completion.choices[0]);

}
);
 


  module.exports = router;