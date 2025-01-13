// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('biometrics', {    
    initialize: () => ipcRenderer.invoke('initialize'),
    terminate: () => ipcRenderer.invoke('terminate'),
    getHardwareId: () =>  ipcRenderer.invoke('getHardwareId'),
    getVersion: () =>  ipcRenderer.invoke('getVersion'),
    loadImage: (fileName) =>  ipcRenderer.invoke('loadImage', fileName),
    ansiTemplateSizeAndMinutiaeCount: (ansiTemplate) => ipcRenderer.invoke('ansiTemplateSizeAndMinutiaeCount', ansiTemplate),
    isoTemplateSizeAndMinutiaeCount: (isoTemplate) => ipcRenderer.invoke('isoTemplateSizeAndMinutiaeCount', isoTemplate),
    setAndGetFingerPosition: (isoTemplate, position) =>ipcRenderer.invoke('setAndGetFingerPosition', isoTemplate, position),
    loadISOTemplate: (fileName) => ipcRenderer.invoke('loadISOTemplate', fileName),
    saveISOTemplate: (fileName, isoTemplate) => ipcRenderer.invoke('saveISOTemplate', fileName, isoTemplate),
    createIsoTemplate: (width, height, raw_data) => ipcRenderer.invoke('createIsoTemplate', width, height, raw_data),
    setAndGetFingerPosition: (isoTemplate, position) => ipcRenderer.invoke('setAndGetFingerPosition', isoTemplate, position),
    isoVerifyMatch: (isoTemplate1, isoTemplate2) => ipcRenderer.invoke('isoVerifyMatch', isoTemplate1, isoTemplate2),
    ansiVerifyMatch: (ansiTemplate1, ansiTemplate2) => ipcRenderer.invoke('ansiVerifyMatch', ansiTemplate1, ansiTemplate2),
});

contextBridge.exposeInMainWorld('handlers', {    
    handleInitiate: () => ipcRenderer.invoke('handleInitiate', accountNumber, kioskStationID),
    handleGetFingers: () => ipcRenderer.invoke('handleGetFingers', kioskStationID),
    handleVerifyFinger: () =>  ipcRenderer.invoke('handleVerifyFinger', id, status, fingerprintTemplate),
});
