console.log("Renderer: script loaded successfully!");

document.addEventListener('DOMContentLoaded', () => {    
    console.log("Renderer: DOM fully loaded! Attaching event listeners...");
    const verifyBtn = document.getElementById('verify-btn');
    const startCaptureBtn = document.getElementById('start-capture-btn');
    const stopCaptureBtn = document.getElementById('stop-capture-btn');
    const accountNumberInput = document.getElementById('account-number');
    const fingerprintContainer = document.getElementById('fingerprint-container');
    const statusMessage = document.getElementById('status-message');
    const fingerprintPlaceholder = document.getElementById('fingerprint-placeholder');
    const sdkVersionSpan = document.getElementById('sdk-version');
    const availableDevicesSpan = document.getElementById('available-devices');

    // Verify Account
    verifyBtn.addEventListener('click', () => {
        const accountNumber = accountNumberInput.value.trim();
        if (!accountNumber) {
            alert('Please enter an account number.');
            return;
        }
        console.log("Verify button clicked. Sending IPC event...");
        window.Dermalog.send('verify-account', accountNumber);
    });

    // Start Capture
    startCaptureBtn.addEventListener('click', () => {
        window.Dermalog.send('start-capture');
    });

    // Stop Capture
    stopCaptureBtn.addEventListener('click', () => {
        window.Dermalog.send('stop-capture');
    });

    // Listen for Account Verification Result
    window.Dermalog.on('account-verified', () => {
        fingerprintContainer.style.display = 'block';
        statusMessage.textContent = "Ready to Capture";

        // Request SDK Version and Available Devices
        window.Dermalog.send('get-sdk-version');
        window.Dermalog.send('get-available-devices');
    });

    // Display SDK Version
    window.Dermalog.on('sdk-version', (event, version) => {
        sdkVersionSpan.textContent = version;
    });

    // Display Available Devices
    window.Dermalog.on('available-devices', (event, devices) => {
        availableDevicesSpan.textContent = devices.length > 0 ? devices.join(', ') : 'No devices found';
    });

    // Capture Status Updates
    window.Dermalog.on('capture-started', () => {
        statusMessage.textContent = "Place Finger";
        fingerprintPlaceholder.src = "assets/fingerprint.png";
    });

    window.Dermalog.on('capture-completed', () => {
        statusMessage.textContent = "Capture Successful!";
        fingerprintPlaceholder.src = "assets/checkmark.png";
    });

    window.Dermalog.on('capture-error', (event, message) => {
        statusMessage.textContent = "Capture Failed: " + message;
    });
});
