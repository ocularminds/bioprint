const FingerLibrary = require('./engine');

const Biometrics = {

    checkError: (msg, err) => {
      if (err !== 0) {
        let errorDetails = FingerLibrary.IEngine_GetErrorMessage(err);
        console.log(`${msg}: Error ${err} - ${errorDetails}`);
        //process.exit(err);
      }
    },
    
    initialize: async () => {
        let ret = FingerLibrary.IEngine_Init();
        Biometrics.checkError('IEngine_Init', ret);
    },

    terminate: () => {    
        let ret = FingerLibrary.IEngine_Terminate();
        Biometrics.checkError('IEngine_Terminate', ret);
    },

    getHardwareId: async () => {        
        let length = Buffer.alloc(4); 
        let ret = FingerLibrary.IEngine_GetHwid(null, length);
        Biometrics.checkError('IEngine_GetHardwareId', ret);

        let hwId = Buffer.alloc(length.readInt32LE()); 
        ret = FingerLibrary.IEngine_GetHwid(hwId, length); 
        Biometrics.checkError("IEngine_GetHardwareId", ret);
        console.log(`This computer's HWID is: ${hwId.toString()}`);
        return hwId.toString();
    },

    getVersion: async () => {      
        let version = FingerLibrary.IEngine_GetVersionString(); 
        console.log(`SDK version: ${version}`);
        return version;
    },

    loadImage: async (fileName) => {
        let width = Buffer.alloc(4); 
        let height = Buffer.alloc(4); 
        let length = Buffer.alloc(4);
        let ret = FingerLibrary.IEngine_LoadBMP(fileName, width, height, null, length); 
        Biometrics.checkError("IEngine_LoadBMP", ret); 
        console.log(`First image: ${fileName} - image width: ${width.readInt32LE()}, image height: ${height.readInt32LE()}, length: ${length.readInt32LE()} B`); 
        let data = Buffer.alloc(length.readInt32LE()); 
        ret = FingerLibrary.IEngine_LoadBMP(fileName, width, height, data, length); 
        Biometrics.checkError("IEngine_LoadBMP", ret); 
        let quality = Buffer.alloc(4); 
        ret = FingerLibrary.IEngine_GetImageQuality(width.readInt32LE(), height.readInt32LE(), data, quality); 
        Biometrics.checkError("IEngine_GetImageQuality", ret);
        console.log(`Image quality: ${quality.readInt32LE()}`);
        return {width: width.readInt32LE(), height: height.readInt32LE(), quality: quality.readInt32LE(), data};
    },

    loadISOTemplate: async (fileName) => {
        const isoLoadedTemplate = Buffer.alloc(FingerLibrary.TemplateParams.IEngine_MAX_ISO_TEMPLATE_SIZE);
        let ret = FingerLibrary.ISO_LoadTemplate(fileName, isoLoadedTemplate);
        Biometrics.checkError('ISO_LoadTemplate', ret);

        const sizePtr = Buffer.alloc(4);
        const paramRet = FingerLibrary.ISO_GetTemplateParameter(isoLoadedTemplate, PARAM_TEMPLATE_SIZE, sizePtr);
        Biometrics.checkError("ISO_GetTemplateParameter", paramRet);

        const templateSize = sizePtr.readInt32LE();
        console.log(`Template size of loaded ISO template in bytes: ${templateSize}`);
        return templateSize;
    },

    saveISOTemplate: async (fileName, isoTemplate) => {        
        let ret = FingerLibrary.IEngine_ISO_SaveTemplate(fileName, isoTemplate);
        Biometrics.checkError('ISO_SaveTemplate', ret);
    },

    createIsoTemplate: async (width, height, data) => { 
        console.log('Creating ISO Template...');
        let isoTemplate = Buffer.alloc(1024); 
        ret = FingerLibrary.ISO_CreateTemplate(width, height, data, isoTemplate);
        Biometrics.checkError("ISO_CreateTemplate", ret);
        console.log(`Created templated: ${isoTemplate}`);
        return isoTemplate;
    },

    ansiTemplateSizeAndMinutiaeCount: async (ansiTemplate) => {
        let value = Buffer.alloc(4); 
        let ret = FingerLibrary.ANSI_GetTemplateParameter(ansiTemplate, FingerLibrary.PARAM_TEMPLATE_SIZE, value); 
        Biometrics.checkError('ANSI_GetTemplateParameter', ret);
        console.log(`Template size of ANSI template in bytes: ${value.readInt32LE()}`); 
        let minutiaeCount = Buffer.alloc(4); 
        const minutiae = Buffer.alloc(256 * FingerLibrary.IENGINE_MINUTIAE_SIZE); 
        ret = FingerLibrary.ANSI_GetMinutiae(ansiTemplate, minutiae, minutiaeCount); 
        Biometrics.checkError('ANSI_GetMinutiae', ret); 
        console.log(`Number of minutiae points in ANSI template: ${minutiaeCount.readInt32LE()}`);
        return minutiaeCount.readInt32LE();
    },

    isoTemplateSizeAndMinutiaeCount: async (isoTemplate) => {
        let value = Buffer.alloc(4); 
        let ret = FingerLibrary.ISO_GetTemplateParameter(isoTemplate, FingerLibrary.PARAM_TEMPLATE_SIZE, value); 
        Biometrics.checkError('ISO_GetTemplateParameter', ret); 
        console.log(`Template size of ISO template in bytes: ${value.readInt32LE()}`); 
        let minutiaeCount = Buffer.alloc(4); 
        const minutiae = Buffer.alloc(256 * FingerLibrary.IENGINE_MINUTIAE_SIZE); 
        ret = FingerLibrary.ISO_GetMinutiae(isoTemplate, minutiae, minutiaeCount); 
        Biometrics.checkError('ISO_GetMinutiae', ret); 
        console.log(`Number of minutiae points in ISO template: ${minutiaeCount.readInt32LE()}`);
        return minutiaeCount.readInt32LE();
    },

    setAndGetFingerPosition: async (isoTemplate, position) => {
        let ret = FingerLibrary.ISO_SetTemplateParameter(isoTemplate, FingerLibrary.PARAM_FINGER_POSITION, position); 
        Biometrics.checkError('ISO_SetTemplateParameter', ret); 
        let value = Buffer.alloc(4); 
        ret = FingerLibrary.ISO_GetTemplateParameter(isoTemplate, FingerLibrary.PARAM_FINGER_POSITION, value); 
        Biometrics.checkError('ISO_GetTemplateParameter', ret); 
        console.log(`Finger position of ISO template: ${value.readInt32LE()}`);
        return value.readInt32LE();
    },
    isoVerifyMatch: async (isoTemplate1, isoTemplate2) => { 
        console.log('Verifying match of ISO template...');     
        let score = Buffer.alloc(4);
        const maxRotation = 180;
        let ret = FingerLibrary.ISO_VerifyMatch(isoTemplate1, isoTemplate2, maxRotation, score);
        Biometrics.checkError('ISO_VerifyMatch', ret);    
        console.log(`Similarity score (calculated from ISO templates): ${score.readInt32LE()}`);
        return score.readInt32LE();
    },
    ansiVerifyMatch: async (ansiTemplate1, ansiTemplate2) => {     
        let score = Buffer.alloc(4);
        const maxRotation = 180;
        let ret = FingerLibrary.ANSI_VerifyMatch(ansiTemplate1, ansiTemplate2, maxRotation, score);
        Biometrics.checkError('ANSI_VerifyMatch', ret);    
        console.log(`Similarity score (calculated from ANSI templates): ${score.readInt32LE()}`);
        return score.readInt32LE();
    }

}

module.exports = Biometrics;
