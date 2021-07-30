export function EmitWindowEvent(eventName: string, args?: any)
{
	const event = new CustomEvent(eventName, {detail: args});
	window.dispatchEvent(event)
}

export function HandleWindowEvent(event: string, func: Function) : WindowEventRef
{
	window.addEventListener(event, func as EventListener);
	let ref = new WindowEventRef(event, func)
	return ref
}

export class WindowEventRef
{
	name: string
	func: Function
	constructor(name: string, func: Function)
	{
		this.name = name
		this.func = func
	}

	Delete() : void
	{
		window.removeEventListener(this.name, this.func as EventListener)
	}
}

