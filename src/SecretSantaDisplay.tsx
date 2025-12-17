import React, { useMemo, useState } from 'react';
import random from 'random';

const SEED: number = 10003;

export const SecretSantaDisplay: React.FC = () => {
    const [giverName, setGiverName] = useState<string>('');
    const [confirmedName, setConfirmedName] = useState<string | null>(null);
    const [submittedName, setSubmittedName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const normalizedOptions = useMemo(
        () => names.map((n) => ({ raw: n, norm: normalizeName(n) })),
        []
    );

    const receiver = useMemo(() => {
        if (!submittedName) return null;
        return getReciever(submittedName);
    }, [submittedName]);

    const validateAndMatch = (candidate: string) => {
        const trimmed = candidate.trim();
        if (!trimmed) return { ok: false as const, message: 'Please enter your name.' };

        const normCandidate = normalizeName(trimmed);
        const match = normalizedOptions.find((o) => o.norm === normCandidate)?.raw;
        if (!match) {
            return {
                ok: false as const,
                message: 'Name not found. Please check spelling or pick from the list.',
            };
        }

        return { ok: true as const, match };
    };

    const onNameSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const result = validateAndMatch(giverName);
        if (!result.ok) {
            setError(result.message);
            setConfirmedName(null);
            setSubmittedName(null);
            return;
        }

        setError(null);
        setConfirmedName(result.match);
        setSubmittedName(null);
    };

    const onConfirmIdentity = () => {
        if (!confirmedName) return;
        setSubmittedName(confirmedName);
    };

    const onChangeName = () => {
        setSubmittedName(null);
        setConfirmedName(null);
        setError(null);
    };

    // Step 1: Ask for name
    if (!confirmedName && !submittedName) {
        return (
            <div className="container">
                <h1>🎄 Secret Santa</h1>
                <p>Enter your name to see your assignment.</p>

                <form onSubmit={onNameSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Your name</span>
                        <input
                            value={giverName}
                            onChange={(e) => setGiverName(e.target.value)}
                            list="secret-santa-names"
                            autoComplete="off"
                            placeholder="Start typing…"
                        />
                        <datalist id="secret-santa-names">
                            {names.map((n) => (
                                <option key={n} value={n} />
                            ))}
                        </datalist>
                    </label>

                    {error ? (
                        <p role="alert" style={{ color: 'crimson', margin: 0 }}>
                            {error}
                        </p>
                    ) : null}

                    <button type="submit">Continue</button>
                </form>

                <p style={{ marginTop: 16 }}>Remember the budget is $25. Happy Gifting!</p>

                <div
                    style={{
                        position: 'fixed',
                        right: 12,
                        bottom: 12,
                        fontSize: 12,
                        opacity: 0.6,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                    aria-hidden="true"
                >
                    seed: {SEED}
                </div>
            </div>
        );
    }

    // Step 2: Confirm identity + funny warning
    if (confirmedName && !submittedName) {
        return (
            <div className="container">
                <h1>🕵️ Identity Check</h1>

                <p>
                    You typed: <strong>{confirmedName}</strong>
                </p>

                <div
                    style={{
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 12,
                        padding: 12,
                        maxWidth: 720,
                    }}
                >
                    <p style={{ marginTop: 0 }}>
                        Before we reveal your assignment, a quick reminder from the Department of Holiday
                        Integrity™:
                    </p>
                    <ul style={{ marginBottom: 0 }}>
                        <li>
                            Only click <strong>“Yes, that’s me”</strong> if you are truly{' '}
                            <strong>{confirmedName}</strong>.
                        </li>
                        <li>
                            Don’t go “just checking” other people’s names. That’s how the elves file a
                            complaint.
                        </li>
                        <li>
                            Snooping causes immediate side effects including: awkward eye contact at family
                            dinner and coal-flavored shame.
                        </li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <button type="button" onClick={onConfirmIdentity}>
                        Yes, that’s me — reveal my assignment
                    </button>
                    <button type="button" onClick={onChangeName}>
                        Oops, that’s not me
                    </button>
                </div>

                <p style={{ marginTop: 12, opacity: 0.85 }}>
                    Tip: If you’re on a shared device, don’t leave this page open unless you enjoy chaos.
                </p>
            </div>
        );
    }

    // Step 3: Show assignment
    return (
        <div className="container">
            <h1>🎄 Your Secret Santa Assignment!</h1>
            <p>
                Hello, <strong>{submittedName}</strong>!
            </p>
            <h2>You are the Secret Santa for:</h2>
            <div className="receiver-name-box">
                <p className="receiver-name">
                    <strong>{receiver ?? ''}</strong>
                </p>
            </div>

            <p>Remember the budget is $25. Happy Gifting!</p>

            <button type="button" onClick={onChangeName} style={{ marginTop: 12 }}>
                Start over (for honest reasons only)
            </button>


        </div>
    );
};

// ... existing code ...

const normalizeName = (s: string) =>
    s
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

// participants: Hardcoded list of names you mentioned
const names: string[] = [
    "John S",
    "Donna",
    "Jenny",
    "Elizabeth",
    "John P",
    "Jeanette",
    "Tina",
    "Jim",
    "Tim",
];


function getReciever(giver: string): string {
    let seed: number = SEED;

    random.use(seed);
    let shuffledNames = random.shuffle(names);

    // This loop ensures that no one is paired with themselves
    // It's a standard approach for this kind of "derangement" pairing
    while (names.some((name, i) => name === shuffledNames[i])) {
        seed = seed + 1;
        random.use(seed);
        shuffledNames = random.shuffle(names);
    }

    const inx = names.indexOf(giver);
    return shuffledNames[inx];
}

export default SecretSantaDisplay;