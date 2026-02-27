
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
                m_gender: [],
                m_religion: [],
                m_marital_status:[],
                m_educational_qualification :[],
                m_occupation :[],
                m_relation : [],
                m_course_type :[],
                m_mode_of_study :[],
                m_admission_status :[],
                m_perpose_loan: [],
                m_property_type : [],
                m_document_type : [],
                m_units : []
            }
        };
    }
};

const fetchTalukas = async ({ district_id, state_id, country_id }) => {
    console.log("fetchTalukas called");

    try {
        const query = new URLSearchParams({
            district_id,
            state_id,
            country_id
        }).toString();

        const response = await fetch(`/api/getTalukas?${query}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Taluka API response:", result);

        return result;

    } catch (e) {
        console.error("fetchTalukas failed:", e);

        return {
            error: -2,
            errorMsg: e.message || 'Failed to fetch talukas',
            talukas: []
        };
    }
};

const featchStreams = async ({ course_id }) => {
    console.log("featchStreams called");

    try {
        const query = new URLSearchParams({
            course_id
        }).toString();

        const response = await fetch(`/api/getStream?${query}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Stream API response:", result);

        return result;

    } catch (e) {
        console.error("featchStreams failed:", e);

        return {
            error: -2,
            errorMsg: e.message || 'Failed to fetch Streams',
            streams: []
        };
    }
};

export {
    fetchMasters,
    fetchTalukas,
    featchStreams
};