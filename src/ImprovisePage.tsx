import "./ImprovisePage.css";
import { Link } from "react-router-dom";

export default function ImprovisePage() {
    return (
        <Link to={"/"} className="return-button">
            back to home
        </Link>
    );
}
