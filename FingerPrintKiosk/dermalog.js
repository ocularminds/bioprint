const BioScanner = require('./scanner');

(async () => {
  try {
    const bioScanner = new BioScanner();
    const {error, result} = await bioScanner.processor.getVersion();
    if (error) {
        console.error('Error getting version:', error);
    } else {
        console.log('Library Version:', result);
    }
    /*
    // Get available devices
    bioScanner.processor.getAvailableDevices(null, (error, devices) => {
      if (error) {
        console.error('Error getting available devices:', error);
      } else {
        console.log('Available Devices:', devices);
      }
    });

    // Get device identities
    bioScanner.processor.getDeviceIdentities(null, (error, identities) => {
      if (error) {
        console.error('Error getting device identities:', error);
      } else {
        console.log('Device Identities:', identities);
      }
    });

    // Get attached devices for a specific device identity
    const deviceIdentity = { id: 'FG_ZF1' }; // Example identity
    bioScanner.processor.getAttachedDevices(deviceIdentity, (error, attachedDevices) => {
      if (error) {
        console.error('Error getting attached devices:', error);
      } else {
        console.log('Attached Devices:', attachedDevices);

        if (attachedDevices.length > 0) {
          // Get the first device
          const deviceIndex = attachedDevices[0].index;
          const deviceParams = { id: deviceIdentity.id, deviceId: deviceIndex };

          bioScanner.processor.getDevice(deviceParams, (error, device) => {
            if (error) {
              console.error('Error getting device:', error);
            } else {
              console.log('Device:', device);

              // Example usage of device methods
              try {
                device.Start();
                console.log('Device started');

                // Set properties
                device.Property['FG_GREEN_LED'] = 1; // Turn on green LED

                // Simulate waiting for an image (event-driven)
                bioScanner.on('scanComplete', () => {
                  console.log('Scan completed. Image captured.');

                  // Stop the device
                  device.Stop();
                  console.log('Device stopped');
                });

                // Simulate image capture event
                setTimeout(() => {
                  const image = device.GetImage();
                  console.log('Captured Image:', image);
                  bioScanner.emit('scanComplete');
                }, 3000);
              } catch (err) {
                console.error('Error during device operations:', err);
              }
            }
          });
        } else {
          console.warn('No attached devices found.');
        }
      
    });}*/
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();
