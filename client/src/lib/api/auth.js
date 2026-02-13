
const fetchMasters = async () => {
    console.log("fetchMasters called");
    
    try {
        const response = await fetch('/api/masters', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Masters API response:", result);
        
        return result;

    } catch (e) {
        console.error("fetchMAsters failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to fetch MAsters',
            masters: {
                m_district: [],
                m_gender:[]
            }
        };
    }
};



export {
    fetchMasters,
};