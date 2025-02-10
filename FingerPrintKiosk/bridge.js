const driver = require('./driver');

async function main() {
    try {
        const version = await driver({ task: "getVersion" });
        console.log("SDK Version:", version);

        await driver({
            task: "registerCallbacks",
            onStart: async (msg) => {
                console.log("JS Callback - Start:", msg);
                return null;
            },
            onStop: async (msg) => {
                console.log("JS Callback - Stop:", msg);
                return null;
            },
            onError: async (msg) => {
                console.log("JS Callback - Error:", msg);
                return null;
            },
            onDetect: async (msg) => {
                console.log("JS Callback - Detect:", msg);
                return null;
            },
            onImage: async (msg) => {
                console.log("JS Callback - Image:", msg);
                return null;
            },
            onWarning: async (msg) => {
                console.log("JS Callback - Warning:", msg);
                return null;
            }
        });

        console.log("Callbacks registered successfully.");
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
