export class UnknownIdError extends Error {
	constructor(private _message: string) {
		super(_message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, UnknownIdError.prototype);
		Error.captureStackTrace(this, this.constructor);
	}
}

export class WrongDataStructure extends Error {
	constructor(private _message: string) {
		super(_message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, WrongDataStructure.prototype);
		//Error.captureStackTrace(this, this.constructor);
	}
}