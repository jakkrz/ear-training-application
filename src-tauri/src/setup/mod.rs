mod logging;
mod midi;

use tauri::AppHandle;

pub fn setup(app: AppHandle) -> Result<(), ()> {
    logging::setup(&app)?;
    midi::setup(app)?;
    Ok(())
}
