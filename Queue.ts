export default class Queue
{
	queue:  (() => Promise<void>)[]

	constructor()
	{
		this.queue = [];
	}

	public Add(f: () => Promise<void>): void
	{
		this.queue.push(f);
		if (this.queue.length === 1)
			this.Next();
	}

	public async Next(): Promise<void>
	{
		if (this.queue.length === 0)
			return ;
		const f = this.queue[0];
		await f();
		this.queue.shift();
		this.Next();
	}
}