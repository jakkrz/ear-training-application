import { Link, useLocation } from "react-router-dom";
import { InputMethod } from "../../ConfigComponents";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";

interface Config {
    inputMethod: InputMethod;
}

export default function StaffWarsPage() {
    let location = useLocation();
    let state = location.state as Config;
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (typeof state.inputMethod == "number") {
            invoke("connect_input", { portN: state.inputMethod });
        }

        setConnected(true);

        return () => {
            invoke("disconnect_input");
        };
    }, [state]);

    return (
        <>
            <Link to={"/train"} className="return-button">
                go back to training
            </Link>
            {connected && <Game {...state} />}
        </>
    );
}

import { useState, useEffect, useRef } from "react";

import {
    SVGContext,
    StaveNote,
    Voice,
    Formatter,
    Accidental,
    Stave,
    Renderer,
    StaveConnector,
} from "vexflow";

type Note = string;
type NoteWithCreationTick = [number, Note];

const TICK_SPAN = 2000;

function getAccidentalsFromNote(note: string): string {
    let [baseNote, _octave] = note.split("/");
    return baseNote.slice(1);
}

function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRhNote(): Note {
    return pitchToNoteString(randomInteger(57, 84));
}

function generateLhNote(): Note {
    return pitchToNoteString(randomInteger(36, 64));
}

const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => {
            if (savedCallback.current !== undefined) {
                savedCallback.current();
            }
        };
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

const ACCELERATION = 0.00005;
type GameState = "playing" | "gameOver";

function purgeListOfNote(
    notes: NoteWithCreationTick[],
    noteToPurge: Note,
): [NoteWithCreationTick[], boolean] {
    let resultList: NoteWithCreationTick[] = [];
    let purgedSomething = false;

    for (const noteWithCreationTick of notes) {
        let [_, note] = noteWithCreationTick;

        if (noteStringsAreEquivalent(note, noteToPurge)) {
            console.log("p");
            purgedSomething = true;
        } else {
            resultList = [...resultList, noteWithCreationTick];
        }
    }

    return [resultList, purgedSomething];
}

function Game(props: any) {
    let [ticks, setTicks] = useState(0);
    let ticksRef = useRef(0);
    let [rhNotes, setRhNotes] = useState<NoteWithCreationTick[]>([]);
    let [lhNotes, setLhNotes] = useState<NoteWithCreationTick[]>([]);
    let [noteSpeed, setNoteSpeed] = useState(1);
    let [livesRemaining, setLivesRemaining] = useState(3);
    let [gameState, setGameState] = useState<GameState>("playing");

    function loseLife() {
        setLivesRemaining((lives) => lives - 1);
        console.log(livesRemaining - 1);
        if (livesRemaining - 1 <= 0) {
            setGameState("gameOver");
            setRhNotes([]);
            setLhNotes([]);
        }
    }

    useEffect(() => {
        if (gameState == "playing") {
            let unlistenPromise = listen(
                "onmidinoteon",
                (event: MidiNoteOnEvent) => {
                    if (gameState == "playing") {
                        let pitch = event.payload.pitch;
                        let notePlayed = pitchToNoteString(pitch);

                        const [newRhNotes, purgedSomethingRh] = purgeListOfNote(
                            rhNotes,
                            notePlayed,
                        );
                        setRhNotes(newRhNotes);

                        const [newLhNotes, purgedSomethingLh] = purgeListOfNote(
                            lhNotes,
                            notePlayed,
                        );
                        setLhNotes(newLhNotes);

                        console.log(purgedSomethingRh, purgedSomethingLh);

                        if (!(purgedSomethingRh || purgedSomethingLh)) {
                            loseLife();
                        }
                    }
                },
            );

            return () => {
                unlistenPromise.then((unlisten) => unlisten());
            };
        }
    }, [gameState, livesRemaining, rhNotes, lhNotes]);

    useInterval(() => {
        if (gameState !== "gameOver") {
            let nextTick = ticks + noteSpeed;
            setTicks(nextTick);
            ticksRef.current = nextTick;
            setNoteSpeed((noteSpeed) => noteSpeed + ACCELERATION);

            let rhNotesWereFilteredOut = false;
            let filteredRhNotes: NoteWithCreationTick[] = [];

            for (const note of rhNotes) {
                const [creationTick, _] = note;
                if (nextTick - creationTick > TICK_SPAN) {
                    rhNotesWereFilteredOut = true;
                } else {
                    filteredRhNotes = [...filteredRhNotes, note];
                }
            }

            setRhNotes(filteredRhNotes);

            let lhNotesWereFilteredOut = false;
            let filteredLhNotes: NoteWithCreationTick[] = [];

            for (const note of lhNotes) {
                const [creationTick, _] = note;
                if (nextTick - creationTick > TICK_SPAN) {
                    lhNotesWereFilteredOut = true;
                } else {
                    filteredLhNotes = [...filteredLhNotes, note];
                }
            }

            setLhNotes(filteredLhNotes);

            if (rhNotesWereFilteredOut || lhNotesWereFilteredOut) {
                loseLife();
            }
        }
    }, 1);

    useInterval(() => {
        if (gameState !== "gameOver") {
            if (Math.random() < 0.5) {
                setRhNotes((rhNotes) => [
                    ...rhNotes,
                    [ticksRef.current, generateRhNote()],
                ]);
            } else {
                setLhNotes((lhNotes) => [
                    ...lhNotes,
                    [ticksRef.current, generateLhNote()],
                ]);
            }
        }
    }, 3000);

    let points = Math.floor(ticks * 0.01);

    function onRestartButtonClick() {
        setTicks(0);
        ticksRef.current = 0;
        setNoteSpeed(1);
        setLivesRemaining(3);
        setGameState("playing");
    }

    return (
        <>
            <div className="game-container">
                {gameState == "gameOver" && <h1>Game Over!</h1>}
                <NoteStave
                    rhNotes={rhNotes}
                    lhNotes={lhNotes}
                    ticks={ticks}
                    {...props}
                />
                <div className="button-container">
                    <button
                        disabled={gameState == "playing"}
                        onClick={onRestartButtonClick}
                    >
                        Restart
                    </button>
                </div>
                <div className="points-container">
                    <span className="bold">Lives remaining:</span>{" "}
                    {livesRemaining}
                    <br />
                    <span className="bold">Note Speed:</span>{" "}
                    {noteSpeed.toPrecision(4)}
                    <br />
                    <span className="bold">Points:</span> {points}
                </div>
            </div>
        </>
    );
}

type NoteWithPositionSpecifier = [number, Note];
type ClefType = "treble" | "bass";

function createNoteVoice(
    note: Note,
    shiftXPercent: number,
    staveWidth: number,
    clefType: ClefType,
) {
    // Create a voice in 4/4 and add above notes
    const voice = new Voice({ num_beats: 1, beat_value: 4 });
    let accidentals = getAccidentalsFromNote(note);
    let staveNote = new StaveNote({
        clef: clefType,
        keys: [note],
        duration: "q",
    });

    if (accidentals !== "") {
        staveNote.addModifier(new Accidental(accidentals));
    }

    voice.addTickables([staveNote]);

    new Formatter().joinVoices([voice]).format([voice], staveWidth);
    staveNote.getTickContext().setX(staveWidth * shiftXPercent);

    return voice;
}

function drawNotesOnStaveContextAtProgression(
    notes: NoteWithPositionSpecifier[],
    context: SVGContext,
    stave: Stave,
    clefType: ClefType,
) {
    for (const [progression, note] of notes) {
        createNoteVoice(note, 1 - progression, 510, clefType).draw(
            context,
            stave,
        );
    }
}

type NoteStaveProps = {
    rhNotes: NoteWithCreationTick[];
    lhNotes: NoteWithCreationTick[];
    ticks: number;
};

function NoteStave({ rhNotes, lhNotes, ticks }: NoteStaveProps) {
    const outputDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const outputDiv = outputDivRef.current!;
        const renderer = new Renderer(outputDiv, Renderer.Backends.SVG);

        renderer.resize(600, 200);
        const context = renderer.getContext() as SVGContext;

        const rhStave = new Stave(20, 0, 570);
        rhStave.addClef("treble");
        rhStave.setContext(context).draw();

        const lhStave = new Stave(20, 80, 570);
        lhStave.addClef("bass");
        lhStave.setContext(context).draw();

        const brace = new StaveConnector(rhStave, lhStave);
        brace.setType(StaveConnector.type.BRACE);
        brace.setContext(context).draw();

        let rhNotesWithPositionSpecifier: NoteWithPositionSpecifier[] = [];

        for (const noteWithCreationTick of rhNotes) {
            const [creationTick, currentNote] = noteWithCreationTick;

            let positionSpecifier = (ticks - creationTick) / TICK_SPAN;
            let noteWithPositionSpecifier: NoteWithPositionSpecifier = [
                positionSpecifier,
                currentNote,
            ];
            rhNotesWithPositionSpecifier = [
                ...rhNotesWithPositionSpecifier,
                noteWithPositionSpecifier,
            ];
        }

        drawNotesOnStaveContextAtProgression(
            rhNotesWithPositionSpecifier,
            context,
            rhStave,
            "treble",
        );

        let lhNotesWithPositionSpecifier: NoteWithPositionSpecifier[] = [];

        for (const noteWithCreationTick of lhNotes) {
            const [creationTick, currentNote] = noteWithCreationTick;

            let positionSpecifier = (ticks - creationTick) / TICK_SPAN;
            let noteWithPositionSpecifier: NoteWithPositionSpecifier = [
                positionSpecifier,
                currentNote,
            ];
            lhNotesWithPositionSpecifier = [
                ...lhNotesWithPositionSpecifier,
                noteWithPositionSpecifier,
            ];
        }

        drawNotesOnStaveContextAtProgression(
            lhNotesWithPositionSpecifier,
            context,
            lhStave,
            "bass",
        );

        context.beginPath();
        context.moveTo(80, 40);
        context.lineTo(80, 160);
        context.lineWidth = 2;
        context.stroke();

        context.svg.style.height = "100%";
        context.svg.style.width = "100%";

        return () => context.svg.remove();
    }, [ticks]);

    return <div ref={outputDivRef} className="notation-container"></div>;
}

const mapOffsetToNoteUsingSharps = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];
const mapOffsetToNoteUsingFlats = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
];
const USE_SHARPS = true;

function noteStringsAreEquivalent(
    noteStringA: string | undefined,
    noteStringB: string | undefined,
): boolean {
    if (noteStringA !== undefined && noteStringB !== undefined) {
        return (
            noteStringToPitch(noteStringA) === noteStringToPitch(noteStringB)
        );
    }

    return false;
}

function pitchToNoteString(pitch: number): string {
    let octave = Math.floor(pitch / 12);
    let offset = pitch % 12;
    let noteName = "";

    if (USE_SHARPS) {
        noteName = mapOffsetToNoteUsingSharps[offset];
    } else {
        noteName = mapOffsetToNoteUsingFlats[offset];
    }

    let noteString = `${noteName}/${octave - 1}`;

    return noteString;
}

function noteStringToPitch(noteString: string): number {
    let [noteName, octaveString] = noteString.split("/");
    let octave = Number(octaveString) + 1;

    let offset = mapOffsetToNoteUsingSharps.indexOf(noteName);
    offset =
        offset !== -1 ? offset : mapOffsetToNoteUsingFlats.indexOf(noteName);

    if (offset === -1) {
        throw new Error(`Could not decode ${noteString} to pitch`);
    }

    return octave * 12 + offset;
}

interface MidiNoteOnEvent {
    payload: {
        pitch: number;
        velocity: number;
        channel: number;
    };
}
