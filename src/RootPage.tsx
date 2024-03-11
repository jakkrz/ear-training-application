import { Link } from "react-router-dom";
import classes from "./RootPage.module.css";

export default function RootPage() {
    return (
        <div className={classes.content}>
            <h1>Ear Training Application</h1>
            <div className={classes.buttonContainer}>
            <Link to={"/train"} className={classes.pageLink}>Train</Link>
            <Link to={"/analytics"} className={classes.pageLink}>Analytics</Link>
            <Link to={"/improvise"} className={classes.pageLink}>Improvise</Link>
            </div>
        </div>
    );
}
