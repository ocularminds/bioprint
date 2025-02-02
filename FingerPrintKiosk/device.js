const path = require('path');
const { load } = require('node-api-dotnet');

const assemblyPath = path.resolve(__dirname, 'Dermalog.Imaging.Capturing.dll');
console.log('Attempting to load:', assemblyPath);

try {
  const deviceManager = load(assemblyPath, 'Dermalog.Imaging.Capturing.DeviceManager');
  console.log('Loaded DeviceManager:', deviceManager);

  if (!deviceManager) {
    throw new Error('Failed to load DeviceManager. It is undefined.');
  }
} catch (error) {
  console.error('Error loading .NET assembly:', error);
}


// Dynamically construct the absolute path to the DLL
//const assemblyPath = path.resolve(__dirname, 'Dermalog.Imaging.Capturing.dll');
/*
try {
  // Load the .NET assembly
  const deviceManager = load(assemblyPath, 'Dermalog.Imaging.Capturing.DeviceManager');

  class DeviceManagerWrapper {
    static getVersion() {
        console.log('deviceManager', deviceManager);
      return deviceManager.Version(); // Ensure method call syntax is correct
    }

    static getAvailableDevices() {
      return deviceManager.GetAvailableDevices();
    }

    static getDeviceIdentities() {
      return deviceManager.GetDeviceIdentities();
    }

    static getDevice(deviceIdentity) {
      return deviceManager.GetDevice(deviceIdentity);
    }

    static getDeviceWithInterface(deviceIdentity, interfaceVersion) {
      return deviceManager.GetDevice(deviceIdentity, interfaceVersion);
    }

    static getDeviceWithId(deviceIdentity, deviceId) {
      return deviceManager.GetDevice(deviceIdentity, deviceId);
    }

    static getAttachedDevices(deviceIdentity) {
      return deviceManager.GetAttachedDevices(deviceIdentity);
    }

    static getAdditionalDevices(device) {
      return deviceManager.GetAdditionalDevices(device);
    }

    static getActiveDevice(device) {
      return deviceManager.GetActiveDevice(device);
    }

    static setActiveDevice(index, device) {
      deviceManager.SetActiveDevice(index, device);
    }
  }

  // Example Usage
  (async () => {
    try {
      console.log('DeviceManager Version:', DeviceManagerWrapper.getVersion());

      const availableDevices = DeviceManagerWrapper.getAvailableDevices();
      console.log('Available Devices:', availableDevices);

      const deviceIdentities = DeviceManagerWrapper.getDeviceIdentities();
      console.log('Device Identities:', deviceIdentities);
    } catch (error) {
      console.error('Error:', error);
    }
  })();

  module.exports = DeviceManagerWrapper;
} catch (error) {
  console.error('Failed to load the .NET assembly:', error.message);
}*/
