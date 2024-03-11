import { Link } from "react-router-dom";
import classes from "./TrainPage.module.css";

export default function TrainPage() {
    return (<>
        <Link to={"/"} className="return-button">back to home</Link>
        <div className={classes.content}>
            <h1>Training</h1>
            <div className={classes.trainingListContainer}>
                <h2>Exercises</h2>
                <Link to={"/train/exercises/repeat-notes/config"} className={classes.training}>Repeat Notes</Link>
                <Link to={"/train/exercises/play-chords/config"} className={classes.training}>Play Chords</Link>

                <h2>Games</h2>
                <Link to={"/train/games/staff-wars/config"} className={classes.training}>Staff Wars</Link>
                <h2>Tests</h2>
                <Link to={"/train/tests/repeat-notes/config"} className={classes.training}>Repeat Notes (Test)</Link>
                <Link to={"/train/tests/staff-wars/config"} className={classes.training}>Staff Wars (Test)</Link>
            </div>
        </div>
    </>);
}
