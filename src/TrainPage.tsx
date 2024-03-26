import { Link } from "react-router-dom";
import classes from "./TrainPage.module.css";

export default function TrainPage() {
    return (
        <>
            <Link to={"/"} className="return-button">
                back to home
            </Link>
            <div className={classes.content}>
                <h1>Training</h1>
                <div className={classes.trainingListContainer}>
                    <h2>Exercises</h2>
                    <Link
                        to={"/train/exercises/play-notes-by-ear/config"}
                        className="navigation-button"
                    >
                        Play Notes by Ear
                    </Link>
                    <Link
                        to={"/train/exercises/play-chords-by-name/config"}
                        className="navigation-button"
                    >
                        Play Chords by Name
                    </Link>

                    <h2>Games</h2>
                    <Link
                        to={"/train/games/staff-wars/config"}
                        className="navigation-button"
                    >
                        Staff Wars
                    </Link>
                    <h2>Tests</h2>
                    <Link
                        to={"/train/tests/repeat-notes/config"}
                        className="navigation-button"
                    >
                        Repeat Notes (Test)
                    </Link>
                    <Link
                        to={"/train/tests/staff-wars/config"}
                        className="navigation-button"
                    >
                        Staff Wars (Test)
                    </Link>
                </div>
            </div>
        </>
    );
}
