import { useState, useEffect, useRef } from "react";
import { exit } from '@tauri-apps/api/process';

import Vex, { SVGContext, StaveNote, GhostNote, Voice, Formatter, NoteStruct, Accidental } from "vexflow";
const { Renderer, Stave } = Vex.Flow;

import { listen } from "@tauri-apps/api/event";

// type GameState = "PlayingSounds" | "ReceivingNotes" | "AwaitingRestart";

type Note = string;

const NOTE_SEQUENCE_LENGTH = 5;
const TIME_BETWEEN_NOTES = 4000;
const STARTING_NOTE = "C/4"

function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function generateNoteSequence(sequenceLength = NOTE_SEQUENCE_LENGTH): Note[] {
    let result: Note[] = [STARTING_NOTE];
    let prevNote = STARTING_NOTE;

    for (let i = 1; i < sequenceLength; i++) {
        let prevNotePitch = noteStringToPitch(prevNote);
        let lowerBound = Math.min(60, prevNotePitch - 4);
        let upperBound = Math.min(81, prevNotePitch + 4)
        let newPitch = getRandomArbitrary(lowerBound, upperBound);
        let noteToAdd = pitchToNoteString(newPitch);
        result.push(noteToAdd);
        prevNote = noteToAdd;
    }
    
    return result;
}

interface NoteRecognitionStaveProps {
    teacherNotes: Note[]
    studentNotes: Note[]
};

function getAccidentalsFromNote(note: string): string {
    let [baseNote, _octave] = note.split("/");
    return baseNote.slice(1);
}

function NoteRecognitionStave({ teacherNotes, studentNotes }: NoteRecognitionStaveProps) {
    const outputDivRef = useRef<HTMLDivElement>(null);
    let studentNotesPlayed = studentNotes.length;

    useEffect(() => {
        const outputDiv = outputDivRef.current!;
        const renderer = new Renderer(outputDiv, Renderer.Backends.SVG);

        renderer.resize(500, 100);
        const context = renderer.getContext() as SVGContext;

        const stave = new Stave(0, 0, 495);
        stave.addClef("treble").addTimeSignature(`${NOTE_SEQUENCE_LENGTH}/4`);
        stave.setContext(context).draw();

        const teacherVoice = new Voice({ num_beats: NOTE_SEQUENCE_LENGTH, beat_value: 4 });
        const teacherNoteStructs: NoteStruct[] = teacherNotes.map((note) => {
            return { keys: [note], duration: "q" }
        });

        const teacherNotesToDraw = teacherNoteStructs.map((struct, index) => {
            let note = index < studentNotesPlayed ? new StaveNote(struct) : new GhostNote(struct);
            let accidentals = getAccidentalsFromNote(teacherNotes[index]);

            if (accidentals !== "") {
                note.addModifier(new Accidental(accidentals));
            }

            return note;
        })

        const studentVoice = new Voice({ num_beats: NOTE_SEQUENCE_LENGTH, beat_value: 4 });
        const studentVoiceNoteStructs: NoteStruct[] = [...studentNotes.map((note) => {
            return { keys: [note], duration: "q" }
        }), ...Array(NOTE_SEQUENCE_LENGTH - studentNotesPlayed).fill({ duration: "q" })];

        const studentNotesToDraw = studentVoiceNoteStructs.map((struct, index) => {
            let note = index < studentNotesPlayed ? new StaveNote(struct) : new GhostNote(struct);

            if (teacherNotes[index] == studentNotes[index]) {
                note.setStyle({fillStyle: "green", strokeStyle: "green"});
            } else {
                note.setStyle({fillStyle: "red", strokeStyle: "red"});
            }

            let accidentals = getAccidentalsFromNote(studentNotes[index]);            

            if (accidentals !== "") {
                note.addModifier(new Accidental(accidentals));
            }

            return note;
        })

        teacherVoice.addTickables(teacherNotesToDraw);
        studentVoice.addTickables(studentNotesToDraw);

        // the two voices are not "aware" of each other
        new Formatter().joinVoices([studentVoice, teacherVoice]).format([studentVoice, teacherVoice], 445);

        // Render voice
        teacherVoice.draw(context, stave);
        studentVoice.draw(context, stave);

        context.svg.style.height = "100%";
        context.svg.style.width = "100%";

        return () => context.svg.remove();
    }, [teacherNotes, studentNotes]);

    return <div ref={outputDivRef} className="notation-container"></div>;
}

const mapOffsetToNoteUsingSharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const mapOffsetToNoteUsingFlats  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const USE_SHARPS = true;

function noteStringsAreEquivalent(noteStringA: string, noteStringB: string) {
    return noteStringToPitch(noteStringA) == noteStringToPitch(noteStringB);
}

function pitchToNoteString(pitch: number): string {
    let octave = Math.floor(pitch / 12);
    let offset = pitch % 12
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
    offset = offset !== -1 ? offset : mapOffsetToNoteUsingFlats.indexOf(noteName);

    if (offset === -1) {
        throw new Error(`Could not decode ${noteString} to pitch`);
    }

    return octave * 12 + offset;
}

interface MidiNoteOnEvent {
    payload: {
        pitch: number,
        velocity: number,
        channel: number
    }
};

export default function NoteRecognitionGame()  {
    // const [gameState, setGameState] = useState<GameState>("PlayingSounds");
    // const studentNotesPlayed = studentNotes.length;
    // const menuActivated = studentNotesPlayed == NOTE_SEQUENCE_LENGTH;

    const [teacherNotes, setTeacherNotes] = useState<Note[]>(["C#/4", "D/5", "A/4", "C/4", "D#/4"]);
    const [studentNotes, setStudentNotes] = useState<Note[]>(["C/4", "C/4", "C/4", "C/4", "C/4"]);
    const [acceptInput, setAcceptInput] = useState(false);
    let menuActivated = studentNotes.length >= teacherNotes.length;

    useEffect(() => {
        if (acceptInput) {
            let unlistenPromise = listen("onmidinoteon", (event: MidiNoteOnEvent) => {
                if (acceptInput && studentNotes.length < teacherNotes.length) {
                    let pitch = event.payload.pitch;
                    setStudentNotes((studentNotes) => [...studentNotes, pitchToNoteString(pitch)]);
                }
            })

            return () => {
                unlistenPromise.then((unlisten) => unlisten());
            };
        } else {
            let currentTimeoutId: ReturnType<typeof setTimeout> = -1;
            let notesPlayed = 0;
            function playNote() {
                console.log(`Playing ${teacherNotes[notesPlayed]}`)
                notesPlayed++;
                if (notesPlayed < teacherNotes.length) {
                    currentTimeoutId = setTimeout(playNote, TIME_BETWEEN_NOTES);
                } else {
                    setAcceptInput(true);
                }
            }
            currentTimeoutId = setTimeout(playNote, TIME_BETWEEN_NOTES);

            return () => {
                clearTimeout(currentTimeoutId);
            }
        }
    }, [acceptInput]);

    async function handleExitButtonClick() {
        await exit(0);
    }
    function handleReplayButtonClick() {}
    function handleNextButtonClick() {
        setTeacherNotes(generateNoteSequence(NOTE_SEQUENCE_LENGTH));
        setStudentNotes([]);
        setAcceptInput(false);
    }

    return (
        <div className="game-container">
            <NoteRecognitionStave teacherNotes={teacherNotes} studentNotes={studentNotes}/>
            <div className="button-container">
                <button onClick={handleExitButtonClick}>Exit</button>
                <button disabled={!menuActivated} onClick={handleReplayButtonClick}>Replay sound</button>
                <button disabled={!menuActivated} onClick={handleNextButtonClick}>Next (press a note)</button>
            </div>
            <div className="points-container">
                <span className="bold">Correct:</span> 0
                <br/>
                <span className="bold">Wrong:</span> 0
            </div>
        </div>
    );
}
