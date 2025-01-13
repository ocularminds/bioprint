const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Biometrics = require('./scanner');
const Handlers = require('./handlers');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    // Communicate with API
    ipcMain.handle('handleInitiate', async (event, { accountNumber, kioskStationID }) => {
        return Handlers.handleInitiate({accountNumber, kioskStationID});
    });
    
    ipcMain.handle('handleGetFingers', async (event, kioskStationID) => {
        return Handlers.handleGetFingers(kioskStationID);
    });
    
    ipcMain.handle('handleVerify', async (event, { id, status, fingerprintTemplate }) => {
        return Handlers.handleVerify({id, status, fingerprintTemplate});
    });

    ipcMain.handle('initialize', async (event) => {
        try {
            console.log('Finger event initializing...');
          return Biometrics.initialize();
        }catch (error) {
            console.log("error loading fingerprint library", e);
            return error.message;
        }
    });

    ipcMain.handle('terminate', async (event) => {  
        try {
          return Biometrics.terminate();
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('getHardwareId', async (event) => { 
        try {
          return Biometrics.getHardwareId();
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('getVersion', async (event,) => {   
        try {
          return Biometrics.getVersion();
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('loadImage', async (event, fileName) => {  
        try {
          return Biometrics.loadImage(fileName);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('loadISOTemplate', async (event, fileName) => {
        try {
          return Biometrics.loadISOTemplate(fileName);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('saveISOTemplate', async (event, fileName, isoTemplate) => { 
        try {
          return Biometrics.saveISOTemplate(fileName, isoTemplate);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('createIsoTemplate', async (event, width, height, raw_data) => { 
        try {
          return Biometrics.createIsoTemplate(width, height, raw_data);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('ansiTemplateSizeAndMinutiaeCount', async (event, ansiTemplate) => {
        try {
          return Biometrics.ansiTemplateSizeAndMinutiaeCount(ansiTemplate);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('isoTemplateSizeAndMinutiaeCount', async (event, isoTemplate) => {
        try {
          return Biometrics.isoTemplateSizeAndMinutiaeCount(isoTemplate);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('setAndGetFingerPosition', async (event, isoTemplate, position) => {
        try {
          return Biometrics.setAndGetFingerPosition(isoTemplate, position);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('isoVerifyMatch', async (event, isoTemplate1, isoTemplate2) => { 
        try {
          return Biometrics.isoVerifyMatch(isoTemplate1, isoTemplate2);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });

    ipcMain.handle('ansiVerifyMatch', async (event, ansiTemplate1, ansiTemplate2) => { 
        try {
          return Biometrics.ansiVerifyMatch(ansiTemplate1, ansiTemplate2);
        }catch (error) {
            console.error(error);
            return error.message;
        }
    });    
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
