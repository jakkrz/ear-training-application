import { useState, useEffect, useRef } from "react";
import { exit } from '@tauri-apps/api/process';

import Vex, { SVGContext, StaveNote, GhostNote, Voice, Formatter, NoteStruct, Tickable } from "vexflow";
const { Renderer, Stave } = Vex.Flow;

type GameState = "PlayingSounds" | "ReceivingNotes" | "AwaitingRestart";

type Note = string;
const NOTE_SEQUENCE_LENGTH = 5;

function generateNoteSequence(sequenceLength = NOTE_SEQUENCE_LENGTH): Note[] {
    return []; //TODO
}

interface NoteRecognitionStaveProps {
    teacherNotes: Note[]
    studentNotes: Note[]
};

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
            if (index < studentNotesPlayed) {
                return new StaveNote(struct);
            } else {
                return new GhostNote(struct);
            }
        })

        const studentVoice = new Voice({ num_beats: NOTE_SEQUENCE_LENGTH, beat_value: 4 });
        const studentVoiceNoteStructs: NoteStruct[] = [...studentNotes.map((note) => {
            return { keys: [note], duration: "q" }
        }), ...Array(NOTE_SEQUENCE_LENGTH - studentNotesPlayed).fill({ duration: "q" })];

        const studentNotesToDraw = studentVoiceNoteStructs.map((struct, index) => {
            let note = index < studentNotesPlayed ? new StaveNote(struct) : new GhostNote(struct)

            if (teacherNotes[index] == studentNotes[index]) {
                note.setStyle({fillStyle: "green", strokeStyle: "green"});
            } else {
                note.setStyle({fillStyle: "red", strokeStyle: "red"});
            }

            return note
        })

        teacherVoice.addTickables(teacherNotesToDraw);
        studentVoice.addTickables(studentNotesToDraw);

        // the two voices are not "aware" of each other
        new Formatter().joinVoices([teacherVoice]).format([teacherVoice], 445);
        new Formatter().joinVoices([studentVoice]).format([studentVoice], 445);

        // Render voice
        teacherVoice.draw(context, stave);
        studentVoice.draw(context, stave);

        context.svg.style.height = "100%";
        context.svg.style.width = "100%";

        return () => context.svg.remove();
    }, [teacherNotes, studentNotes]);

    return <div ref={outputDivRef} className="notation-container"></div>;
}

export default function NoteRecognitionGame()  {
    const [gameState, setGameState] = useState<GameState>("PlayingSounds");
    const [teacherNotes, setTeacherNotes] = useState<Note[]>(["C#/4", "D/5", "A/4", "C/4", "D#/4"]);
    const [studentNotes, setStudentNotes] = useState<Note[]>(["D/4", "F/4", "A/4", "B/4", "C/4"]);
    const studentNotesPlayed = studentNotes.length;
    const menuActivated = studentNotesPlayed == NOTE_SEQUENCE_LENGTH;


    async function handleExitButtonClick() {
        await exit(0);
    }
    function handleReplayButtonClick() {}
    function handleNextButtonClick() {
        setTeacherNotes(generateNoteSequence(NOTE_SEQUENCE_LENGTH));
        setStudentNotes([]);
        setGameState("PlayingSounds")
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
