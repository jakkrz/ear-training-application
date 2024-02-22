mod logging;
mod midi;

use tauri::{AppHandle, Manager};

pub fn setup(app: AppHandle) -> Result<(), ()> {
    logging::setup(&app)?;
    midi::setup(app.app_handle())?;
    Ok(())
}
