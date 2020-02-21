import { SWOSource } from './common';
import { EventEmitter } from 'events';
import * as net from 'net';
import * as os from 'os';
import * as vscode from 'vscode';
import * as path from 'path';

export class SerialSWOSource extends EventEmitter implements SWOSource {
    private serialPort: any = null;
    public connected: boolean = false;

    constructor(private device: string, private baudRate: number, extensionPath: string) {
        super();

        const binaryPath = path.normalize(path.join(extensionPath, 'binary_modules', process.version, os.platform(), process.arch, 'node_modules'));
        if (module.paths.indexOf(binaryPath) === -1) {
            module.paths.splice(0, 0, binaryPath);
        }

        let SerialPort;
        try {
            SerialPort = module.require('serialport');
        }
        catch (e) {
            // tslint:disable-next-line:max-line-length
            vscode.window.showErrorMessage('Unable to load Serial Port Module. A recent Visual Studio Code update has likely broken compatibility with the serial module. Please visit https://github.com/Marus/cortex-debug for more information.');
            return;
        }

        this.serialPort = new SerialPort(device, { baudRate: baudRate, autoOpen: false });
        this.serialPort.on('data', (buffer) => {
            this.emit('data', buffer);
        });
        this.serialPort.on('error', (error) => {
            vscode.window.showErrorMessage(`Unable to open serial port: ${device} - ${error.toString()}`);
        });
        this.serialPort.on('open', () => {
            this.connected = true;
            this.emit('connected');
        });
        this.serialPort.open();
    }

    public dispose() {
        if (this.serialPort) {
            this.serialPort.close();
            this.emit('disconnected');
        }
    }
}
