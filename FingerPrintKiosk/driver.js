const edge = require('electron-edge-js');
const path = require('path');

const dllFile = path.resolve(__dirname, 'bin','DermalogVC3.dll');
const driver = edge.func({        
    //references: [dllFile],
    source: function() {/*
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    using System.Threading.Tasks;
    
    public static class Win32 {
        [DllImport("kernel32.dll")]
        public static extern IntPtr LoadLibrary(string file);

        [DllImport("kernel32.dll")]
        public static extern IntPtr GetProcAddress(IntPtr hModule, string procedureName);

        [DllImport("kernel32.dll")]
        public static extern bool FreeLibrary(IntPtr hModule);

        [DllImport("kernel32.dll")]
        public static extern int GetLastError();
    }

    public class Loader {       

        private IntPtr libPointer;   
        private static Loader loaderInstance;     

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate uint GetVCVersion(StringBuilder szVersion, ref int nLength);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate uint SetCallbacks(int nFGHandle, uint nChannel, CBOnStart_VC fpOnStart);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate uint AvailableDevices(int nFGHandle, [In][Out][MarshalAs(UnmanagedType.LPArray)] DeviceInformations[] pDevInfo, ref uint nCount);
        
        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnDetect_VC(int nFGHandle, uint nChannelNo, int nType, IntPtr pImage, IntPtr pClientData);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnWarning_VC(int nFGHandle, uint nChannel, StringBuilder szWarningMsg, IntPtr pClientData);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnImage_VC(int nFGHandle, uint nChannel, IntPtr pImage, IntPtr pClientData);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate uint StartCapture(int nFGHandle, uint nChannel, CaptureMode eCaptureMode, CBOnImage_VC fpOnImage, CBOnDetect_VC pfOnDetect, CBOnError_VC fpOnError, CBOnWarning_VC pfOnWarning, [MarshalAs(UnmanagedType.AsAny)] object pClientData);
        
        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate uint StopCapture(int nFGHandle, uint nChannelNo);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnStart_VC(int nFGHandle, uint nChannel, IntPtr pClientData);
        
        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnStop_VC(int nFGHandle, uint nChannel, IntPtr pClientData);
        
        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
        public delegate void CBOnError_VC(int nFGHandle, uint nChannel, string szErrMsg, IntPtr pClientData);
        
        public GetVCVersion GetVersion { get; private set; }

        public AvailableDevices GetDevices { get; private set; }

        public SetCallbacks Callbacks { get; private set; }

        public StartCapture StartCapturing{ get; private set; }

        public StopCapture StopCapturing { get; private set; }
   
        public static Loader GetInstance() {
            if (loaderInstance == null) {
                loaderInstance = new Loader();
            }
            return loaderInstance;
        }

        private Loader() {
            string file = "DermalogVC3.dll";
            libPointer = Win32.LoadLibrary(file);
            Console.WriteLine("Loaded DLL pointer: " + libPointer);
            if (libPointer == IntPtr.Zero) {
                int errorCode = Marshal.GetLastWin32Error();
                Console.WriteLine("Failed to load DLL. Error Code: "+errorCode);
            } else {
                Console.WriteLine("DLL Loaded Successfully.");
                //LoadFunctionsV1();
                //LoadFunctionsV2();
            }
        }

        ~Loader() {
            if (libPointer != IntPtr.Zero) {
                if (!Win32.FreeLibrary(libPointer)) {
                    throw new Exception("Free library failed!");
                }
                libPointer = IntPtr.Zero;
            }
        }
        static Func<object, Task<object>> jsOnStart;
        static Func<object, Task<object>> jsOnStop;
        static Func<object, Task<object>> jsOnError;
        static Func<object, Task<object>> jsOnDetect;
        static Func<object, Task<object>> jsOnImage;
        static Func<object, Task<object>> jsOnWarning;

        static CBOnStart_VC onStartDelegate = new CBOnStart_VC(OnStartCallback);
        static CBOnStop_VC onStopDelegate = new CBOnStop_VC(OnStopCallback);
        static CBOnError_VC onErrorDelegate = new CBOnError_VC(OnErrorCallback);
        static CBOnDetect_VC onDetectDelegate = new CBOnDetect_VC(OnDetectCallback);
        static CBOnImage_VC onImageDelegate = new CBOnImage_VC(OnImageCallback);
        static CBOnWarning_VC onWarningDelegate = new CBOnWarning_VC(OnWarningCallback);

        static void OnStartCallback(int nFGHandle, uint nChannel, IntPtr pClientData) {
            if(jsOnStart != null){
                jsOnStart.Invoke("Capture Started: Handle="+nFGHandle+", Channel="+nChannel);
            }
        }

        static void OnStopCallback(int nFGHandle, uint nChannel, IntPtr pClientData) {
            if(jsOnStop != null){
                jsOnStop.Invoke("Capture Stopped: Handle="+nFGHandle+", Channel="+nChannel);
            }
        }

        static void OnErrorCallback(int nFGHandle, uint nChannel, string szErrMsg, IntPtr pClientData) {
            if(jsOnError != null){
                jsOnError.Invoke("Error: Handle="+nFGHandle+", Channel="+nChannel+", Message="+szErrMsg);
            }
        }

        static void OnDetectCallback(int nFGHandle, uint nChannelNo, int nType, IntPtr pImage, IntPtr pClientData) {
            if(jsOnDetect != null) {
                jsOnDetect.Invoke("Capture Started: Handle="+nFGHandle+", Channel="+nChannelNo);
            }
        }

        static void OnImageCallback(int nFGHandle, uint nChannel, IntPtr pImage, IntPtr pClientData) {
            if(jsOnImage != null) {
                jsOnImage.Invoke("Capture Stopped: Handle="+nFGHandle+", Channel="+nChannel);
            }
        }

        static void OnWarningCallback(int nFGHandle, uint nChannel, StringBuilder szWarningMsg, IntPtr pClientData) {
            if(jsOnWarning != null){
                jsOnWarning.Invoke("Error: Handle="+nFGHandle+", Channel="+nChannel+", Message="+szWarningMsg);
            }
        }

        public void registerCallbacks(dynamic input) {           
            jsOnStart = (Func<object, Task<object>>)input.onStart;
            jsOnStop = (Func<object, Task<object>>)input.onStop;
            jsOnError = (Func<object, Task<object>>)input.onError;
            jsOnDetect = (Func<object, Task<object>>)input.onDetect;
            jsOnImage = (Func<object, Task<object>>)input.onImage;
            jsOnWarning = (Func<object, Task<object>>)input.onWarning;
        }

        public uint doCapture(int nFGHandle, uint channel) {       
            uint result = Loader.GetInstance().StartCapturing(
                nFGHandle, channel, CaptureMode.LIVE_IMAGE,
                onImageDelegate, 
                onDetectDelegate, 
                onErrorDelegate,
                onWarningDelegate,
                null  // No custom client data
            );
            return result;
        }

        public void doCallbacks(int nFGHandle, uint channel) {   
            Loader.GetInstance().Callbacks(nFGHandle, channel, onStartDelegate);
        }
    }

    public enum ColorMode {GRAY_8, RGB_8, RGB_16, RGB_24, RGB_32}
    public enum CaptureMode {
        LIVE_IMAGE,	PLAIN_FINGER, ROLLED_FINGER,
        FAST_PLAIN_FINGER, PREVIEW_IMAGE,
        PREVIEW_IMAGE_AUTO_DETECT, SLAP_FINGER_LFOUR,
        SLAP_FINGER_RFOUR, SLAP_FINGER_THUMBS, SLAP_FINGER_LTHUMB,
        SLAP_FINGER_RTHUMB, SLAP_HAND, ROLLED_FINGER_LTHUMB, ROLLED_FINGER_LINDEX,
        ROLLED_FINGER_LMIDDLE, ROLLED_FINGER_LRING, ROLLED_FINGER_LLITTLE, 
        ROLLED_FINGER_RTHUMB, ROLLED_FINGER_RINDEX, ROLLED_FINGER_RMIDDLE,
        ROLLED_FINGER_RRING, ROLLED_FINGER_RLITTLE, SLAP_HAND_LPALM,
        SLAP_HAND_RPALM, WRITER_PALM_LEFT, WRITER_PALM_RIGHT, SIGNATURE
    }
        
    public struct DeviceInformations {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 100)]
        public string name;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 100)]
        public string version;

        public int index;

        public override string ToString() {
            return "Device Information: Name= "+name+" Version = "+version+" Index = "+index;
        }
    }
    
    public class Driver {        

        public async Task<object> HandleVersion(dynamic input) {
            StringBuilder version = new StringBuilder(100);
            int length = version.Capacity;
            uint result = Loader.GetInstance().GetVersion(version, ref length);
            return await Task.Run(() => result == 0 ? version.ToString() : "Error Code: "+result);
        }

        // Get Available Devices
        public async Task<object> HandleDevices(dynamic input) {
            uint deviceCount = 0;
            DeviceInformations[] devices = new DeviceInformations[10]; // Assuming a max of 10 devices
            uint result = Loader.GetInstance().GetDevices(1, devices, ref deviceCount);
            return await Task.Run(() =>  devices);
        }

        // Start Capture
        public async Task<object> HandleStart(dynamic input) {
            int nFGHandle = 1; // Assuming first fingerprint scanner
            uint channel = 0;  // Default channel
            uint result = Loader.GetInstance().doCapture(nFGHandle, channel);
            return await Task.Run(() => result == 0 ? "Capture Started Successfully" : "Error: "+result);
        }

        // Stop Capture
        public async Task<object> HandleStop(dynamic input) {
            int nFGHandle = 1;
            uint channel = 0;
            uint result = Loader.GetInstance().StopCapturing(nFGHandle, channel);
            return await Task.Run(() => result == 0 ? "Capture Stopped Successfully" : "Error: "+result);
        }

        public async Task<object> HandleCallbacks(dynamic input) {
            int nFGHandle = 1;
            uint channel = 0;
            Loader.GetInstance().doCallbacks(nFGHandle, channel);
            return await Task.Run(() => "Callbacks Registered Successfully");
        }            
    }

    public class Startup {
   
       Driver driver = new Driver();

        public async Task<object> Invoke(dynamic input) {
            string task = input.task;
            Console.WriteLine(task);
            switch (task) {
                case "getVersion": return await driver.HandleVersion(input);
                case "getAvailableDevices": return await driver.HandleDevices(input);
                case "startCapture": return await driver.HandleStart(input);
                case "stopCapture": return await driver.HandleStop(input);
                case "registerCallbacks": return await driver.HandleCallbacks(input);
                default: return "Unknown Task";
            }
        }
    }
*/}});

module.exports = driver;
