import fs from 'fs';

function load_app_settings(){
    let rawdata = fs.readFileSync('app_settings.json');
    let app_settings = JSON.parse(rawdata);
    return app_settings
}

function save_app_settings(new_settings : any){
    let data = JSON.stringify(new_settings, null, 2);
    fs.writeFileSync('app_settings.json', data);
}

export default {
    load_app_settings,
    save_app_settings
}