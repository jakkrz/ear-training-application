import { Link } from "react-router-dom";

export default function PlayNotesByEarConfigPage() {
    return (<>
        <Link to={"/train"} className="return-button">go back to training</Link>
        <div className="config-content">
            <h1>Play Notes By Ear</h1>

            <div className="config-scroll-box">
                <p>Diatonic only: yes/no</p>
                <p>Collect analytics: yes/no</p>
            </div>

            <Link to={"/train/exercises/play-notes-by-ear/actual"} className="navigation-button">Begin exercise</Link>
        </div>
    </>);
}
