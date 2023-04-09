# CloudWatch Logs Insights ChatGPT 

## Features

- Chrome extension that generates CloudWatch Logs Insights queries from ChatGPT prompts

## Install
* Go to [OpenAI](https://platform.openai.com/account/api-keys) and create an API key
* Clone this repo
* Create file `src/apiKey.js` with the following content
```
  export const apiKey = '<your openai api key>';
```
* run `npm install && npm run build`
* Open chrome://extensions
* Enable the "Developer mode" toggle 
* Click on the "Load unpacked" button
* Select the folder <project_root>/build

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

