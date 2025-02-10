const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Dermalog', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
});