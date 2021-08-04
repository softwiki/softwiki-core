interface EventInfo
{
	name: string
	id: string
	handler: (args: unknown) => void
}

export class EventService
{
	private _events: {[name: string]: EventInfo[]} = {}
	private _eventsExistance: {[id: string]: EventInfo} = {}
	
	public subscribe(name: string, id: string, handler: (args: unknown) => void): void
	{
		if (this._events[name] === undefined)
			this._events[name] = [];

		if (this._eventsExistance[id])
		{
			if (this._eventsExistance[id].name !== name)
				throw new Error("Error: Duplicate ID on different events");
			const index = this._events[name].findIndex(eventInfo => eventInfo.id === id);
			this._events[name][index].handler = handler;
		}
		else
		{
			const eventInfo: EventInfo = {name, id, handler};
			this._events[name].push(eventInfo);
			this._eventsExistance[id] = eventInfo;
		}
	}

	public run(name: string, args: unknown = {}): void
	{
		if (this._events[name] === undefined)
			return;
		this._events[name].forEach(eventInfo => 
		{
			eventInfo.handler(args);
		});
	}
}

export default new EventService();