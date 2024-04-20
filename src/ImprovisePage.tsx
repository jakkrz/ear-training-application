import classes from "./ImprovisePage.module.css";
import { Link } from "react-router-dom";

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
    return <Improvisation name="example improv.mid" />;
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
