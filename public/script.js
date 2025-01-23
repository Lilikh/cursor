// Fetching JSON data for the calendar of a specific day.
async function getCalendarData(date) {
    const response = await fetch(`https://www.atg.se/services/racinginfo/v1/api/calendar/day/${date}`);
    const data = await response.json();
    return data;
}

// Fetching JSON data for a specific race.
async function getSectionInfo(raceId) {
    const response = await fetch(`https://www.atg.se/services/racinginfo/v1/api/races/${raceId}`);
    const data = await response.json();
    return data;
}

// Fetching all starters for a V75 race on some specific day.
async function getStarters(date) {
    const calendarData = await getCalendarData(date);
    const races = calendarData.games.V75[0].races;
    const proms = [];
    for (const race of races) {
        proms.push(getSectionInfo(race));
    }
    const sectionInfos = await Promise.all(proms);
    const starters = sectionInfos.flatMap(sectionInfo => sectionInfo.starts);
    return starters;
}

async function main() {
    const starters = await getStarters("2025-01-25");
    localStorage.setItem("starters", JSON.stringify(starters));
    populateStartersTable(starters); // Populate the table initially
}
main();

// Fetching details for a specific horse.
function getStarterDetails(horseName) {
    const starters = JSON.parse(localStorage.getItem("starters")) || [];
    console.log("Starters from localStorage:", starters);
    const starter = starters.find(starter => starter.horse.name.toLowerCase() === horseName.toLowerCase());

    if (starter) {
        console.log(starter);
        updateStarterInfo(starter);
    } else {
        console.error("No matching starter found for horse name:", horseName);
    }
    return starter;
}

// Get references to the HTML elements
const inputField = document.querySelector('input');

// Add an event listener for input changes
inputField.addEventListener('change', () => {
    const horseName = inputField.value;
    getStarterDetails(horseName);
});

function makeShoeString(shoes) {
    // Example function to convert shoe data to a string
    return shoes ? "Shoes On" : "Shoes Off";
}

// Example function to update horse info
function updateStarterInfo(starter) {
    if (!starter || !starter.horse) {
        console.error("Invalid starter object:", starter);
        return;
    }

    const horseNameElement = document.getElementById('horse-name');
    const horseAgeElement = document.getElementById('horse-age');
    const horseSexElement = document.getElementById('horse-sex');
    const horseShoesElement = document.getElementById('horse-shoes');
    const horseSulkyElement = document.getElementById('horse-sulky');
    const horseTrainerElement = document.getElementById('horse-trainer');

    if (horseNameElement && horseAgeElement && horseSexElement && horseShoesElement && horseSulkyElement && horseTrainerElement) {
        horseNameElement.textContent = starter.horse.name;
        horseAgeElement.textContent = starter.horse.age;
        horseSexElement.textContent = starter.horse.sex;
        horseShoesElement.textContent = makeShoeString(starter.horse.shoes);
        horseSulkyElement.textContent = starter.horse.sulky.type.engText;
        horseTrainerElement.textContent = starter.horse.trainer.firstName + " " + starter.horse.trainer.lastName;
    } else {
        console.error("One or more elements for displaying horse details are missing.");
    }
}

// Example usage:
const starterData = {    
    horse: {
        name: "Thunder",
        age: 5,
        sex: "Stallion",
        trainer: {
            firstName: "John",
            lastName: "Smith",        
        },
        shoes: {    
            back: {
                hasShoe: true,
            },
            front: {
                hasShoe: true,
            }
        },
        sulky: {
            type: {
                engText: "Standard",
            }
        },        
    }
};

updateStarterInfo(starterData);

// Function to populate the table with all starters
function populateStartersTable(starters) {
    const tbody = document.querySelector('#starters-table tbody');
    tbody.innerHTML = ''; // Clear existing content

    if (starters.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="no-results">No matching results found</td>
        `;
        tbody.appendChild(row);
        return;
    }

    starters.forEach(starter => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${starter.horse.name}</td>
            <td>${starter.horse.age}</td>
            <td>${starter.horse.sex}</td>
            <td>${makeShoeString(starter.horse.shoes)}</td>
            <td>${starter.horse.sulky.type.engText}</td>
            <td>${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}</td>
            <td>${starter.number}</td>
            <td>${starter.distance}m</td>
        `;
        tbody.appendChild(row);
    });

    addRowClickListeners();
}

// Function to show horse details in a popup
function showHorseDetailsPopup(starter) {
    console.log("Showing details for:", starter); // Debugging line
    const popupHorseName = document.getElementById('popup-horse-name');
    const popupHorseAge = document.getElementById('popup-horse-age');
    const popupHorseSex = document.getElementById('popup-horse-sex');
    const popupHorseShoes = document.getElementById('popup-horse-shoes');
    const popupHorseSulky = document.getElementById('popup-horse-sulky');
    const popupHorseTrainer = document.getElementById('popup-horse-trainer');
    const popupHorseNumber = document.getElementById('popup-horse-number');
    const popupHorseDistance = document.getElementById('popup-horse-distance');

    if (popupHorseName && popupHorseAge && popupHorseSex && popupHorseShoes && popupHorseSulky && popupHorseTrainer && popupHorseNumber && popupHorseDistance) {
        popupHorseName.textContent = starter.horse.name;
        popupHorseAge.textContent = starter.horse.age;
        popupHorseSex.textContent = starter.horse.sex;
        popupHorseShoes.textContent = makeShoeString(starter.horse.shoes);
        popupHorseSulky.textContent = starter.horse.sulky.type.engText;
        popupHorseTrainer.textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
        popupHorseNumber.textContent = starter.number;
        popupHorseDistance.textContent = `${starter.distance}m`;
        
        document.getElementById('horse-details-popup').classList.remove('hidden');
    } else {
        console.error("One or more elements for displaying horse details in the popup are missing.");
    }
}

// Add event listener to table rows
function addRowClickListeners() {
    const rows = document.querySelectorAll('#starters-table tbody tr');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const horseName = row.cells[0].textContent;
            console.log("Row clicked, horse name:", horseName); // Debugging line
            const starter = getStarterDetails(horseName);
            if (starter) {
                showHorseDetailsPopup(starter);
            }
        });
    });
}

// Close the popup when the close button is clicked
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('horse-details-popup').classList.add('hidden');
});

// Function to search for horses by name or trainer in real-time
function searchStarters() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    console.log("Search Input:", searchInput); // Debugging line
    const starters = JSON.parse(localStorage.getItem("starters")) || [];
    console.log("Starters from localStorage:", starters); // Debugging line
    
    // Filter starters based on horse name or trainer name
    const filteredStarters = starters.filter(starter => {
        const horseName = starter.horse.name.toLowerCase();
        const trainerName = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`.toLowerCase();
        
        // Check if the search input matches either the horse name or the trainer name
        return horseName.includes(searchInput) || trainerName.includes(searchInput);
    });
    
    console.log("Filtered Starters:", filteredStarters); // Debugging line
    
    // Update the table immediately with filtered results
    populateStartersTable(filteredStarters);
    
    // If there is exactly one result, show the horse details in a card
    if (filteredStarters.length === 1) {
        updateHorseDetailsCard(filteredStarters[0]);
    } else {
        document.getElementById('horse-details-card').classList.add('hidden');
    }
}

// Function to update horse details card
function updateHorseDetailsCard(starter) {
    document.getElementById('card-horse-name').textContent = starter.horse.name;
    document.getElementById('card-horse-age').textContent = starter.horse.age;
    document.getElementById('card-horse-sex').textContent = starter.horse.sex;
    document.getElementById('card-horse-shoes').textContent = makeShoeString(starter.horse.shoes);
    document.getElementById('card-horse-sulky').textContent = starter.horse.sulky.type.engText;
    document.getElementById('card-horse-trainer').textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
    
    document.getElementById('horse-details-card').classList.remove('hidden');
}

// Add event listener for input changes
document.getElementById('search-input').addEventListener('input', searchStarters);

// Add event listener for the search button if it exists
const searchButton = document.getElementById('search-button');
if (searchButton) {
    searchButton.addEventListener('click', searchStarters);
}

// Add a function to sort the table
function sortTable(column, type = 'string') {
    const tbody = document.querySelector('#starters-table tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const starters = JSON.parse(localStorage.getItem("starters"));
    
    starters.sort((a, b) => {
        let valueA, valueB;
        
        switch(column) {
            case 'name':
                valueA = a.horse.name;
                valueB = b.horse.name;
                break;
            case 'age':
                valueA = a.horse.age;
                valueB = b.horse.age;
                break;
            case 'number':
                valueA = a.number;
                valueB = b.number;
                break;
            // Add more cases as needed
        }
        
        if (type === 'number') {
            return valueA - valueB;
        }
        return valueA.localeCompare(valueB);
    });
    
    populateStartersTable(starters);
}

// Add this function to handle column color toggling
function setupColumnToggle() {
    const table = document.getElementById('starters-table');
    const headers = table.getElementsByTagName('th');
    
    for (let i = 0; i < headers.length; i++) {
        headers[i].addEventListener('click', function() {
            toggleColumnColor(i + 1); // i + 1 because nth-child is 1-based
        });
    }
}

function toggleColumnColor(columnIndex) {
    const table = document.getElementById('starters-table');
    const cells = table.querySelectorAll(`th:nth-child(${columnIndex}), td:nth-child(${columnIndex})`);
    
    cells.forEach(cell => {
        if (columnIndex % 2 === 1) { // Odd columns (dark)
            cell.classList.toggle('selected-column-dark');
        } else { // Even columns (light)
            cell.classList.toggle('selected-column-light');
        }
    });
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const themeIcon = document.getElementById('theme-icon');
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.textContent = '☀️'; // Sun icon for light mode
        } else {
            themeIcon.textContent = '🌙'; // Moon icon for dark mode
        }
    });
}

// Sample data structure for demonstration
const horses = [
    { name: "Black Beauty", trainer: "John Doe" },
    { name: "Seabiscuit", trainer: "Jane Smith" },
    { name: "Secretariat", trainer: "Bob Johnson" },
    { name: "American Pharoah", trainer: "Alice Brown" },
    { name: "War Admiral", trainer: "Charlie Davis" }
];

// Get references to the search bar and results list
const searchBar = document.getElementById("searchBar");
const resultsList = document.getElementById("results");

// Filter data based on input text
searchBar.addEventListener("change", () => {
    const query = searchBar.value.toLowerCase();
    console.log("Search Query:", query); // Debugging line
    const filteredHorses = horses.filter(horse => 
        horse.name.toLowerCase().includes(query) || 
        horse.trainer.toLowerCase().includes(query)
    );

    // Display results
    resultsList.innerHTML = filteredHorses.map(horse => 
        `<li>${horse.name} - Trainer: ${horse.trainer}</li>`
    ).join("");
});

// Function to update horse details section
function updateHorseDetailsSection(starter) {
    document.getElementById('horse-name').textContent = starter.horse.name;
    document.getElementById('horse-age').textContent = starter.horse.age;
    document.getElementById('horse-sex').textContent = starter.horse.sex;
    document.getElementById('horse-shoes').textContent = makeShoeString(starter.horse.shoes);
    document.getElementById('horse-sulky').textContent = starter.horse.sulky.type.engText;
    document.getElementById('horse-trainer').textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
    
    document.getElementById('horse-details').classList.remove('hidden');
}

// Function to show horse details
function showHorseDetails(horse) {
    document.getElementById('popup-horse-name').innerText = horse.name;
    document.getElementById('popup-horse-age').innerText = horse.age;
    document.getElementById('popup-horse-sex').innerText = horse.sex;
    document.getElementById('popup-horse-shoes').innerText = horse.shoes;
    document.getElementById('popup-horse-sulky').innerText = horse.sulky;
    document.getElementById('popup-horse-trainer').innerText = horse.trainer;
    document.getElementById('popup-horse-number').innerText = horse.number;
    document.getElementById('popup-horse-distance').innerText = horse.distance;
    document.getElementById('horse-details-popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('horse-details-popup').style.display = 'none';
}

document.getElementById('ask-button').addEventListener('click', async () => {
    const question = document.getElementById('user-question').value;
    const tableData = JSON.parse(localStorage.getItem("starters")) || [];

    console.log("Question:", question); // Debugging line
    console.log("Table Data:", tableData); // Debugging line

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, tableData })
    });

    const data = await response.json();
    console.log("Response from server:", data); // Debugging line
    
    // Update the text here
    if (data.answer.includes("There are not enough drivers available this week.")) {
        data.answer = "Sorry, I can't provide information about the drivers participating in this week's races. However, I can help you with anything related to the horses or odds if you need it!";
    }
    
    document.getElementById('answer-box').innerText = data.answer;
});

function getTableData() {
    const table = document.getElementById('starters-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    const tableData = [];

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        const rowData = {};
        rowData.name = cells[0].innerText;
        rowData.age = cells[1].innerText;
        rowData.sex = cells[2].innerText;
        rowData.shoes = cells[3].innerText;
        rowData.sulky = cells[4].innerText;
        rowData.trainer = cells[5].innerText;
        rowData.number = cells[6].innerText;
        rowData.distance = cells[7].innerText;
        tableData.push(rowData);
    }

    return tableData;
}

// Example usage: Assuming you have a list of horses and you want to show details on click
document.querySelectorAll('#starters-table tbody tr').forEach(row => {
    row.addEventListener('click', () => {
        const horse = {
            name: row.cells[0].innerText,
            age: row.cells[1].innerText,
            sex: row.cells[2].innerText,
            shoes: row.cells[3].innerText,
            sulky: row.cells[4].innerText,
            trainer: row.cells[5].innerText,
            number: row.cells[6].innerText,
            distance: row.cells[7].innerText
        };
        showHorseDetails(horse);
    });
});

document.getElementById('ask-button').addEventListener('click', async () => {
    const question = document.getElementById('user-question').value;
    const tableData = Array.from(document.querySelectorAll('#starters-table tbody tr')).map(row => {
        return Array.from(row.cells).map(cell => cell.textContent);
    });

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, tableData })
    });

    const data = await response.json();
    document.getElementById('answer-box').innerText = data.answer;
});

document.addEventListener('DOMContentLoaded', () => {
    // Store table data in local storage
    const tableData = [];
    document.querySelectorAll('#starters-table tbody tr').forEach(row => {
        const rowData = {
            name: row.cells[0].textContent,
            age: row.cells[1].textContent,
            sex: row.cells[2].textContent,
            shoes: row.cells[3].textContent,
            sulky: row.cells[4].textContent,
            trainer: row.cells[5].textContent,
            number: row.cells[6].textContent,
            distance: row.cells[7].textContent
        };
        tableData.push(rowData);
    });
    localStorage.setItem('tableData', JSON.stringify(tableData));

    // Handle ask button click
    document.querySelector('#ask-button').addEventListener('click', () => {
        const question = document.querySelector('#user-question').value.toLowerCase();
        const tableData = JSON.parse(localStorage.getItem('tableData'));
        let answer = 'No relevant data found.';

        // Example logic to find relevant data based on the question
        tableData.forEach(row => {
            if (question.includes(row.name.toLowerCase())) {
                answer = `${row.name} is a ${row.age}-year-old ${row.sex} with ${row.shoes.toLowerCase()}. ` +
                         `They race in a ${row.sulky.toLowerCase()} sulky and their trainer is ${row.trainer}. ` +
                         `${row.name} is number ${row.number} and competes in a ${row.distance} race.`;
            }
        });

        // Display the answer
        document.querySelector('#answer').textContent = answer;
    });
});


