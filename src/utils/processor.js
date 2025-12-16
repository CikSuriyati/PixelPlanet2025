import Papa from 'papaparse';

// Helper to clean headers
const cleanHeader = (h) => h.trim().toLowerCase();

const GENERAL_RUBRIC = [
    '[Introduction]',
    '[Content / Explanation]',
    '[Organization / Flow]',
    '[Environmental Message (Go Green)]',
    '[Creativity & Innovation]',
    '[Presentation Delivery]',
    '[Audio Quality]',
    '[Visual Quality]'
];

const AWARDS_CFG = [
    {
        id: 'campus',
        name: 'Best Campus Solution',
        triggerColumn: 'Best Campus Solution Award:',
        rubric: ['[Impact on Sustainability]', '[Practicality & Feasibility]']
    },
    {
        id: 'innovation',
        name: 'Most Innovative Idea',
        triggerColumn: 'Most Innovative Idea Award:',
        rubric: ['[Creativity & Originality]', '[Potential for Impact]']
    },
    {
        id: 'presentation',
        name: 'Best Presentation / Pitching',
        triggerColumn: 'Best Presentation / Pitching:',
        rubric: ['[Clarity & Structure]', '[Delivery & Professionalism]', '[Engagement]']
    }
];

export const parseCSV = (file, juryList = [], groupList = []) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const stats = processData(results.data, results.meta.fields, juryList, groupList);
                    resolve(stats);
                } catch (e) {
                    reject(e);
                }
            },
            error: (err) => reject(err)
        });
    });
};

export const parseSimpleCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
        });
    });
};

const calcAverage = (row, columns) => {
    let sum = 0;
    let count = 0;

    columns.forEach(col => {
        // fuzzy match the column in row
        const rowKey = Object.keys(row).find(k => k.toLowerCase().includes(col.toLowerCase().replace('[', '').replace(']', '')));
        const val = parseFloat(row[rowKey || col]);
        if (!isNaN(val)) {
            sum += val;
            count++;
        }
    });

    return count === 0 ? 0 : (sum / count);
};

const processData = (rows, headers, juryList = [], groupList = []) => {
    const groups = {}; // Map<GroupName, { scores: [], awardNominations: {} }>
    const juries = new Set();

    // 1. First Pass: Aggregate Scores per Group
    rows.forEach(row => {
        const groupName = row["GROUP'S NAME"]?.trim();
        const juryName = row["JURY'S NAME"]?.trim();

        if (!groupName || !juryName) return;

        juries.add(juryName);

        if (!groups[groupName]) {
            groups[groupName] = {
                name: groupName,
                rawScores: [],
                awards: {
                    campus: { yes: 0, scores: [] },
                    innovation: { yes: 0, scores: [] },
                    presentation: { yes: 0, scores: [] }
                }
            };
        }

        // General Score
        const generalScore = calcAverage(row, GENERAL_RUBRIC);
        groups[groupName].rawScores.push(generalScore);

        // Awards Processing
        AWARDS_CFG.forEach(award => {
            // Find the trigger column (fuzzy match)
            const triggerKey = Object.keys(row).find(k => k.toLowerCase().startsWith(award.triggerColumn.toLowerCase().substring(0, 10)));
            const isQualified = row[triggerKey]?.toString().toLowerCase().includes('yes');

            if (isQualified) {
                groups[groupName].awards[award.id].yes += 1;
                const awardScore = calcAverage(row, award.rubric);
                groups[groupName].awards[award.id].scores.push(awardScore);
            }
        });
    });

    // 2. Second Pass: Calculate Final Averages
    const rankedGroups = Object.values(groups).map(g => {
        const avgScore = g.rawScores.reduce((a, b) => a + b, 0) / g.rawScores.length;

        return {
            ...g,
            avgGeneralScore: avgScore,
            // Helper for display
            formattedScore: avgScore.toFixed(2)
        };
    }).sort((a, b) => b.avgGeneralScore - a.avgGeneralScore); // Rank by General Score

    // 3. Stats
    // Use provided lists if available, otherwise fallback to discovered entities
    const totalGroups = groupList.length > 0 ? groupList.length : Object.keys(groups).length;
    const totalJury = juryList.length > 0 ? juryList.length : juries.size;

    // Estimate completion
    const totalJudgements = rows.length;
    const estimatedTotal = totalGroups * totalJury;
    const completionPct = estimatedTotal > 0 ? Math.round((totalJudgements / estimatedTotal) * 100) : 0;

    // 4. Award Stats
    const awardStats = AWARDS_CFG.map(award => {
        // Count groups that have at least 1 qualification (or maybe > 50%? Let's stick to >0 for now)
        const qualifiedGroups = rankedGroups
            .filter(g => g.awards[award.id].yes > 0)
            .map(g => ({
                name: g.name,
                votes: g.awards[award.id].yes,
                avgAwardScore: g.awards[award.id].scores.length > 0
                    ? (g.awards[award.id].scores.reduce((a, b) => a + b, 0) / g.awards[award.id].scores.length)
                    : 0
            }))
            .sort((a, b) => b.avgAwardScore - a.avgAwardScore); // Rank qualified groups by their award specific score

        return {
            id: award.id,
            name: award.name,
            qualifiedCount: qualifiedGroups.length,
            rankings: qualifiedGroups
        };
    });

    return {
        leaderboard: rankedGroups,
        stats: {
            totalGroups,
            totalJury,
            completionPct,
            totalJudgements
        },
        awards: awardStats
    };
};
