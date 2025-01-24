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
    const proms = races.map(race => getSectionInfo(race));
    const sectionInfos = await Promise.all(proms);
    const starters = sectionInfos.flatMap(sectionInfo => sectionInfo.starts);
    return starters;
}

// Main function to fetch and store starters in localStorage.
async function main() {
    const starters = await getStarters("2025-01-25");
    localStorage.setItem("starters", JSON.stringify(starters));
    populateStartersTable(starters); // Populate the table initially
}
main();

// Function to fetch starters from localStorage.
function fetchStartersFromLocalStorage() {
    return JSON.parse(localStorage.getItem("starters")) || [];
}

// Function to populate the table with all starters.
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

// Function to fetch details of a specific starter by horse name.
function getStarterDetails(horseName) {
    const starters = fetchStartersFromLocalStorage();
    const starter = starters.find(starter => starter.horse.name.toLowerCase() === horseName.toLowerCase());

    if (starter) {
        updateStarterInfo(starter);
    } else {
        console.error("No matching starter found for horse name:", horseName);
    }
    return starter;
}

// Example function to update horse info.
function updateStarterInfo(starter) {
    const horseNameElement = document.getElementById('horse-name');
    const horseAgeElement = document.getElementById('horse-age');
    const horseSexElement = document.getElementById('horse-sex');
    const horseShoesElement = document.getElementById('horse-shoes');
    const horseSulkyElement = document.getElementById('horse-sulky');
    const horseTrainerElement = document.getElementById('horse-trainer');

    horseNameElement.textContent = starter.horse.name;
    horseAgeElement.textContent = starter.horse.age;
    horseSexElement.textContent = starter.horse.sex;
    horseShoesElement.textContent = makeShoeString(starter.horse.shoes);
    horseSulkyElement.textContent = starter.horse.sulky.type.engText;
    horseTrainerElement.textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
}

// Function to update the table dynamically based on search input.
function searchStarters() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const starters = fetchStartersFromLocalStorage();
    const filteredStarters = starters.filter(starter => {
        const horseName = starter.horse.name.toLowerCase();
        const trainerName = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`.toLowerCase();
        return horseName.includes(searchInput) || trainerName.includes(searchInput);
    });
    populateStartersTable(filteredStarters);
}

// Utility function to convert shoe data to a string.
function makeShoeString(shoes) {
    return shoes ? "Shoes On" : "Shoes Off";
}

// Add event listener for search input.
document.getElementById('search-input').addEventListener('input', searchStarters);

// Add row click listeners for showing horse details.
function addRowClickListeners() {
    const rows = document.querySelectorAll('#starters-table tbody tr');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const horseName = row.cells[0].textContent;
            const starter = getStarterDetails(horseName);
            if (starter) {
                showHorseDetailsPopup(starter);
            }
        });
    });
}

// Function to show horse details in a popup.
function showHorseDetailsPopup(starter) {
    const popupHorseName = document.getElementById('popup-horse-name');
    const popupHorseAge = document.getElementById('popup-horse-age');
    const popupHorseSex = document.getElementById('popup-horse-sex');
    const popupHorseShoes = document.getElementById('popup-horse-shoes');
    const popupHorseSulky = document.getElementById('popup-horse-sulky');
    const popupHorseTrainer = document.getElementById('popup-horse-trainer');
    const popupHorseNumber = document.getElementById('popup-horse-number');
    const popupHorseDistance = document.getElementById('popup-horse-distance');

    popupHorseName.textContent = starter.horse.name;
    popupHorseAge.textContent = starter.horse.age;
    popupHorseSex.textContent = starter.horse.sex;
    popupHorseShoes.textContent = makeShoeString(starter.horse.shoes);
    popupHorseSulky.textContent = starter.horse.sulky.type.engText;
    popupHorseTrainer.textContent = `${starter.horse.trainer.firstName} ${starter.horse.trainer.lastName}`;
    popupHorseNumber.textContent = starter.number;
    popupHorseDistance.textContent = `${starter.distance}m`;

    document.getElementById('horse-details-popup').classList.remove('hidden');
}

// Close the popup when the close button is clicked.
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('horse-details-popup').classList.add('hidden');
});
