declare module 'archiver' {
	interface ArchiverOptions {
		zlib?: {
			level?: number;
		};
	}

	interface Archiver {
		pipe(stream: NodeJS.WritableStream): this;
		append(source: string | Buffer | NodeJS.ReadableStream, name: string | { name: string }): this;
		file(filepath: string, name: string | { name: string }): this;
		directory(dirpath: string, destpath: string | false, data?: any): this;
		finalize(): Promise<void>;
		on(event: string, listener: Function): this;
	}

	function archiver(format: string, options?: ArchiverOptions): Archiver;

	export = archiver;
}
