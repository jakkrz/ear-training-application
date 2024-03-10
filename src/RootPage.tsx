import { Link } from "react-router-dom";
import "./RootPage.css";

export default function RootPage() {
    return (
        <div className="content">
            <h1>Ear Training Application</h1>
            <div className="button-container">
            <Link to={"/train"} className="page-link">Train</Link>
            <Link to={"/analytics"} className="page-link">Analytics</Link>
            <Link to={"/improvise"} className="page-link">Improvise</Link>
            </div>
        </div>
    );
}
