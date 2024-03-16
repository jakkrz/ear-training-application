import { invoke } from "@tauri-apps/api";
import classes from "./ConfigComponents.module.css";
import { useState, useEffect, PropsWithChildren } from "react";

type ToggleSwitchOptionProps = PropsWithChildren<{
    value: boolean,
    setValue: (value: boolean) => void,
}>;

export function ToggleSwitchOption({value, setValue, children}: ToggleSwitchOptionProps) {
    return (<label className={classes.configOption}>
        <span className={classes.optionLabel}>{children}&nbsp;</span>
        <div className={classes.switch}>
            <input type="checkbox" checked={value} onChange={() => setValue(!value)}/>
            <span className={`${classes.slider} ${classes.round}`}></span>
        </div>
    </label>);
}

type CounterSwitchOptionProps = PropsWithChildren<{
    value: number,
    setValue: (value: number) => void,
    minValue?: number,
    maxValue?: number,
}>;

export function CounterOption({value, setValue, minValue, maxValue, children}: CounterSwitchOptionProps) {
    const [displayValue, setDisplayValue] = useState(value.toString());
    const min = minValue ?? 1;
    return <label className={classes.configOption}>
        <span className={classes.optionLabel}>{children}&nbsp;</span>
        <input type="number" className={classes.numberInput} value={displayValue} min={min} max={maxValue} onChange={(e) => {
            setDisplayValue(e.target.value);

            if (!isNaN(parseInt(e.target.value))) {
                setValue(parseInt(e.target.value))
            }
        }}/>
    </label>;
}

type MidiSourceOptionProps = PropsWithChildren<{

}>;

export function MidiSourceOption({children}: MidiSourceOptionProps) {
    const [selectedOption, setSelectedOption] = useState("default");

    const [devices, setDevices] = useState([]);

    async function scanForDevices() {
        setDevices(await invoke("scan_for_devices"));
    }

    useEffect(() => {
        scanForDevices();
    }, []);

    function onSelectedChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedOption(e.target.value);
    }

    return <label className={classes.configOption}>
        <span className={classes.optionLabel}>{children}&nbsp;</span>
        <select value={selectedOption} onChange={onSelectedChange}>
            <option value="default">Please choose your input device</option>
            {devices}
            <option value="m">Microphone</option>
        </select>
        <button onClick={scanForDevices}>Rescan</button>
    </label>;
}
