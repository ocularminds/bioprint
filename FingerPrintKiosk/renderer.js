document.getElementById('btnSelfTest').addEventListener('click', async () => {
    try {
        console.log('Starting Self Test...');
        let hwId = await window.biometrics.getHardwareId();    
        console.log(`This computer's Hardware ID is: ${hwId}`);
    
        const versionString = await window.biometrics.getVersion();    
        console.log(`Version string: ${versionString}`);
        
        await window.biometrics.initialize();
        const fp1 = 'fingerprint.bmp';
        let response = await window.biometrics.loadImage(fp1);    
        console.log(`First image: ${fp1} - image width: ${response.width}, image height: ${response.height}, length: ${response.length} B`);
        
        // Load BMP fingerprint2.bmp
        const fp2 = 'fingerprint2.bmp';
        const resp = await window.biometrics.loadImage(fp2);     
        console.log(`Second image: ${fp2} - image width: ${resp.width}, image height: ${resp.height}, length: ${resp.length} B`);
      
        // ISO create template1
        const {width, height, data} = response;
        const isoTemplate1 = await window.biometrics.createIsoTemplate(width, height, data);
        const isoTemplate2 = await window.biometrics.createIsoTemplate(resp.width, resp.height, resp.data);
        const scoreISO = await window.biometrics.isoVerifyMatch(isoTemplate1, isoTemplate2);
    
        // ANSI create template
        const ansiTemplate1 = await window.biometrics.createAnsiTemplate(width, height, data);
        const ansiTemplate2 = await window.biometrics.createAnsiTemplate(resp.width, resp.height, resp.data);
        
        const scoreANSI = await window.biometrics.ansiVerifyMatch(ansiTemplate1, ansiTemplate2);
    
        // ANSI verify match
        console.log(`Similarity score (calculated from ISO templates): ${scoreISO}`);
        console.log(`Similarity score (calculated from ANSI templates): ${scoreANSI}`);
    
        // OPTIONAL - get template size and minutiae count
        await window.biometrics.ansiTemplateSizeAndMinutiaeCount(ansiTemplate1);
        await window.biometrics.isoTemplateSizeAndMinutiaeCount(isoTemplate1);
    
        // OPTIONAL - ISO save template1
        await window.biometrics.saveISOTemplate('fingerprint.iso', isoTemplate1);
        await window.biometrics.loadISOTemplate('fingerprint.iso');
        await window.biometrics.setAndGetFingerPosition(isoTemplate1, IEngine.LEFT_THUMB);    
        await window.biometrics.terminate();
    
    } catch (error) {
        console.error('An error occurred:', error);
    }
      
});

document.getElementById('btnLoadTemplate').addEventListener('click', async () => {
    const fileName = document.getElementById('fileName').value;
    const output = await window.biometrics.loadISOTemplate(fileName);
    document.getElementById('output').textContent = output;
});

document.getElementById('btnInitiate').addEventListener('click', async () => {
    const accountNumber = document.getElementById('accountNumber').value;
    const kioskStationID = document.getElementById('kioskStationID').value;
    const response = await window.handlers.handleInitiate(accountNumber, kioskStationID);
    console.log('Initiate Request Response:', response);
});

document.getElementById('btnGetAll').addEventListener('click', async () => {
    const kioskStationID = document.getElementById('kioskStationID').value;
    const response = await window.handlers.handleGetFingers(kioskStationID);
    console.log('Poll Requests Response:', response);
});

document.getElementById('btnVerify').addEventListener('click', async () => {
    const id = document.getElementById('requestId').value;
    const status = document.getElementById('status').value;
    const fingerprintTemplate = document.getElementById('fingerprintTemplate').value;
    const response = await window.handlers.handleVerifyFinger(id, status, fingerprintTemplate);
    console.log('Update Status Response:', response);
});
