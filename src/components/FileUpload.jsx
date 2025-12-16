import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, Loader2, FileText, Check } from 'lucide-react';
import { parseCSV, parseSimpleCSV } from '../utils/processor';

const FileSlot = ({ label, file, onChange, accept = ".csv", required = false }) => {
    return (
        <div style={{ marginBottom: '1rem', width: '100%' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                {label} {required && <span style={{ color: 'var(--accent-secondary)' }}>*</span>}
            </p>
            <div
                className="glass-panel"
                style={{
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: file ? '1px solid var(--accent-success)' : '1px solid var(--glass-border)',
                    background: file ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    {file ? (
                        <Check size={18} color="var(--accent-success)" />
                    ) : (
                        <FileSpreadsheet size={18} color="var(--text-muted)" />
                    )}
                    <span style={{
                        fontSize: '0.875rem',
                        color: file ? 'var(--text-primary)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {file ? file.name : "No file selected"}
                    </span>
                </div>
                <label
                    className="glass-card"
                    style={{
                        padding: '0.25rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'var(--accent-primary)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Browse
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => onChange(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
        </div>
    );
};

const FileUpload = ({ onDataLoaded }) => {
    const [juryFile, setJuryFile] = useState(null);
    const [groupFile, setGroupFile] = useState(null);
    const [responseFile, setResponseFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleProcess = async () => {
        if (!responseFile) {
            setError("Please upload the Responses CSV at minimum.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Parse Aux Lists
            let juryList = [];
            let groupList = [];

            if (juryFile) {
                juryList = await parseSimpleCSV(juryFile);
            }
            if (groupFile) {
                groupList = await parseSimpleCSV(groupFile);
            }

            // 2. Process Main Data
            const result = await parseCSV(responseFile, juryList, groupList);
            onDataLoaded(result);
        } catch (err) {
            console.error(err);
            setError('Failed to process. Please check your files.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async () => {
        // Trigger demo with empty lists (simulated inside processor via demo data string if we kept that valid, 
        // but since we are changing the flow, let's just use the demo string directly for responses)
        // For now, let's skip demo logic update or keep it simple.
        // To keep it simple for this step, I'll omit the demo complex logic and focus on the upload.
        // If user needs demo, I can add it back.

        // Re-implementing basic demo load
        setLoading(true);
        const demoData = `Timestamp,Email,JURY'S NAME,GROUP'S NAME,[Introduction],[Content / Explanation],[Organization / Flow],[Environmental Message (Go Green)],[Creativity & Innovation],[Presentation Delivery],[Audio Quality],[Visual Quality],Best Campus Solution Award:,Most Innovative Idea Award:,Best Presentation / Pitching:,[Impact on Sustainability],[Practicality & Feasibility],[Creativity & Originality],[Potential for Impact],[Clarity & Structure],[Delivery & Professionalism],[Engagement]
2024-01-01,test@test.com,Dr. Strange,EcoWarriors,4,3,4,4,3,4,3,3,Yes,No,Yes,4,4,3,3,4,4,4
2024-01-01,test@test.com,Dr. Strange,GreenTech,3,3,3,2,4,3,4,4,No,Yes,No,3,3,4,4,3,3,3`;

        try {
            const result = await parseCSV(demoData, [], []); // Empty aux lists for demo
            onDataLoaded(result);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ width: '100%', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Upload Data</h2>

                <FileSlot label="1. Jury List (Optional)" file={juryFile} onChange={setJuryFile} />
                <FileSlot label="2. Group Teams List (Optional)" file={groupFile} onChange={setGroupFile} />
                <FileSlot label="3. Responses / Scores (Required)" file={responseFile} onChange={setResponseFile} required />

                <button
                    onClick={handleProcess}
                    disabled={loading || !responseFile}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '1rem',
                        background: responseFile ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        color: responseFile ? '#000' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: responseFile ? 'pointer' : 'not-allowed',
                        fontWeight: 600,
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.875rem',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : "PROCESS DATA"}
                </button>
            </div>

            <button
                onClick={handleDemo}
                style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}
            >
                Or use Demo Data
            </button>

            {error && (
                <div className="glass-panel" style={{ marginTop: '1rem', padding: '1rem', borderColor: 'var(--accent-secondary)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
