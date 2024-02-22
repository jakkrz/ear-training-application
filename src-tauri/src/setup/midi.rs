use std::{
    io::{stdin, stdout, Write},
    sync::Mutex,
};

use midir::{Ignore, MidiInput};
use tauri::{AppHandle, Manager};
use tracing::info;

pub fn setup(app: AppHandle) -> Result<(), ()> {
    info!("setting up midi");
    let mut midi_in = MidiInput::new("midir reading input").unwrap();
    midi_in.ignore(Ignore::None);

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
    let conn_in = midi_in
        .connect(
            in_port,
            "midir-read-input",
            move |stamp, message, _| {
                println!("{}: {:?} (len = {})", stamp, message, message.len());
            },
            (),
        )
        .unwrap();
    app.manage(Mutex::new(conn_in));
    Ok(())
}
