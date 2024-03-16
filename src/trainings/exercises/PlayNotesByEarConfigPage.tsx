import { Link } from "react-router-dom";
import {
    ToggleSwitchOption,
    CounterOption,
    MidiSourceOption,
} from "../../ConfigComponents";
import { useState } from "react";

export default function PlayNotesByEarConfigPage() {
    const [optionValue, setOptionValue] = useState(false);
    const [counterValue, setCounterValue] = useState(0);
    return (<>
        <Link to={"/train"} className="return-button">go back to training</Link>
        <div className="config-content">
            <h1>Play Notes By Ear</h1>

            <div className="config-scroll-box">
                <ToggleSwitchOption value={optionValue} setValue={setOptionValue}>Only play diatonic notes</ToggleSwitchOption>
                <ToggleSwitchOption value={optionValue} setValue={setOptionValue}>Collect analytics</ToggleSwitchOption>
                <CounterOption value={counterValue} setValue={setCounterValue}>Number of notes</CounterOption>
                <MidiSourceOption>Note input device</MidiSourceOption>
                
            </div>

            <Link to={"/train/exercises/play-notes-by-ear/actual"} className="navigation-button">Begin exercise</Link>
        </div>
    </>);
}
