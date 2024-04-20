import classes from "./ImprovisePage.module.css";
import { Link } from "react-router-dom";
import {
    readDir,
    createDir,
    BaseDirectory,
    removeFile,
} from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const DIR_NAME = "recordings";

async function createDirIfNotExists() {
    await createDir(DIR_NAME, { dir: BaseDirectory.AppData, recursive: true });
}

function getPathTail(path: string): string {
    if (path.includes("/")) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    return path;
}

await createDirIfNotExists();

async function getRecordingNames(): Promise<string[]> {
    const entries = await readDir(DIR_NAME, {
        dir: BaseDirectory.AppData,
        recursive: true,
    });

    const result: string[] = [];

    for (const entry of entries) {
        const name = getPathTail(entry.path);

        result.push(name);
    }

    return result;
}

type ImprovisationProps = {
    name: string;
    playRecording: (name: string) => void;
    stopRecording: () => void;
    deleteRecording: (name: string) => void;
    isPlaying: boolean;
};

function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`${classes.textButton} ${classes.delete}`}
        >
            {" "}
            delete
        </button>
    );
}

type PlayButtonProps = {
    isPlaying: boolean;
    onClick: () => void;
};

function PlayButton({ isPlaying, onClick }: PlayButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${classes.textButton} ${classes.play}`}
        >
            {isPlaying ? "stop" : "play"}
        </button>
    );
}

function Improvisation({
    name,
    playRecording,
    stopRecording,
    deleteRecording,
    isPlaying,
}: ImprovisationProps) {
    function onPlayButtonClick() {
        if (isPlaying) {
            stopRecording();
        } else {
            playRecording(name);
        }
    }

    function onDeleteButtonClick() {
        deleteRecording(name);
    }

    return (
        <div className={`navigation-button ${classes.navbuttonFlex}`}>
            <p>{name}</p>
            <div>
                <DeleteButton onClick={onDeleteButtonClick} />
                <PlayButton isPlaying={isPlaying} onClick={onPlayButtonClick} />
            </div>
        </div>
    );
}

function ImprovisationList() {
    const [recordingNames, setRecordingNames] = useState<string[]>([]);

    async function playRecording(name: string) {
        await invoke("play_recording_with_name", { name });
    }
    function stopRecording() {
        await invoke("stop_playing_recording");
    }
    async function deleteRecording(name: string) {
        await removeFile(`${DIR_NAME}/${name}`, {
            dir: BaseDirectory.AppData,
        });

        setRecordingNames(await getRecordingNames());
    }

    useEffect(() => {
        (async () => {
            setRecordingNames(await getRecordingNames());
        })();
    }, []);

    const improvisationElements = recordingNames.map((name) => (
        <Improvisation
            name={name}
            key={name}
            playRecording={playRecording}
            stopRecording={stopRecording}
            deleteRecording={deleteRecording}
            isPlaying={false}
        />
    ));
    return <>{improvisationElements}</>;
}

export default function ImprovisePage() {
    return (
        <>
            <Link to={"/"} className="return-button">
                back to home
            </Link>
            <div className={classes.everythingContainer}>
                <h1>Improvisations</h1>
                <div className={classes.improvisationListContainer}>
                    <ImprovisationList />
                    <Link to={"/improvise/new"} className="navigation-button">
                        Create new
                    </Link>
                </div>
            </div>
        </>
    );
}
