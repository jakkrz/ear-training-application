import { Link, useLocation } from "react-router-dom";
import { InputMethod } from "../../ConfigComponents";
import classes from "./PlayChordsByNamePage.module.css";

type Config = {
    diatonicOnly: boolean;
    inputMethod: InputMethod;
    collectAnalytics: boolean;
};

export default function PlayChordsByNamePage() {
    const location = useLocation();
    const state = location.state as Config;
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
import { invoke } from "@tauri-apps/api/tauri";

import Vex, {
    SVGContext,
    StaveNote,
    Voice,
    Formatter,
    Accidental,
} from "vexflow";
const { Renderer, Stave } = Vex.Flow;

import { listen } from "@tauri-apps/api/event";

type Note = string;

const TIME_BETWEEN_NOTES = 2000;
const TIME_BEFORE_FIRST_NOTE = 1000;

function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function choose<T>(choices: T[]): T {
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

type ChordStaveProps = {
    teacherChord: Note[];
    studentChord: Note[];
} & Config;

function getAccidentalsFromNote(note: string): string {
    const [baseNote, _octave] = note.split("/");
    return baseNote.slice(1);
}

function ChordStave({ teacherChord, studentChord }: ChordStaveProps) {
    const outputDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const outputDiv = outputDivRef.current!;
        const renderer = new Renderer(outputDiv, Renderer.Backends.SVG);

        renderer.resize(210, 120);

        const context = renderer.getContext() as SVGContext;
        const stave = new Stave(0, 0, 200);
        stave.addClef("treble").addTimeSignature("1/4");
        stave.setContext(context).draw();

        if (studentChord.length >= teacherChord.length) {
            const teacherVoice = new Voice({
                num_beats: 1,
                beat_value: 4,
            });

            const studentVoice = new Voice({
                num_beats: 1,
                beat_value: 4,
            });

            const teacherChordNote = new StaveNote({
                keys: teacherChord,
                duration: "q",
            });

            const studentChordNote = new StaveNote({
                keys: studentChord,
                duration: "q",
            });

            for (const [index, note] of teacherChord.entries()) {
                const accidentals = getAccidentalsFromNote(note);

                if (accidentals !== "") {
                    teacherChordNote.addModifier(
                        new Accidental(accidentals),
                        index,
                    );
                }
            }

            for (const [index, note] of studentChord.entries()) {
                const accidentals = getAccidentalsFromNote(note);

                if (accidentals !== "") {
                    studentChordNote.addModifier(
                        new Accidental(accidentals),
                        index,
                    );
                }

                console.log(teacherChord[index], studentChord[index]);

                if (
                    noteStringsAreEquivalent(
                        teacherChord[index],
                        studentChord[index],
                    )
                ) {
                    studentChordNote.noteHeads[index].setStyle({
                        fillStyle: "green",
                        strokeStyle: "green",
                    });
                } else {
                    studentChordNote.noteHeads[index].setStyle({
                        fillStyle: "red",
                        strokeStyle: "red",
                    });
                }
            }

            teacherVoice.addTickables([teacherChordNote]);
            studentVoice.addTickables([studentChordNote]);

            // the two voices are not "aware" of each other
            new Formatter()
                .joinVoices([studentVoice, teacherVoice])
                .format([studentVoice, teacherVoice], 445);

            // Render voice
            teacherVoice.draw(context, stave);
            studentVoice.draw(context, stave);
        }

        context.svg.style.height = "100%";
        // context.svg.style.width = "100%";
        context.svg.style.width = "300px";

        return () => context.svg.remove();
    }, [studentChord, teacherChord]);

    return (
        <div
            ref={outputDivRef}
            style={{ margin: "0 auto" }}
            className="notation-container thin"
        ></div>
    );
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
    const [noteName, octaveString] = noteString.split("/");
    const octave = Number(octaveString) + 1;

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

function chordsAreEquivalent(chordA: Note[], chordB: Note[]): boolean {
    if (chordA.length !== chordB.length) return false;

    for (const [index, note] of chordA.entries()) {
        if (!noteStringsAreEquivalent(note, chordB[index])) return false;
    }

    return true;
}

const chordTypes: [string, number, number][] = [
    ["", 4, 7],
    ["m", 3, 7],
    ["dim", 3, 6],
    ["aug", 4, 8],
    ["sus2", 2, 7],
    ["sus4", 5, 7],
];

function generateChord(): [string, Note[]] {
    const baseNote = Math.floor(getRandomArbitrary(60, 81));
    const [chordSuffix, note2Offset, note3Offset] = choose(chordTypes);
    console.log(baseNote, note2Offset, note3Offset);

    const chordName = pitchToNoteString(baseNote) + chordSuffix;
    const chord = [baseNote, baseNote + note2Offset, baseNote + note3Offset];
    const chordNotes = chord.map((item) => pitchToNoteString(item));

    return [chordName, chordNotes];
}

function Game(props: Config) {
    const [randomChordName, randomChord] = generateChord();
    const [teacherChord, setTeacherChord] = useState<Note[]>(randomChord);
    const [teacherChordName, setTeacherChordName] =
        useState<string>(randomChordName);
    console.log(teacherChord);
    const [studentChord, setStudentChord] = useState<Note[]>([]);
    const [gotCorrect, setGotCorrect] = useState(0);
    const [gotWrong, setGotWrong] = useState(0);
    const menuActivated = studentChord.length >= teacherChord.length;

    useEffect(() => {
        const unlistenPromise = listen(
            "onmidinoteon",
            (event: MidiNoteOnEvent) => {
                const pitch = event.payload.pitch;
                setStudentChord((studentChord) => {
                    const studentNotesPlayed = studentChord.length;
                    const teacherNotesPlayed = teacherChord.length;
                    if (studentNotesPlayed < teacherNotesPlayed) {
                        const newChord = [
                            ...studentChord,
                            pitchToNoteString(pitch),
                        ];

                        newChord.sort((a, b) => {
                            return noteStringToPitch(a) - noteStringToPitch(b);
                        });

                        return newChord;
                    } else {
                        return studentChord;
                    }
                });
            },
        );

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };
    }, [setTeacherChord]);

    function handleNextButtonClick() {
        const [randomChordName, randomChord] = generateChord();
        setTeacherChord(randomChord);
        setTeacherChordName(randomChordName);
        setStudentChord([]);
        if (chordsAreEquivalent(teacherChord, studentChord)) {
            setGotCorrect((x) => x + 1);
        } else {
            setGotWrong((x) => x + 1);
        }
    }

    useEffect(() => {
        function onKeyPress(evt: KeyboardEvent) {
            if (evt.code === "Space" && menuActivated) {
                if (evt.target === document.body) {
                    // prevent space bar scrolling page
                    evt.preventDefault();
                }

                handleNextButtonClick();
            }
        }
        document.addEventListener("keypress", onKeyPress);

        return () => document.removeEventListener("keypress", onKeyPress);
    }, [menuActivated]);

    return (
        <div className="game-container">
            <h2 className={classes.chordLabel}>{teacherChordName}</h2>
            <ChordStave
                teacherChord={teacherChord}
                studentChord={studentChord}
                {...props}
            />
            <div className="button-container">
                <button
                    disabled={!menuActivated}
                    onClick={handleNextButtonClick}
                >
                    Next (space)
                </button>
            </div>
            <div className="points-container">
                <span className="bold">Correct:</span> {gotCorrect}
                <br />
                <span className="bold">Wrong:</span> {gotWrong}
            </div>
        </div>
    );
}
