export const SIMKL_CONFIG = {
  CLIENT_ID: process.env.SIMKL_CLIENT_ID || '52b210ec7ba7c359ac409dc042cec0af33aff9e31ba22f382f675d0a54fa8d32',
  BASE_URL: process.env.SIMKL_BASE_URL || 'https://api.simkl.com',
};

/**
 * Helper to fetch data from Simkl API
 */
export const fetchFromSimkl = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${SIMKL_CONFIG.BASE_URL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'simkl-api-key': SIMKL_CONFIG.CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`Simkl API Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('⚠️ Simkl API Error:', error.message);
    throw error;
  }
};
