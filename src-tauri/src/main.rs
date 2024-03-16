// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use midir::MidiInput;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn scan_for_devices() -> Vec<String> {
    let midi_input = MidiInput::new("midi device scan").unwrap();

    midi_input.ports().iter()
        .map(|port| midi_input.port_name(port).unwrap())
        .collect()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_for_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
