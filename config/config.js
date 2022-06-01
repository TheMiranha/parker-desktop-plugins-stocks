const RENDER_CONFIG = false;

const setConfig = (config) => {
    window.electron.ipcRenderer.sendMessage('setPluginConfig', {plugin: 'parker-desktop-plugins-stocks', config});
}

const appendConfig = (config) => {
    window.electron.ipcRenderer.sendMessage('appendPluginConfig', {plugin: 'parker-desktop-plugins-stocks', toSet: config});
}

const getConfig = (callBack) => {
    const execOnce = () => {
        window.electron.ipcRenderer.once('parker-desktop-plugins-stocks-config', config => {
                callBack(config.config);
        });
    }
    execOnce();
    window.electron.ipcRenderer.sendMessage('getPluginConfig', {plugin: 'parker-desktop-plugins-stocks'});
}


export default { RENDER_CONFIG, getConfig, appendConfig, setConfig }