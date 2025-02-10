const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const driver = require('./driver');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Ensures security
            contextIsolation: true, // Required for contextBridge
            enableRemoteModule: false
        }
    });

    mainWindow.loadFile('index.html');
    
    //mainWindow.webContents.openDevTools();
});

// Account Verification
ipcMain.on('verify-account', async (event, accountNumber) => {
    console.log(`Verifying account: ${accountNumber}`);
    setTimeout(() => {
        mainWindow.webContents.send('account-verified');
    }, 1000);
});

// Fetch SDK Version
ipcMain.on('get-sdk-version', async () => {
    try {
        const version = await driver({ task: "getVersion" });
        mainWindow.webContents.send('sdk-version', version);
    } catch (error) {
        console.error("Error getting SDK version:", error);
        mainWindow.webContents.send('sdk-version', "Error fetching version");
    }
});

// Fetch Available Devices
ipcMain.on('get-available-devices', async () => {
    try {
        const devices = await driver({ task: "getAvailableDevices" });
        mainWindow.webContents.send('available-devices', devices);
    } catch (error) {
        console.error("Error getting available devices:", error);
        mainWindow.webContents.send('available-devices', []);
    }
});

// Start Capture
ipcMain.on('start-capture', async () => {
    try {
        await driver({
            task: "registerCallbacks",
            onStart: async (msg) => {
                console.log("Fingerprint Capture Started");
                mainWindow.webContents.send('capture-started');
                return null;
            },
            onStop: async (msg) => {
                console.log("Fingerprint Capture Stopped");
                mainWindow.webContents.send('capture-completed');
                return null;
            },
            onError: async (msg) => {
                console.error("Fingerprint Error:", msg);
                mainWindow.webContents.send('capture-error', msg);
                return null;
            }
        });

        console.log("Starting fingerprint capture...");
        console.log(await driver({ task: "startCapture" }));

    } catch (error) {
        console.error("Error starting capture:", error);
        mainWindow.webContents.send('capture-error', error.message);
    }
});

// Stop Capture
ipcMain.on('stop-capture', async () => {
    try {
        console.log(await driver({ task: "stopCapture" }));
    } catch (error) {
        console.error("Error stopping capture:", error);
        mainWindow.webContents.send('capture-error', error.message);
    }
});
