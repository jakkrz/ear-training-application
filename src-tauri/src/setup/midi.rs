use std::{
    io::{stdin, stdout, Write},
    sync::Mutex,
};

use midir::{Ignore, MidiInput, MidiOutput, MidiOutputPort};
use tauri::{AppHandle, Manager};
use tracing::info;

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

pub fn setup(app: AppHandle) -> Result<(), ()> {
    info!("setting up midi");
    let mut midi_in = MidiInput::new("midir reading input").unwrap();
    midi_in.ignore(Ignore::All);

    // Get an input port (read from console if multiple are available)
    let in_ports = midi_in.ports();
    let in_port = match in_ports.len() {
        0 => panic!("no input port found"),
        1 => {
            info!(
                "Choosing the only available input port: {}",
                midi_in.port_name(&in_ports[0]).unwrap()
            );
            &in_ports[0]
        }
        _ => {
            println!("\nAvailable input ports:");
            for (i, p) in in_ports.iter().enumerate() {
                println!("{}: {}", i, midi_in.port_name(p).unwrap());
            }
            print!("Please select input port: ");
            stdout().flush().unwrap();
            let mut input = String::new();
            stdin().read_line(&mut input).unwrap();
            in_ports
                .get(input.trim().parse::<usize>().unwrap())
                .ok_or("invalid input port selected")
                .unwrap()
        }
    };

    info!("\nOpening connection");
    let in_port_name = midi_in.port_name(in_port).unwrap();

    info!("Connection open, reading input from '{}'", in_port_name);

    let new_app = app.clone();

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

    let midi_out = MidiOutput::new("My Test Output").unwrap();

    // Get an output port (read from console if multiple are available)
    let out_ports = midi_out.ports();
    let out_port: &MidiOutputPort = match out_ports.len() {
        0 => panic!("no output port found"),
        1 => {
            println!(
                "Choosing the only available output port: {}",
                midi_out.port_name(&out_ports[0]).unwrap()
            );
            &out_ports[0]
        }
        _ => {
            println!("\nAvailable output ports:");
            for (i, p) in out_ports.iter().enumerate() {
                println!("{}: {}", i, midi_out.port_name(p).unwrap());
            }
            print!("Please select output port: ");
            stdout().flush().unwrap();
            let mut input = String::new();
            stdin().read_line(&mut input).unwrap();
            out_ports
                .get(input.trim().parse::<usize>().unwrap())
                .ok_or("invalid output port selected")
                .unwrap()
        }
    };

    println!("\nOpening connection");
    let conn_out = midi_out.connect(out_port, "midir-test").unwrap();

    app.manage(crate::MidiHandles {
        conn_in: Mutex::new(conn_in),
        conn_out: Mutex::new(conn_out),
    });
    println!("ajdfsaskf");
    Ok(())
}
