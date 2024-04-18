// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod setup;
use midir::{MidiInput, MidiInputConnection, MidiOutputConnection, Ignore};
use tauri::{AppHandle, Manager};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tracing::info;

#[allow(dead_code)]
struct MidiHandles {
    conn_out: Mutex<MidiOutputConnection>,
    conn_in: Mutex<Option<MidiInputConnection<()>>>
}

#[derive(Clone, serde::Serialize)]
struct NoteOnPayload {
    channel: u8,
    pitch: u8,
    velocity: u8,
}

#[derive(Clone, serde::Serialize)]
struct NoteOffPayload {
    channel: u8,
    pitch: u8,
    velocity: u8,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn play_note(pitch: u8, velocity: u8, duration: u64, state: tauri::State<'_, MidiHandles>) -> Result<(), String> {
    let mut conn_out = state.conn_out.lock().unwrap();

    conn_out.send(&[0x90, pitch, velocity]).unwrap();
    thread::sleep(Duration::from_millis(duration));
    conn_out.send(&[0x80, pitch, velocity]).unwrap();
    Ok(())
}

#[tauri::command]
fn scan_for_devices() -> Vec<String> {
    let midi_input = MidiInput::new("midi device scan").unwrap();

    midi_input.ports().iter()
        .map(|port| midi_input.port_name(port).unwrap())
        .collect()
}

#[tauri::command]
fn connect_input(port_n: usize, app_handle: AppHandle, state: tauri::State<'_, MidiHandles>) -> Result<(), String> {
    info!("setting up midi");
    let mut midi_in = MidiInput::new("midir reading input").unwrap();
    midi_in.ignore(Ignore::All);

    let in_ports = midi_in.ports();
    let in_port = in_ports
                .get(port_n)
                .ok_or("invalid input port selected")
                .unwrap();

    info!("\nOpening connection");
    let in_port_name = midi_in.port_name(in_port).unwrap();
    info!("Connection open, reading input from '{}'", in_port_name);

    let new_app = app_handle.clone();

    let conn_in = midi_in
        .connect(
            in_port,
            "midir-read-input",
            move |stamp, message, _| {
                info!("{}: {:?} (len = {})", stamp, message, message.len());
                new_app
                    .emit_all("onmidi", message)
                    .expect("failed to emit onmidi event");

                let status_byte = message[0];

                if status_byte >> 4 == 0x9 {
                    new_app
                        .emit_all(
                            "onmidinoteon",
                            NoteOnPayload {
                                channel: status_byte & 0x0F,
                                pitch: message[1],
                                velocity: message[2],
                            },
                        )
                        .expect("failed to emit onmidinoteon event");
                } else if status_byte >> 4 == 0x8 {
                    new_app
                        .emit_all(
                            "onmidinoteoff",
                            NoteOffPayload {
                                channel: status_byte & 0x0F,
                                pitch: message[1],
                                velocity: message[2],
                            },
                        )
                        .expect("failed to emit onmidinoteoff event");
                }
            },
            (),
        )
        .unwrap();

    let mut conn_in_guard = state.conn_in.lock().unwrap();
    *conn_in_guard = Some(conn_in);

    println!("Connected input");
    Ok(())
}

#[tauri::command]
fn disconnect_input(state: tauri::State<'_, MidiHandles>) {
    *state.conn_in.lock().unwrap() = None;
    println!("Disconnected input");
}

fn main() {
    tauri::Builder::default()
        // .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let _ = setup::setup(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![play_note, scan_for_devices, connect_input, disconnect_input])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
