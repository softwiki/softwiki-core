export default class Queue
{
	queue:  (() => Promise<void>)[]

	constructor()
	{
		this.queue = [];
	}

	public add(f: () => Promise<void>): void
	{
		this.queue.push(f);
		if (this.queue.length === 1)
			this.next();
	}

	public async next(): Promise<void>
	{
		if (this.queue.length === 0)
			return ;
		const f = this.queue[0];
		await f();
		this.queue.shift();
		this.next();
	}
}