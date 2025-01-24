/* async function testApi(question) {
    // Fetch table data from local storage or use hardcoded data
    let tableData = JSON.parse(localStorage.getItem('tableData'));
    if (!tableData) {
        // Use hardcoded data if no data in local storage
        tableData = [
            {
                name: "Thunder",
                age: 5,
                sex: "Stallion",
                shoes: "Shoes On",
                sulky: "Standard",
                trainer: "John Smith",
                number: 1,
                distance: "1600m"
            },
            {
                name: "Lightning",
                age: 4,
                sex: "Mare",
                shoes: "Shoes Off",
                sulky: "Lightweight",
                trainer: "Jane Doe",
                number: 2,
                distance: "1800m"
            },
            {
                name: "Ziva",
                age: 6,
                sex: "Mare",
                shoes: "Shoes Off",
                sulky: "Lightweight",
                trainer: "Hans Crebas",
                number: 2,
                distance: "1800m"
            },
            {
                name: "Jest Ange",
                age: 8,
                sex: "Mare",
                shoes: "Shoes Off",
                sulky: "Lightweight",
                trainer: "Catarina Westlund Grahn",
                number: 3,
                distance: "2140m"
            }
        ];
        // Optionally store the hardcoded data in local storage for future use
        localStorage.setItem('tableData', JSON.stringify(tableData));
    }

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, tableData })
    });

    const data = await response.json();
    document.getElementById('answer').textContent = data.answer;
}

// Add event listener to the button
document.getElementById('ask-button').addEventListener('click', () => {
    const question = document.getElementById('user-question').value;
    testApi(question);
});
 */
/* 

async function fetchDataFromAPI() {
    const calendarResponse = await fetch('https://www.atg.se/services/racinginfo/v1/api/calendar/day/2024-12-14');
    const calendarData = await calendarResponse.json();
    const races = calendarData.games.V75[0].races;
    const racePromises = races.map(race => fetch(`https://www.atg.se/services/racinginfo/v1/api/races/${race.id}`));
    const raceResponses = await Promise.all(racePromises);
    const raceData = await Promise.all(raceResponses.map(response => response.json()));
    const starters = raceData.flatMap(race => race.starts);
    localStorage.setItem('starters', JSON.stringify(starters));
    return starters;
}

async function testApi(question) {
    // Fetch table data from local storage or fetch from API if not available
    let tableData = JSON.parse(localStorage.getItem('starters'));

    if (!tableData) {
        tableData = await fetchDataFromAPI();
    }

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, tableData })
    });

    const data = await response.json();
    document.getElementById('answer').textContent = data.answer;
}

// Add event listener to the button
document.getElementById('ask-button').addEventListener('click', () => {
    const question = document.getElementById('user-question').value;
    testApi(question);
});
 */


/* 
async function testApi(question) {
    // Fetch table data from local storage or use hardcoded data
    let tableData = JSON.parse(localStorage.getItem('tableData')) || [];

    // Function to filter data based on the question
    function filterData(table, question) {
        return table.filter(row => {
            return Object.values(row).some(value => {
                return value.toString().toLowerCase().includes(question.toLowerCase());
            });
        });
    }

    // Filter the data
    const filteredData = filterData(tableData, question);
    console.log("Filtered Data:", filteredData); // Debugging line

    // Send the filtered data to the server
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, tableData: filteredData })
    });

    const data = await response.json();
    document.getElementById('answer').textContent = data.answer;
}

// Add event listener to the button
document.getElementById('ask-button').addEventListener('click', () => {
    const question = document.getElementById('user-question').value;
    testApi(question);
});

async function callOpenAIAPI(inputData) {
    try {
        const response = await openaiAPI.sendRequest(inputData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data.error.code === 'context_length_exceeded') {
            console.error('Input data exceeds the maximum context length. Please reduce the input size.');
            // Implement logic to handle this scenario, such as trimming input or notifying the user
        } else {
            console.error('An error occurred:', error.message);
        }
    }
}
 */