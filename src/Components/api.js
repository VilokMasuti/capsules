

const API_URL = 'https://backend.cappsule.co.in/api/v1/new_search';

async function fetchData(searchTerm) {
  const url = `${API_URL}?q=${encodeURIComponent(searchTerm)}&pharmacyIds=1,2,3`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

export { fetchData };
