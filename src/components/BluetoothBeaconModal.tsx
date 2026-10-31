import React, { useState } from 'react';
import { 
  X, 
  Bluetooth, 
  Radio, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface BluetoothBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RsuBeaconDevice {
  id: string;
  name: string;
  corridor: string;
  mac: string;
  rssi: number; // dBm
  battery: number; // %
  status: 'discovered' | 'pairing' | 'connected';
  sensorId: number;
  frequency: string;
}

export const BluetoothBeaconModal: React.FC<BluetoothBeaconModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  });
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'simulated'>('prompt');
  const [devices, setDevices] = useState<RsuBeaconDevice[]>([
    {
      id: 'rsu-ble-01',
      name: 'RSU-BLE-Gateway #01 (I-405 Node)',
      corridor: 'San Diego Freeway (Sensor #107)',
      mac: 'C4:7D:4F:92:1A:01',
      rssi: -58,
      battery: 94,
      status: 'connected',
      sensorId: 107,
      frequency: '2.4 GHz BLE 5.2'
    },
    {
      id: 'rsu-ble-02',
      name: 'RSU-BLE-Gateway #02 (I-10 Santa Monica)',
      corridor: 'Santa Monica Freeway (Sensor #118)',
      mac: 'E2:15:33:B8:4C:12',
      rssi: -67,
      battery: 88,
      status: 'discovered',
      sensorId: 118,
      frequency: '2.4 GHz BLE 5.2'
    },
    {
      id: 'rsu-ble-03',
      name: 'Loop-Sensor-OBD #773869 (US-101 Hollywood)',
      corridor: 'Hollywood Freeway (Sensor #142)',
      mac: 'D8:A0:1D:64:9F:88',
      rssi: -74,
      battery: 79,
      status: 'discovered',
      sensorId: 142,
      frequency: '2.4 GHz BLE 5.0'
    },
    {
      id: 'rsu-ble-04',
      name: 'Induction-Radar-Beacon #04 (I-110 Harbor)',
      corridor: 'Harbor Freeway (Sensor #189)',
      mac: 'FA:3B:7C:10:E2:44',
      rssi: -82,
      battery: 92,
      status: 'discovered',
      sensorId: 189,
      frequency: '2.4 GHz BLE 5.3'
    }
  ]);

  if (!isOpen) return null;

  // Web Bluetooth API Request
  const handleRequestBluetoothPermission = async () => {
    setIsScanning(true);

    try {
      if (typeof navigator !== 'undefined' && 'bluetooth' in navigator && (navigator as any).bluetooth?.requestDevice) {
        // Attempt native Web Bluetooth device prompt
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        });

        if (device) {
          setPermissionStatus('granted');
          // Add device to list
          const newBeacon: RsuBeaconDevice = {
            id: `rsu-ble-${Date.now()}`,
            name: device.name || 'Hardware Edge Bluetooth Unit',
            corridor: 'Live Highway Node (Detected)',
            mac: 'A0:B1:C2:D3:E4:F5',
            rssi: -52,
            battery: 100,
            status: 'connected',
            sensorId: 99,
            frequency: '2.4 GHz BLE 5.2'
          };
          setDevices(prev => [newBeacon, ...prev]);
        }
      } else {
        // Fallback for sandboxed iframes
        setPermissionStatus('simulated');
      }
    } catch (err: any) {
      console.log('Web Bluetooth request note:', err?.message || err);
      // Clean fallback for iframe environment permissions
      setPermissionStatus('simulated');
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  const handleToggleConnect = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === 'connected' ? 'discovered' : 'connected'
        };
      }
      return d;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-sky-50/70 via-cyan-50/40 to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Bluetooth className="w-5 h-5 text-sky-600 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Bluetooth Edge Sensor & RSU Scanner
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/70">
                  Web Bluetooth API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan, authorize, and pair nearby Roadside Units (RSUs) & Highway Bluetooth induction beacons for local edge model gradient transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
          {/* Permission Prompt Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Bluetooth Device Permission: {permissionStatus === 'granted' ? 'Authorized (Native BLE)' : permissionStatus === 'simulated' ? 'Active (Edge Simulator)' : 'Ready to Request'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Allows direct discovery of IEEE 802.15.1 Roadside Units without central GPS tracking
                </span>
              </div>
            </div>

            <button
              onClick={handleRequestBluetoothPermission}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning BLE Band...' : 'Scan / Request Permission'}</span>
            </button>
          </div>

          {/* Discovered RSU Devices List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Detected Roadside Units ({devices.length} nearby)</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {devices.filter(d => d.status === 'connected').length} Paired
              </span>
            </div>

            <div className="space-y-2">
              {devices.map((device) => {
                const isConnected = device.status === 'connected';
                return (
                  <div
                    key={device.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isConnected
                        ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-300/40'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isConnected ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Bluetooth className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {device.name}
                          </span>
                          {isConnected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Paired
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {device.corridor}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>MAC: {device.mac}</span>
                          <span>RSSI: {device.rssi} dBm</span>
                          <span>Battery: {device.battery}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleConnect(device.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
                          isConnected
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        {isConnected ? 'Disconnect' : 'Connect & Pair'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paired RSUs stream weight differentials with zero raw video logging</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
