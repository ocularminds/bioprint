const koffi = require('koffi'); 
const lib = koffi.load('./iengine_ansi_iso');
const IENGINE_MAX_ISO_TEMPLATE_SIZE = 1024; // Replace with actual size
const IENGINE_MAX_ANSI_TEMPLATE_SIZE = 1024; // Replace with actual size
const PARAM_TEMPLATE_SIZE = 1; // Replace with actual constant
const PARAM_FINGER_POSITION = 2; // Replace with actual constant
const LEFT_THUMB = 1; // Replace with correct constant for finger position

// Define types
const BYTE_ARRAY = koffi.struct(`BYTE_ARRAY`, {data: koffi.array('uint8', IENGINE_MAX_ISO_TEMPLATE_SIZE,'Array')});
const INT_PTR = koffi.pointer('int');
const FingerLibrary = {
  IEngine_GetErrorMessage: lib.func('const char* IEngine_GetErrorMessage(int* errorcode)'),
  IEngine_GetHwid: lib.func('int IEngine_GetHwid(char* hwid, int* length)'),
  IEngine_GetVersionString: lib.func('const char* IEngine_GetVersionString()'),
  IEngine_Init: lib.func('int IEngine_Init()'),
  IEngine_Terminate: lib.func('int IEngine_Terminate()'),
  IEngine_GetImageQuality: lib.func('int IEngine_GetImageQuality(int width, int height, BYTE_ARRAY* rawData, int* quality)'),
  IEngine_LoadBMP: lib.func('int IEngine_LoadBMP(const char* fileName, int* width, int* height, BYTE_ARRAY* rawData, int* length)'),
  ISO_LoadTemplate: lib.func('int ISO_LoadTemplate(const char* fileName, BYTE_ARRAY* template)'),
  ISO_GetTemplateParameter: lib.func('int ISO_GetTemplateParameter(BYTE_ARRAY* template, int paramType, int* value)'),
  ISO_SetTemplateParameter: lib.func('int ISO_SetTemplateParameter(BYTE_ARRAY* template, int paramType, int value)'),
  ANSI_GetTemplateParameter: lib.func('int ANSI_GetTemplateParameter(BYTE_ARRAY* template, int paramType, int* value)'),
  ANSI_GetMinutiae: lib.func('int ANSI_GetMinutiae(BYTE_ARRAY* template, BYTE_ARRAY* minutiae, int* minutiaeCount)'),
  ISO_GetMinutiae: lib.func('int ISO_GetMinutiae(BYTE_ARRAY* template, BYTE_ARRAY* minutiae, int* minutiaeCount)'),
  ISO_CreateTemplate: lib.func('int ISO_CreateTemplate(int width, int height, BYTE_ARRAY* rawData, BYTE_ARRAY* template)'),
  ANSI_CreateTemplate: lib.func('int ANSI_CreateTemplate(int width, int height, BYTE_ARRAY* rawData, BYTE_ARRAY* template)'),
  ISO_ConvertToANSI: lib.func('int ISO_ConvertToANSI(BYTE_ARRAY* isoTemplate, int* length, BYTE_ARRAY* ansiTemplate)'),
  ANSI_ConvertToISO: lib.func('int ANSI_ConvertToISO(BYTE_ARRAY* ansiTemplate, int* length, BYTE_ARRAY* isoTemplate)'),
  ISO_VerifyMatch: lib.func('int ISO_VerifyMatch(BYTE_ARRAY* isoTemplate1, BYTE_ARRAY* isoTemplate2, int maxRotation, int* score)'),
  ANSI_VerifyMatch: lib.func('int ANSI_VerifyMatch(BYTE_ARRAY* ansiTemplate1, BYTE_ARRAY* ansiTemplate2, int maxRotation, int* score)'),
  TemplateParams: {
    BLOCK_SIZE_PIXELS: 12,
    IENGINE_MAX_ANSI_TEMPLATE_SIZE: 1568,
    IENGINE_MAX_ISO_TEMPLATE_SIZE: 1566,
    IENGINE_MAX_IMAGE_HEIGHT: 1800,
    IENGINE_MAX_IMAGE_WIDTH: 1800,
    IENGINE_MIN_IMAGE_HEIGHT: 90,
    IENGINE_MIN_IMAGE_WIDTH: 90,
    MAX_MINUTIAE_POINTS: 256
  },
  Position: {
    LEFT_INDEX: 0,
    LEFT_LITTLE: 1,
    LEFT_MIDDLE: 2,
    LEFT_RING: 3,
    LEFT_THUMB: 4,
    RIGHT_INDEX: 5,
    RIGHT_LITTLE: 6,
    RIGHT_MIDDLE: 7,
    RIGHT_RING: 8,
    RIGHT_THUMB: 9,
    UNKNOWN_FINGER: 10,
  }
};

function checkError(msg, err) {
    if (err !== 0 && err !== 'ANSI_ISO_SDK_2.4.10.0') {
        console.error(`${msg}: Error code ${err}`);
        throw new Error(`${msg} failed with error code ${err}`);
    }
} 

 const main = () => { 
    try{        
        //const lengthPtr = koffi.alloc('int'); 
        //const versionString = Buffer.alloc(256); 
        const versionString = FingerLibrary.IEngine_GetVersionString(); 
        //checkError("IEngine_GetVersionString", ret); 
        console.log(`Version string: ${versionString.toString()}`);
        /*
        // Convert the hardware ID to a string
        const hwId = hwIdBuffer.toString('utf8', 0, length);
        console.log(`This computer's HWID is: ${hwId}`);
        
        const versionString = FingerLibrary.IEngine_GetVersionString();
        if (!versionString) {
            throw new Error("Failed to retrieve version string.");
        }
        console.log(`Version string: ${versionString}`);*/
       // return versionString; 
        // Initialize 
        ret = FingerLibrary.IEngine_Init(); 
        checkError('IEngine_Init', ret); 
        // Load BMP fingerprint.bmp 
        let width = Buffer.alloc(4); 
        let height = Buffer.alloc(4); 
        const fp1 = 'fingerprint1.bmp'; 
        let rawData1Length = Buffer.alloc(4); 
        ret = FingerLibrary.IEngine_LoadBMP(fp1, width, height, null, rawData1Length); 
        checkError('IEngine_LoadBMP', ret); 
        console.log(`First image: ${fp1} - image width: ${width.readInt32LE()}, image height: ${height.readInt32LE()}, length: ${rawData1Length.readInt32LE()} B`); 
    } catch(e) {
        console.log("error running self test: ", e);
    }
};
module.exports = FingerLibrary;