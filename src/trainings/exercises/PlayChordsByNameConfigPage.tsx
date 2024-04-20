import { Link } from "react-router-dom";
import {
    ToggleSwitchOption,
    MidiSourceOption,
    InputMethod,
} from "../../ConfigComponents";
import { useState } from "react";

export default function PlayNotesByEarConfigPage() {
    const [diatonicOnly, setDiatonicOnly] = useState(false);
    const [inputMethod, setInputMethod] = useState<InputMethod>(null);
    const [collectAnalytics, setCollectAnalytics] = useState(false);

    return (
        <>
            <Link to={"/train"} className="return-button">
                go back to training
            </Link>
            <div className="config-content">
                <h1>Play chords by name</h1>

                <div className="config-scroll-box">
                    <ToggleSwitchOption
                        value={diatonicOnly}
                        setValue={setDiatonicOnly}
                    >
                        Only play diatonic notes
                    </ToggleSwitchOption>
                    <MidiSourceOption
                        value={inputMethod}
                        setValue={setInputMethod}
                    >
                        Note input device
                    </MidiSourceOption>
                    <ToggleSwitchOption
                        value={collectAnalytics}
                        setValue={setCollectAnalytics}
                    >
                        Collect analytics
                    </ToggleSwitchOption>
                </div>

                <Link
                    to={"/train/exercises/play-chords-by-name/actual"}
                    className="navigation-button"
                    state={{
                        diatonicOnly,
                        inputMethod,
                        collectAnalytics,
                    }}
                >
                    Begin exercise
                </Link>
            </div>
        </>
    );
}
