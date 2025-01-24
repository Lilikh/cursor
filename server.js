const express = require('express');
const OpenAI = require("openai");
const axios = require('axios');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure the URLs are correct and valid
const calendarUrl = 'https://www.atg.se/services/racinginfo/v1/api/calendar/day/2024-12-14';
const raceUrl = 'https://www.atg.se/services/racinginfo/v1/api/races/123456';

let data = {};

// Fetch data from the API and store it in the data object
async function fetchData() {
    try {
        console.log("Fetching data from:", calendarUrl);
        const calendarResponse = await axios.get(calendarUrl);
        console.log("Fetching data from:", raceUrl);
        const raceResponse = await axios.get(raceUrl);
        data.calendar = calendarResponse.data;
        data.race = raceResponse.data;
        console.log("Fetched data:", data); // Debugging line
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
    }
}

// Fetch data initially
fetchData();

// Periodically fetch data to keep it updated
setInterval(fetchData, 3600000); // Fetch data every hour

// Returns information about this week's horses.
function getHorseInfo() {
    const horses = data.race && data.race.horses ? data.race.horses : []; // Adjust the path based on your JSON structure
    if (horses.length < 2) {
        return 'There are not enough horses available this week.';
    }
    return `This week there are two horses. They are: ${horses[0].name} with the odds ${horses[0].odds} and ${horses[1].name} with the odds ${horses[1].odds}.`;
}

// Returns information about this week's drivers.
function getDriverInfo() {
    const drivers = data.race && data.race.drivers ? data.race.drivers : []; // Adjust the path based on your JSON structure
    if (drivers.length < 2) {
        return 'There are not enough drivers available this week.';
    }
    return `This week there are drivers. They are 1: ${drivers[0].name} and 2: ${drivers[1].name}.`;
}

// Maps open ai function names to actual function names.
const functionMapping = {
    "get_driver_info": getDriverInfo,
    "get_horse_info": getHorseInfo
}

const tools = [
    {
        "type": "function",
        "function": {
            "name": "get_horse_info",
            "description": "Get the current horses in this week's race.",
            "parameters": {}        
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_driver_info",
            "description": "Get information about the drivers in the current race.",
            "parameters": {}        
        }
    },
]

async function run() {
    await fetchData();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a gambling expert called Leila. Your mission is to help people gamble on horses. There are two horses in this weeks race." },
            {
                role: "user",
                content: "Vilka kuskar deltar i veckans lopp?",
            },
        ],
        tools: tools,
        store: true,
    });
    
    console.log(completion.choices[0].message);
    if(!completion.choices[0].message.content) {
        // Get the name of the function OpenAI wants to call.
        const functionName = completion.choices[0].message.tool_calls[0].function.name;
        const data = functionMapping[functionName]();
        console.log("Found this data:")
        console.log(data);

        const completion_2 = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a gambling expert called Leila. Your mission is to help people gamble on horses. There are two horses in this weeks race. You can possibly find the answer in this data: " + data },
                {
                    role: "user",
                    content: "Vilka kuskar deltar i veckans lopp?",
                },
            ],
            store: true,
        });

        console.log(completion_2.choices[0].message.content);
    }
}

run();

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve static files with correct MIME types
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.js') {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { question, tableData } = req.body;

    const prompt = `
    You are a gambling expert called Leila. Your mission is to help people gamble on horses. Here is the data:
    ${JSON.stringify(tableData, null, 2)}

    Question: ${question}
    Answer:
    `;
    console.log("Question:", question); 
    console.log(tableData);
    
    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: "system", content: "You are a gambling expert called Leila. Your mission is to help people gamble on horses. Here is the data:" },
                    { role: "system", content: JSON.stringify(tableData.slice(0,10), null, 2) },
                    { role: "user", content: question }
                  
               
                    
                ],
               
            })
        });
     

        const openaiData = await openaiResponse.json();

        if (openaiData.choices && openaiData.choices.length > 0) {
            const answer = openaiData.choices[0].message.content.trim();
            res.json({ answer });
        } else {
            console.error('Invalid response from OpenAI API:', openaiData);
            res.status(500).json({ data: openaiData, 
                error: 'Invalid response from OpenAI API' });
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Error calling OpenAI API' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
