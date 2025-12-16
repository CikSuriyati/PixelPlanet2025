import Papa from 'papaparse';
import { processData } from './processor';

// Extracted from user's analytics.js
const SHEET_ID = '1-AKRe1E59YFJ691pLalGro5XqmiJsAVe3ub1b6RYkMs';

// KNOWN GIDs
const RESPONSES_GID = '1439701893';
const JURY_GID = '2021208955'; // User provided via link
const GROUP_GID = ''; // Waiting for user input

const getCsvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

const fetchCsv = (gid) => {
    if (!gid) return Promise.resolve([]);

    return fetch(getCsvUrl(gid))
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch sheet (gid: ${gid})`);
            return response.text();
        })
        .then(csvText => {
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([]) // Fail gracefully with empty list
                });
            });
        });
};

export const fetchLiveSheetData = async () => {
    try {
        const [responses, juryList, groupList] = await Promise.all([
            fetchCsv(RESPONSES_GID),
            fetchCsv(JURY_GID),
            fetchCsv(GROUP_GID)
        ]);

        // Use the existing powerful processor logic
        // We pass empty arrays for jury/group if GIDs are missing, which is handled gracefully by processData
        return processData(responses, [], juryList, groupList);

    } catch (error) {
        console.error("Sheet Fetch Error:", error);
        throw error;
    }
};
