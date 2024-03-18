import { useState } from "react";
import { Link } from "react-router-dom";
import { ToggleSwitchOption, MidiSourceOption, InputMethod } from "../../ConfigComponents";

export default function StaffWarsConfigPage() {
    const [collectAnalytics, setCollectAnalytics] = useState(true);
    const [inputMethod, setInputMethod] = useState<InputMethod>(null);

    return (<>
        <Link to={"/train"} className="return-button">go back to training</Link>
        <div className="config-content">
            <h1>Staff Wars</h1>

            <div className="config-scroll-box">
                <MidiSourceOption value={inputMethod} setValue={setInputMethod}>Note input device</MidiSourceOption>
                <ToggleSwitchOption value={collectAnalytics} setValue={setCollectAnalytics}>Collect analytics</ToggleSwitchOption>
            </div>

            <Link to={"/train/games/staff-wars/actual"} className="navigation-button" state={{collectAnalytics, inputMethod}}>Begin exercise</Link>
        </div>
    </>);
}
