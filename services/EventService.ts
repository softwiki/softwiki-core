interface EventInfo
{
	name: string
	id: string
	handler: (args: unknown) => void
}

export class EventService
{
	private events: {[name: string]: EventInfo[]} = {}
	private eventsExistance: {[id: string]: EventInfo} = {}
	
	Subscribe(name: string, id: string, handler: (args: unknown) => void): void
	{
		if (this.events[name] === undefined)
			this.events[name] = [];

		if (this.eventsExistance[id])
		{
			if (this.eventsExistance[id].name !== name)
				throw new Error("Error: Duplicate ID on different events");
			const index = this.events[name].findIndex(eventInfo => eventInfo.id === id);
			this.events[name][index].handler = handler;
		}
		else
		{
			const eventInfo: EventInfo = {name, id, handler};
			this.events[name].push(eventInfo);
			this.eventsExistance[id] = eventInfo;
		}
	}

	Run(name: string, args: unknown = {}): void
	{
		if (this.events[name] === undefined)
			return;
		this.events[name].forEach(eventInfo => 
		{
			eventInfo.handler(args);
		});
	}
}

export default new EventService();