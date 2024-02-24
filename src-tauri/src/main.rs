// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod setup;
use midir::{MidiInputConnection, MidiOutputConnection};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

#[allow(dead_code)]
struct MidiHandles {
    conn_out: Mutex<MidiOutputConnection>,
    conn_in: Mutex<MidiInputConnection<()>>
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn play_note(pitch: u8, velocity: u8, duration: u64, state: tauri::State<'_, MidiHandles>) -> Result<(), ()> {
    let mut conn_out = state.conn_out.lock().unwrap();

    conn_out.send(&[0x90, pitch, velocity]).unwrap();
    thread::sleep(Duration::from_millis(duration));
    conn_out.send(&[0x80, pitch, velocity]).unwrap();
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _ = setup::setup(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![play_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
