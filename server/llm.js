import fs from 'fs/promises';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import md5 from 'md5';

// const configFile = process.env.CONFIG_FILE || 'config.json';
let openai_model;
dotenv.config();

export { getRhyme, getApiKeyHash };


const config = await loadConfig();
const openAiApi = await setupOpenAi(config);

async function requestRhyme(date) {
    // Extract hours and minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format (get the remainder when divided by 12)
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12' as 12/12 has a remainder of 0
    
    // Format minutes to always be two digits
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    // Construct the time string with AM/PM but without seconds
    const timeString = `${hours}:${minutes} ${ampm}`;
    // const sentTime = `The time ${timeString} told as a rhyme. Only the rhyme and nothing else\n\n`;
    const response = await openAiApi.chat.completions.create({
        model: config.openai_model,
        messages: [
            {
                role: 'system',
                content: "You are powering a clock that displays a one-line rhyme for the current time. The user will send you a time and you should respond with a rhyme for that time. Only the rhyme and nothing else. No formatting, no leading punctuation or leading special characters. Just the rhyme that tells the time in a creative way."
                
            },
            {
                role: 'user',
                // Maybe it would be better to just send the time
                // content: `The time is ${timeString}`
                content: timeString
            }   
        ],
        max_tokens: 100,

    })
    return response.choices[0].message.content

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
    const openai = new OpenAI({
        apiKey: config.openai_api_key,
        baseURL: config.openai_base_url
    });
    return openai;
}

async function getApiKeyHash(req) {
    // Send the hash of the API key to the client
    const keyHash = md5(config.openai_api_key);
    if (keyHash == "9920e835b0b73f44f407f9b8221367ff"){ 
        return {
            message: "Please be advised, this is using my OpenRouter API key on the backend and thus, you may encounter rate limits."
        }
    }
}
async function loadConfig() {
    let openai_base_url, openai_api_key, openai_model;
    if (process.env.OPENAI_BASE_URL && process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) {
        openai_base_url = process.env.OPENAI_BASE_URL;
        openai_api_key = process.env.OPENAI_API_KEY;
        openai_model = process.env.OPENAI_MODEL;
        console.log("Using environment variables for OpenAI configuration");
    } else {
        // Fallback to config.json if environment variables are not set
        console.log("Using config.json for OpenAI configuration");
        try {
            const configPath = path.join(__dirname, 'config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            openai_base_url = config.openai_base_url;
            openai_api_key = config.openai_api_key;
            openai_model = config.openai_model;
        } catch (error) {
            throw new Error("Failed to load configuration from environment variables or config.json");
        }
    }

    return {
        "openai_base_url": openai_base_url,
        "openai_api_key": openai_api_key,
        "openai_model": openai_model
    }
}