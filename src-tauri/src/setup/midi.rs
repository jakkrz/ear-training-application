use midir::{MidiOutput, MidiOutputPort};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub fn setup(app: AppHandle) -> Result<(), ()> {
    let midi_out = MidiOutput::new("My Test Output").unwrap();

    // Get an output port (read from console if multiple are available)
    let out_ports = midi_out.ports();
    let out_port: &MidiOutputPort = &out_ports[0];
    println!("\nOpening connection");
    let conn_out = midi_out.connect(out_port, "midir-test").unwrap();

    app.manage(crate::MidiHandles {
        conn_in: Mutex::new(None),
        conn_out: Mutex::new(conn_out),
    });
    Ok(())
}
