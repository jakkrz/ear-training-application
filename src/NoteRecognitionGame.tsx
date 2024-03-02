import { useState, useEffect, useRef } from "react";
import { exit } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";

import Vex, {
  SVGContext,
  StaveNote,
  GhostNote,
  Voice,
  Formatter,
  NoteStruct,
  Accidental,
} from "vexflow";
const { Renderer, Stave } = Vex.Flow;

import { listen } from "@tauri-apps/api/event";

// type GameState = "PlayingSounds" | "ReceivingNotes" | "AwaitingRestart";

type Note = string;

const NOTE_SEQUENCE_LENGTH = 3;
const TIME_BETWEEN_NOTES = 2000;
const TIME_BEFORE_FIRST_NOTE = 1000;
const STARTING_NOTE = "C/4";

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateNoteSequence(sequenceLength = NOTE_SEQUENCE_LENGTH): Note[] {
  let result: Note[] = [STARTING_NOTE];
  let prevNote = STARTING_NOTE;

  for (let i = 1; i < sequenceLength; i++) {
    let prevNotePitch = noteStringToPitch(prevNote);
    let lowerBound = Math.max(60, prevNotePitch - 4);
    let upperBound = Math.min(81, prevNotePitch + 4);
    let newPitch = Math.floor(getRandomArbitrary(lowerBound, upperBound));
    let noteToAdd = pitchToNoteString(newPitch);
    result.push(noteToAdd);
    prevNote = noteToAdd;
  }

  return result;
}

interface NoteRecognitionStaveProps {
  teacherNotes: Note[];
  studentNotes: Note[];
}

function getAccidentalsFromNote(note: string): string {
  let [baseNote, _octave] = note.split("/");
  return baseNote.slice(1);
}

function NoteRecognitionStave({
  teacherNotes,
  studentNotes,
}: NoteRecognitionStaveProps) {
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

    const teacherVoice = new Voice({
      num_beats: NOTE_SEQUENCE_LENGTH,
      beat_value: 4,
    });
    const teacherNoteStructs: NoteStruct[] = teacherNotes.map((note) => {
      return { keys: [note], duration: "q" };
    });

    const teacherNotesToDraw = teacherNoteStructs.map((struct, index) => {
      let note =
        index < studentNotesPlayed
          ? new StaveNote(struct)
          : new GhostNote(struct);

      return note;
    });

    teacherNotes.forEach((value, index) => {
      let accidentals = getAccidentalsFromNote(value);

      if (accidentals !== "") {
        teacherNotesToDraw[index].addModifier(new Accidental(accidentals));
      }
    });

    const studentVoice = new Voice({
      num_beats: NOTE_SEQUENCE_LENGTH,
      beat_value: 4,
    });
    const studentVoiceNoteStructs: NoteStruct[] = [
      ...studentNotes.map((note) => {
        return { keys: [note], duration: "q" };
      }),
      ...Array(NOTE_SEQUENCE_LENGTH - studentNotesPlayed).fill({
        duration: "q",
      }),
    ];

    const studentNotesToDraw = studentVoiceNoteStructs.map((struct, index) => {
      let note =
        index < studentNotesPlayed
          ? new StaveNote(struct)
          : new GhostNote(struct);

      if (noteStringsAreEquivalent(teacherNotes[index], studentNotes[index])) {
        note.setStyle({ fillStyle: "green", strokeStyle: "green" });
      } else {
        note.setStyle({ fillStyle: "red", strokeStyle: "red" });
      }

      return note;
    });

    studentNotes.forEach((value, index) => {
      let accidentals = getAccidentalsFromNote(value);

      if (accidentals !== "") {
        studentNotesToDraw[index].addModifier(new Accidental(accidentals));
      }
    });

    teacherVoice.addTickables(teacherNotesToDraw);
    studentVoice.addTickables(studentNotesToDraw);

    // the two voices are not "aware" of each other
    new Formatter()
      .joinVoices([studentVoice, teacherVoice])
      .format([studentVoice, teacherVoice], 445);

    // Render voice
    teacherVoice.draw(context, stave);
    studentVoice.draw(context, stave);

    context.svg.style.height = "100%";
    context.svg.style.width = "100%";

    return () => context.svg.remove();
  }, [teacherNotes, studentNotes]);

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
  noteStringB: string | undefined
): boolean {
  if (noteStringA !== undefined && noteStringB !== undefined) {
    return noteStringToPitch(noteStringA) === noteStringToPitch(noteStringB);
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
  offset = offset !== -1 ? offset : mapOffsetToNoteUsingFlats.indexOf(noteName);

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

function noteSequencesAreEquivalent(seqA: Note[], seqB: Note[]): boolean {
  if (seqA.length !== seqB.length) return false;

  for (const [index, note] of seqA.entries()) {
    if (!noteStringsAreEquivalent(note, seqB[index])) return false;
  }

  return true;
}

export default function NoteRecognitionGame() {
  const [teacherNotes, setTeacherNotes] = useState<Note[]>(
    generateNoteSequence()
  );
  const [studentNotes, setStudentNotes] = useState<Note[]>([]);
  const [acceptInput, setAcceptInput] = useState(false);
  const [gotCorrect, setGotCorrect] = useState(0);
  const [gotWrong, setGotWrong] = useState(0);
  let menuActivated = studentNotes.length >= teacherNotes.length;

  useEffect(() => {
    if (acceptInput) {
      let studentNotesPlayed = studentNotes.length;
      const teacherNotesPlayed = teacherNotes.length;

      let unlistenPromise = listen("onmidinoteon", (event: MidiNoteOnEvent) => {
        if (acceptInput && studentNotesPlayed < teacherNotesPlayed) {
          let pitch = event.payload.pitch;
          setStudentNotes((studentNotes) => [
            ...studentNotes,
            pitchToNoteString(pitch),
          ]);
          studentNotesPlayed++;
        }
      });

      return () => {
        unlistenPromise.then((unlisten) => unlisten());
      };
    } else {
      let currentTimeoutId: ReturnType<typeof setTimeout> = -1;
      let notesPlayed = 0;
      function playNote() {
        const notePitch = noteStringToPitch(teacherNotes[notesPlayed]);
        const noteVelocity = 127;
        invoke("play_note", {
          pitch: notePitch,
          velocity: noteVelocity,
          duration: TIME_BETWEEN_NOTES,
        });

        notesPlayed++;
        if (notesPlayed < teacherNotes.length) {
          currentTimeoutId = setTimeout(playNote, TIME_BETWEEN_NOTES);
        } else {
          setAcceptInput(true);
        }
      }
      currentTimeoutId = setTimeout(playNote, TIME_BEFORE_FIRST_NOTE);

      return () => {
        clearTimeout(currentTimeoutId);
      };
    }
  }, [acceptInput]);

  async function handleExitButtonClick() {
    await exit(0);
  }

  function handleNextButtonClick() {
    setTeacherNotes(generateNoteSequence(NOTE_SEQUENCE_LENGTH));
    setStudentNotes([]);
    setAcceptInput(false);
    if (noteSequencesAreEquivalent(teacherNotes, studentNotes)) {
      setGotCorrect(gotCorrect + 1);
    } else {
      setGotWrong(gotWrong + 1);
    }
  }

  useEffect(() => {
    function onKeyPress(evt: KeyboardEvent) {
      if (evt.code === "Space" && menuActivated) {
        handleNextButtonClick();
      }
    }
    document.addEventListener("keypress", onKeyPress);

    return () => document.removeEventListener("keypress", onKeyPress);
  }, [menuActivated]);

  return (
    <div className="game-container">
      <NoteRecognitionStave
        teacherNotes={teacherNotes}
        studentNotes={studentNotes}
      />
      <div className="button-container">
        <button onClick={handleExitButtonClick}>Exit</button>
        <button disabled={!menuActivated} onClick={handleNextButtonClick}>
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
