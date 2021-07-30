export default class Queue
{
	queue:  (() => Promise<void>)[]

	constructor()
	{
		this.queue = []
	}

	public Add(f: () => Promise<void>)
	{
		this.queue.push(f)
		if (this.queue.length === 1)
			this.Next()
	}

	public async Next()
	{
		if (this.queue.length === 0)
			return ;
		let f = this.queue[0]
		await f()
		this.queue.shift()
		this.Next()
	}
}