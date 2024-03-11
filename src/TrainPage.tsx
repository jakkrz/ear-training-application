import { Link } from "react-router-dom";
import "./TrainPage.css";

export default function TrainPage() {
    return (<>
        <Link to={"/"} className="return-button">back to home</Link>
        <div className="trainpage-content">
            <h1>Training</h1>
            <div className="training-list-container">
                <h2>Exercises</h2>
                <Link to={"/training/exercises/repeat-notes/config"} className="training">Repeat Notes</Link>
                <Link to={"/training/exercises/play-chords/config"} className="training">Play Chords</Link>

                <h2>Games</h2>
                <Link to={"/training/games/staff-wars/config"} className="training">Staff Wars</Link>
                <h2>Tests</h2>
                <Link to={"/training/tests/repeat-notes/config"} className="training">Repeat Notes (Test)</Link>
                <Link to={"/training/tests/staff-wars/config"} className="training">Staff Wars (Test)</Link>
            </div>
        </div>
    </>);
}
