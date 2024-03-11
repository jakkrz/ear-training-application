import { Link } from "react-router-dom";
import classes from "./RootPage.module.css";

export default function RootPage() {
    return (
        <div className={classes.content}>
            <h1>Ear Training Application</h1>
            <div className={classes.buttonContainer}>
            <Link to={"/train"} className="navigation-button">Train</Link>
            <Link to={"/analytics"} className="navigation-button">Analytics</Link>
            <Link to={"/improvise"} className="navigation-button">Improvise</Link>
            </div>
        </div>
    );
}
