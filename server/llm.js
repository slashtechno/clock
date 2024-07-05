const fs = require('fs').promises;
const { OpenAI } = require('openai');
const configFile = process.env.CONFIG_FILE || 'config.json';
let config;
let openAiConfig;
let openAiApi;

module.exports = {
    getRhyme
}

loadAndConfigure();

async function loadAndConfigure() {
    try {
        config = await loadConfigFile();
        console.log(config); // This will print the config to the
    } catch (e) {
        console.error(`Could not load config file ${configFile}`);
        process.exit(1);
    }
    try {
        openAiApi = await setupOpenAi(config);
    } catch (e) {
        console.error(`Could not setup OpenAI API`);
        process.exit(1);
    }
}


async function requestRhyme(date) {
    const timeString = date.toLocaleTimeString(); // Extracts only the time part
    const prompt = `The time ${timeString} told as a rhyme. Only the rhyme and nothing else\n\n`;
    const response = await openAiApi.completions.create({
        model: config.openai_model,
        prompt: prompt,
        max_tokens: 100,
    })
    return response.choices[0].text

}

async function getRhyme(req) {
    // Check if req.body has the key "datetime" with a marshalled date
    if (!req.body.hasOwnProperty("datetime")) {
        throw new Error("Request must have a datetime field")
    }
    // Get the date from the request body
    const date = new Date(req.body.datetime)
    // Get the rhyme from the OpenAI API
    const rhyme = await requestRhyme(date)
    console.log(rhyme)
    return {
        rhyme: rhyme
    
    }
}


async function setupOpenAi(config) {
    if (!config.hasOwnProperty("openai_base_url") || !config.hasOwnProperty("openai_api_key") || !config.hasOwnProperty("openai_model")) {
        throw new Error("Config must have openai_base_url, openai_api_key, and openai_model fields")
    }

    const openai = new OpenAI({
        apiKey:  config.openai_api_key,
        baseURL: config.openai_base_url
      });
    return openai;
}

async function loadConfigFile() {
    return fs.readFile(configFile, 'utf8')
        .then(JSON.parse)
        .catch((e) => {
            console.error(`Could not load config file ${configFile}`);
            console.error(e);
            process.exit(1);
        });
}

async function loadConfigFile() {
    return fs.readFile(configFile, 'utf8')
        .then(JSON.parse)
        .catch((e) => {
            console.error(`Could not load config file ${configFile}`);
            console.error(e);
            process.exit(1);
        });
}