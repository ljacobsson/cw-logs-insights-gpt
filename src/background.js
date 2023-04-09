'use strict';
const { Configuration, OpenAIApi } = require("openai");
const { apiKey } = require("./apiKey");
const axios = require("axios").default;
const fetchAdapter = require("@vespaiach/axios-fetch-adapter").default;
require("regenerator-runtime/runtime");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'QUERY') {
    console.log("q", request.payload.query);
    const configuration = new Configuration({
      apiKey: apiKey, 
    });
    const instance = axios.create({
      adapter: fetchAdapter
    });
    const openai = new OpenAIApi(configuration, undefined, instance);
    const prompt = `Translate this to CloudWatch Logs Insights query language: ${request.payload.query}`;

    const openAiRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Translate this to CloudWatch Logs Insights query language: ${request.payload.query}. Respond with only the query.`,
        }
      ], 
      temperature: 0.5,
      max_tokens: 1000
    };
    openai.createChatCompletion(openAiRequest).then((data) => {
      sendResponse({ message: data.data.choices[0].message.content, prompt });
    });
  }
  return true;
});
