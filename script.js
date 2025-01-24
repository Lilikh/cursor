document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#data-table tbody');
    const searchInput = document.getElementById('search');
    let data = [];

    // Fetch data from the API
    async function fetchData() {
        try {
            const response = await fetch('https://your-api-endpoint.com/data'); // Replace with your actual API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Display data in the table
    function displayData(data) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.age}</td>
                <td>${item.sex}</td>
                <td>${item.shoes}</td>
                <td>${item.sulky}</td>
                <td>${item.trainer}</td>
            `;
            row.addEventListener('click', () => fetchOpenAIInfo(item));
            tableBody.appendChild(row);
        });
    }

    // Filter data based on search input
    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value.toLowerCase();
        const filteredData = data.filter(item => {
            return item.name && item.name.toLowerCase().includes(query);
        });
        populateTable(filteredData);
    });

    // Fetch more information about a selected entry
    async function fetchOpenAIInfo(item) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer YOUR_API_KEY`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant."
                        },
                        {
                            role: "user",
                            content: `Tell me more about the horse named ${item.name}.`
                        }
                    ],
                    max_tokens: 150
                })
            });

            const result = await response.json();
            if (response.ok) {
                document.getElementById('openai-response').innerText = result.choices[0].message.content;
            } else {
                console.error('Error from OpenAI API:', result);
            }
        } catch (error) {
            console.error('Error accessing OpenAI API:', error);
        }
    }

    function closePopup() {
        const popup = document.getElementById('popup'); // Replace with your actual popup element ID
        if (popup) {
            popup.style.display = 'none';
        }
    }

    fetchData();
}); 