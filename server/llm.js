import fs from 'fs/promises';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import md5 from 'md5';

// const configFile = process.env.CONFIG_FILE || 'config.json';
let openai_model;
dotenv.config();

export { getRhyme, getDisclaimer };


const config = await loadConfig();
const openAiApi = await setupOpenAi(config);

async function requestRhyme(hours, minutes) {
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
    if (!req.body.hasOwnProperty("hours") || !req.body.hasOwnProperty("minutes")) {
        throw new Error("Request must have hours and minutes")
    }
    // Get the date from the request body
    // Get the rhyme from the OpenAI API
    const rhyme = await requestRhyme(req.body.hours, req.body.minutes).catch((error) => {
        log.error(error);
        throw new Error("Could not generate rhyme");
    });
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

async function getDisclaimer() {
return {
            message: config.disclaimer_message
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

    // Optional options
    let apiKeyDisclaimer = "";
    if (process.env.DISCLAIMER_MESSAGE) {
        apiKeyDisclaimer = process.env.DISCLAIMER_MESSAGE;
    } else {
        // Try loading the JSON (again)
        try {
            const disclaimerPath = path.join(__dirname, 'disclaimer.json');
            const disclaimerData = await fs.readFile(disclaimerPath, 'utf8');
            const disclaimer = JSON.parse(disclaimerData);
            apiKeyDisclaimer = disclaimer.message;
        } catch (error) {
            console.log("Failed to load disclaimer message");
        }
    }

    return {
        "openai_base_url": openai_base_url,
        "openai_api_key": openai_api_key,
        "openai_model": openai_model,
        "disclaimer_message": apiKeyDisclaimer
    }
}