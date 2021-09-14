export default class SoftWikiError extends Error {
	constructor(private _message: string) {
		super(_message);
		//this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}