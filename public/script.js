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
}     
);

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

    document.getElementById('horse-name').textContent = starter.horse.name;
    document.getElementById('horse-age').textContent = starter.horse.age;
    document.getElementById('horse-sex').textContent = starter.horse.sex;
    document.getElementById('horse-shoes').textContent = makeShoeString(starter.horse.shoes);
    document.getElementById('horse-sulky').textContent = starter.horse.sulky.type.engText;
    document.getElementById('horse-trainer').textContent = starter.horse.trainer.firstName + " " + starter.horse.trainer.lastName;
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
}

function showHorseDetailsPopup(starter) {
    const popup = document.getElementById('horse-details-popup');
    document.getElementById('popup-horse-name').textContent = starter.horse.name;
    document.getElementById('popup-horse-age').textContent = starter.horse.age;
    document.getElementById('popup-horse-sex').textContent = starter.horse.sex;
    document.getElementById('popup-horse-shoes').textContent = makeShoeString(starter.horse.shoes);
    document.getElementById('popup-horse-sulky').textContent = starter.horse.sulky.type.engText;
    document.getElementById('popup-horse-trainer').textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
    
    popup.classList.remove('hidden');
}

document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('horse-details-popup').classList.add('hidden');
});

// Function to search for horses by name or trainer
function searchStarters() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const starters = JSON.parse(localStorage.getItem("starters")) || [];
    
    // Filter starters based on horse name or trainer name
    const filteredStarters = starters.filter(starter => {
        const horseName = starter.horse.name.toLowerCase();
        const trainerName = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`.toLowerCase();
        
        // Check if the search input matches either the horse name or the trainer name
        return horseName.includes(searchInput) || trainerName.includes(searchInput);
    });
    
    // Update the table immediately with filtered results
    populateStartersTable(filteredStarters);
}
console.log('filteredStarters', filteredStarters);


// Add event listener for the search button
document.getElementById('search-button').addEventListener('click', searchStarters);

// Add event listener for input changes
document.getElementById('search-input').addEventListener('input', searchStarters);
console.log('search input', searchInput);


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

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️'; // Sun icon for light mode
    } else {
        themeIcon.textContent = '🌙'; // Moon icon for dark mode
    }
});

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
searchBar.addEventListener("input", () => {
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


