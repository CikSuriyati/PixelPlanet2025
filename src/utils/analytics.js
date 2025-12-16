import Papa from 'papaparse';

// Google Sheet "Form Responses 1" - GID 1439701893
const SHEET_ID = '1-AKRe1E59YFJ691pLalGro5XqmiJsAVe3ub1b6RYkMs';
// Using gviz endpoint for better CORS support for the main responses sheet
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1-AKRe1E59YFJ691pLalGro5XqmiJsAVe3ub1b6RYkMs/gviz/tq?tqx=out:csv&gid=1439701893';
const JURY_GID = '395492326';
const GROUP_GID = '1729657795';
const GROUP_SUMMARY_GID = '2021208955'; // New source for marks

const getCsvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

// Helper to fetch CSV text
const fetchCsv = async (gid) => {
    try {
        const response = await fetch(getCsvUrl(gid));
        if (!response.ok) throw new Error('Fetch failed');
        return await response.text();
    } catch (e) {
        console.warn(`Failed to fetch GID ${gid}`, e);
        return '';
    }
};

// Google Sheet IDs
// Responses: GID 1439701893
// Juries: GID 395492326
// Groups: GID 1729657795

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1-AKRe1E59YFJ691pLalGro5XqmiJsAVe3ub1b6RYkMs/gviz/tq?tqx=out:csv&gid=';

export const fetchAndParseData = async () => {
    const fetchSheet = async (gid) => {
        try {
            const response = await fetch(BASE_URL + gid);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            return new Promise((resolve) => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: (h) => h.trim(),
                    complete: (results) => resolve(results.data)
                });
            });
        } catch (err) {
            console.warn(`Failed to fetch GID ${gid}:`, err);
            return [];
        }
    };

    try {
        // Fetch in parallel but handle errors individually via the wrapper
        const [responsesData, juriesData, groupsData] = await Promise.all([
            fetchSheet('1439701893'), // Responses
            fetchSheet('395492326'),  // Juries
            fetchSheet('1729657795')  // Groups
        ]);

        // Process Evaluations
        const evaluations = responsesData.map((row, index) => {
            // ... (Same parsing logic as before) ...
            const scoreColumns = Object.keys(row).filter(key =>
                key.startsWith('[') && key.endsWith(']')
            );

            let totalScore = 0;
            let validScores = 0;

            scoreColumns.forEach(col => {
                const val = parseFloat(row[col]);
                if (!isNaN(val)) {
                    totalScore += val;
                    validScores++;
                }
            });

            const rowAverage = validScores > 0 ? (totalScore / validScores) : 0;

            return {
                id: index.toString(),
                jury: row["JURY'S NAME"] || 'Unknown Jury',
                groupNo: row["GROUP'S NAME"] || 'Unknown Group',
                rawScores: {},
                totalAverage: rowAverage,
                awards: {
                    campusNomination: (row['Best Campus Solution Award:  Does the solution directly address a campus-related sustainability issue in a meaningful way?'] || '').trim(),
                    innovationNomination: (row['Most Innovative Idea Award:  Is the idea creative, original, and not something commonly seen before?'] || '').trim(),
                    presentationNomination: (row['Best Presentation / Pitching:  Does the team deliver the message in a compelling and professional manner?'] || '').trim(),
                }
            };
        }).filter(item => item.groupNo && item.groupNo !== 'Unknown Group');

        return {
            evaluations,
            juryCount: juriesData.length,
            groupCount: groupsData.length
        };

    } catch (error) {
        console.error("Error fetching data:", error);
        // Return empty structure on error to avoid breaking destructuring
        return { evaluations: [], juryCount: 0, groupCount: 0 };
    }
};

export const calculateGroupAverages = (evaluations) => {
    const groupStats = {};

    evaluations.forEach((ev) => {
        const groupName = ev.groupNo;

        if (!groupStats[groupName]) {
            groupStats[groupName] = { totalScore: 0, count: 0 };
        }
        groupStats[groupName].totalScore += ev.totalAverage;
        groupStats[groupName].count += 1;
    });

    return Object.entries(groupStats).map(([groupNo, stats]) => ({
        groupNo,
        averageScore: Number((stats.totalScore / stats.count).toFixed(2))
    })).sort((a, b) => b.averageScore - a.averageScore);
};

export const getAwardFinalists = (evaluations) => {
    // Collect unique finalists for each category
    const campusFinalists = new Set();
    const innovationFinalists = new Set();
    const presentationFinalists = new Set();

    evaluations.forEach(ev => {
        // If the jury said "Yes", add this group to the finalists
        if (ev.awards.campusNomination.toLowerCase() === 'yes') {
            campusFinalists.add(ev.groupNo);
        }
        if (ev.awards.innovationNomination.toLowerCase() === 'yes') {
            innovationFinalists.add(ev.groupNo);
        }
        if (ev.awards.presentationNomination.toLowerCase() === 'yes') {
            presentationFinalists.add(ev.groupNo);
        }
    });

    return [
        {
            name: 'Best Campus Solution',
            finalists: Array.from(campusFinalists),
            fill: '#10b981',
            icon: '🌍'
        },
        {
            name: 'Most Innovative Idea',
            finalists: Array.from(innovationFinalists),
            fill: '#3b82f6',
            icon: '💡'
        },
        {
            name: 'Best Presentation',
            finalists: Array.from(presentationFinalists),
            fill: '#f59e0b',
            icon: '🎤'
        }
    ];
};

export const getCompletionStats = (evaluations, totalGroups, totalJuries) => {
    // If we have counts from tabs, use them. Otherwise fallback to unique sets (legacy)
    const groups = totalGroups || new Set(evaluations.map(e => e.groupNo)).size;
    const juries = totalJuries || new Set(evaluations.map(e => e.jury)).size;

    // Calculate Progress based on available totals
    // Rule: Each group is judged by strictly 2 juries.
    const completedEvaluations = evaluations.length;
    const expectedTotal = groups * 2;

    const percentage = expectedTotal > 0 ? Math.round((completedEvaluations / expectedTotal) * 100) : 0;

    return {
        totalGroups: groups,
        totalJuries: juries,
        progressPercentage: Math.min(100, percentage),
        completedEvaluations
    };
};
