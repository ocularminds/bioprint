const EventEmitter = require('events');
const winston = require('winston');
const edge = require('edge-js');
const path = require('path');
//const edge = require('./loader');

class BioScanner extends EventEmitter {
  constructor(logger = null) {
    super();
    //process.env.EDGE_APP_ROOT = __dirname;
    //process.env.EDGE_USE_CORECLR = 0; // Force .NET Framework
    process.env.EDGE_EXECUTABLE_OPTIONS = "--arch=ia32"; 
    this.logger = logger || winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'bio.scanner.log' }),
      ],
    });
    this.scanCompleteEvent = false;
    this.pulseScanner = null;
    this.imageString = '';
    this.singleScanMode = true;
    this.logger.info('BioScanner initialized');
    this.dermalogApiPath = path.resolve(__dirname, 'bin','Dermalog.Imaging.Capturing.dll');
    this.dermalogVC3Path = path.resolve(__dirname, 'bin','DermalogVC3.dll');
    this.processor = {
       execute: edge.func({        
        references: [this.dermalogApiPath],
        source: function() {
          /*          
          using System;
          using System.Reflection;
          using System.Threading.Tasks;
          using Dermalog.Imaging.Capturing;

          public class Startup {

              public async Task<object> Invoke(dynamic input) {
                Console.WriteLine("Task: "+input.task);
                if ((string)input.task == "version"){
                  Console.WriteLine("Reading SDK version...");
                  //VC3LibHandler handler = VC3LibHandler.GetInstance();
                  Console.WriteLine("VC3LibHandler initiated...");
                  return await Task.Run(() => DeviceManager.Version);
                }
          
                if ((string)input.task == "device")
                  return await Task.Run(() => DeviceManager.GetDevice((DeviceIdentity)input.identity));
          
                if ((string)input.task == "devices")
                  return await Task.Run(() => DeviceManager.GetAvailableDevices());
          
                if ((string)input.task == "identities")
                  return await Task.Run(() => DeviceManager.GetDeviceIdentities());
          
                if ((string)input.task == "attached")
                  return await Task.Run(() => DeviceManager.GetAttachedDevices((DeviceIdentity)input.identity));

                return await Task.Run(() => "Unknown method");
              }
          }*/
        }, 
    }),
    process: async (taskParams) => {
        try {
            const result = await new Promise((resolve, reject) => {
                this.processor.execute(taskParams, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
            return { error: null, result };
        } catch (error) {
            return { error, result: null };
        }
    },
    
      getVersion: async () => this.processor.process({task: 'version'}),
      getAvailableDevices: async () => await this.processor.process({task: 'devices'}),
      getDeviceIdentities: async () => await this.processor.process({task: 'identities'}),
      getDevice:           async (identity) => await this.processor.process({task: 'device', identity}),
      getAttachedDevices:  async (identity) => await this.processor.process({task: 'attached', identity})
    };
  }

  startUp(waitForCompletion = true, timeoutInSeconds = 0) {
    this.singleScanMode = waitForCompletion;
    this.stopSequence();

    if (this.initiateSequence() && this.pulseScanner) {
      this.hookEvents();
      this.pulseScanner.Start();

      if (waitForCompletion) {
        this.scanCompleteEvent = false;
        this.logger.info('Waiting for scan completion');

        const waitTimeout = setTimeout(() => {
          if (!this.scanCompleteEvent) {
            this.logger.warn(`Scan did not complete within ${timeoutInSeconds} seconds.`);
            this.stopSequence();
          }
        }, timeoutInSeconds * 1000);

        this.once('scanComplete', () => {
          clearTimeout(waitTimeout);
          this.stopSequence();
        });
      }
    }
  }

  initiateSequence() {
    const scannerInfo = this.scannerScoutMaster();
    if (scannerInfo.success) {
      this.pulseScanner = this.processor.getDevice({ id: 'FG_ZF1', deviceId: scannerInfo.index }, true);
      this.pulseScanner.CaptureMode = 'PREVIEW_IMAGE_AUTO_DETECT';
      return true;
    }
    return false;
  }

  stopSequence() {
    if (this.pulseScanner) {
      this.setLedState('FG_GREEN_LED', false);
      this.setLedState('FG_RED_LED', false);

      if (this.pulseScanner.IsCapturing) {
        this.pulseScanner.Stop();
      }

      this.unhookEvents();
      this.pulseScanner = null;
    }
  }

  hookEvents() {
    this.pulseScanner.OnStart = this.onScanningStart.bind(this);
    this.pulseScanner.OnImage = this.onScanningImage.bind(this);
    this.pulseScanner.OnDetect = this.onScanningDetect.bind(this);
    this.pulseScanner.OnError = this.onScanningError.bind(this);
    this.pulseScanner.OnWarning = this.onScanningWarning.bind(this);
    this.pulseScanner.OnStop = this.onScanningStop.bind(this);
  }

  unhookEvents() {
    this.pulseScanner.OnStart = null;
    this.pulseScanner.OnImage = null;
    this.pulseScanner.OnDetect = null;
    this.pulseScanner.OnError = null;
    this.pulseScanner.OnWarning = null;
    this.pulseScanner.OnStop = null;
  }

  scannerScoutMaster() {
    try {
      const attachedDevices = this.processor.getAttachedDevices({ id: 'FG_ZF1' }, true);
      if (attachedDevices && attachedDevices.length > 0) {
        this.logger.info('Scanner detected');
        return { success: true, index: attachedDevices[0].index };
      } else {
        this.logger.error('No scanner detected');
        return { success: false, index: -1 };
      }
    } catch (error) {
      this.logger.error(`Error scouting scanner: ${error.message}`);
      return { success: false, index: -1 };
    }
  }

  onScanningStart() {
    this.logger.info('Scanning started');
  }

  onScanningImage() {
    this.setLedState('FG_GREEN_LED', true);
  }

  onScanningDetect(image) {
    if (this.singleScanMode && this.scanCompleteEvent) return;

    this.setLedState('FG_GREEN_LED', false);

    if (!image) {
      this.scanCompleteEvent = true;
      this.emit('scanComplete');
      return;
    }

    try {
      this.imageString = this.getTemplateString(image);
      this.logger.info('Image captured successfully');
      this.scanCompleteEvent = true;
      this.emit('scanComplete');
    } catch (error) {
      this.logger.error(`Error processing image: ${error.message}`);
    }
  }

  onScanningError(error) {
    this.logger.error(`Scanner error: ${error}`);
    this.setLedState('FG_RED_LED', true);
    setTimeout(() => this.setLedState('FG_RED_LED', false), 1000);
    this.stopSequence();
  }

  onScanningWarning(warning) {
    this.logger.warn(`Scanner warning: ${warning}`);
  }

  onScanningStop() {
    this.logger.info('Scanning stopped');
  }

  setLedState(property, status) {
    if (this.pulseScanner) {
      try {
        this.pulseScanner.Property[property] = status ? 1 : 0;
      } catch (error) {
        this.logger.error(`Error setting LED state: ${error.message}`);
      }
    }
  }

  getTemplateString(image) {
    // Implement image-to-template conversion logic here
    // This may involve calling a native module or SDK
    return Buffer.from(image).toString('base64');
  }
}

module.exports = BioScanner;
