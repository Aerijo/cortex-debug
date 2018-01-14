import * as vscode from "vscode";
import { SWOProcessor } from './common';
import { SWOBinaryPortConfig } from '../common';
import { decoders as DECODER_MAP } from './utils';

function parseEncoded(buffer: Buffer, encoding: string) {
	return DECODER_MAP[encoding] ? DECODER_MAP[encoding](buffer) : DECODER_MAP.unsigned(buffer);
}

export class SWOBinaryProcessor implements SWOProcessor {
	output: vscode.OutputChannel;
	format: string = 'binary';
	port: number;
	scale: number;
	encoding: string;

	constructor(config: SWOBinaryPortConfig) {
		this.port = config.number;
		this.scale = config.scale || 1;
		this.encoding = (config.encoding || 'unsigned').replace('.', '_');

		this.output = vscode.window.createOutputChannel(`SWO: ${config.label || ''} [port: ${this.port}, encoding: ${this.encoding}]`);
	}

	processMessage(buffer: Buffer) {
		let date = new Date();
		
		let hexvalue = buffer.toString('hex');
		let decodedValue = parseEncoded(buffer, this.encoding);
		let scaledValue = decodedValue * this.scale;
		
		this.output.appendLine(`[${date.toISOString()}]   ${hexvalue} - ${decodedValue} - ${scaledValue}`);
	}

	dispose() {
		this.output.dispose();
	}
}