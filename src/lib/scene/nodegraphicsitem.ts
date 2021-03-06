import { SocketGraphicsItem, SocketType } from "./socketgraphicsitem";
import { ImageCanvas } from "../designer/imagecanvas";
import { GraphicsItem } from "./graphicsitem";

export class NodeGraphicsItemRenderState {
	hovered: boolean = false;
	selected: boolean = false;
}

export class NodeGraphicsItem extends GraphicsItem {
	id!: string;
	sockets: SocketGraphicsItem[] = Array();
	public title: string;
	thumbnail!: HTMLImageElement;
	imageCanvas: ImageCanvas;

	// albedo, norma, height, etc...
	textureChannel: string;

	constructor(title: string) {
		super();
		this.width = 100;
		this.height = 100;
		this.title = title;
		this.imageCanvas = new ImageCanvas();
	}

	public setTextureChannel(name: string) {
		this.textureChannel = name;
	}

	public clearTextureChannel() {
		this.textureChannel = null;
	}

	public setThumbnail(thumbnail: HTMLImageElement) {
		this.thumbnail = thumbnail;
	}

	public move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
		for (let sock of this.sockets) {
			sock.move(dx, dy);
		}
	}

	draw(ctx: CanvasRenderingContext2D, renderData: any) {
		const renderState = <NodeGraphicsItemRenderState>renderData;

		// border
		if (renderState.selected) {
			ctx.strokeStyle = "rgb(255, 255, 255)";
			ctx.beginPath();
			ctx.lineWidth = 8;
			//ctx.rect(this.x, this.y, this.width, this.height);
			this.roundRect(ctx, this.x, this.y, this.width, this.height, 2);
			ctx.stroke();
		}

		// background
		ctx.beginPath();
		ctx.fillStyle = "rgb(255, 50, 50)";
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fill();

		// thumbnail if any
		if (this.thumbnail) {
			//ctx.drawImage(this.thumbnail,this.x, this.y, this.width, this.height);
		}

		ctx.drawImage(
			this.imageCanvas.canvas,
			this.x,
			this.y,
			this.width,
			this.height
		);

		// title
		if (!renderState.hovered) {
			ctx.beginPath();
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.rect(this.x, this.y, this.width, 20);
			ctx.fill();

			ctx.beginPath();
			//ctx.font = "14px monospace";
			ctx.font = "bold 9px 'Open Sans'";
			ctx.fillStyle = "rgb(255,255,255)";
			let size = ctx.measureText(this.title);
			let textX = this.centerX() - size.width / 2;
			let textY = this.y + 14;
			ctx.fillText(this.title, textX, textY);
		}

		ctx.beginPath();
		ctx.lineWidth = 4;
		// if (renderState.selected) ctx.strokeStyle = "rgb(255, 255, 255)";
		// else ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.strokeStyle = "rgb(0, 0, 0)";
		//ctx.rect(this.x, this.y, this.width, this.height);
		this.roundRect(ctx, this.x, this.y, this.width, this.height, 2);
		ctx.stroke();

		for (let sock of this.sockets) {
			sock.draw(ctx, renderState);
		}

		// texture channel
		if (this.textureChannel) {
			ctx.beginPath();
			//ctx.font = "14px monospace";
			ctx.font = "12px 'Open Sans'";
			ctx.fillStyle = "rgb(200, 255, 200)";
			let size = ctx.measureText(this.textureChannel.toUpperCase());
			let textX = this.centerX() - size.width / 2;
			let textY = this.y + this.height + 14;
			ctx.fillText(this.textureChannel.toUpperCase(), textX, textY);
		}
	}

	public setCenter(x: number, y: number) {
		super.setCenter(x, y);
		this.sortSockets();
	}

	public sortSockets() {
		// top and bottom padding for sockets
		let pad = 10;

		// sort in sockets
		let socks = this.getInSockets();
		let incr = (this.height - pad * 2) / socks.length;
		let mid = incr / 2.0;
		let i = 0;
		for (let sock of socks) {
			let y = pad + i * incr + mid;
			let x = this.x;
			sock.setCenter(x, this.y + y);
			i++;
		}

		// sort out sockets
		socks = this.getOutSockets();
		incr = (this.height - pad * 2) / socks.length;
		mid = incr / 2.0;
		i = 0;
		for (let sock of socks) {
			let y = pad + i * incr + mid;
			let x = this.x + this.width;
			sock.setCenter(x, this.y + y);
			i++;
		}
	}

	getInSockets() {
		var array = new Array();
		for (var sock of this.sockets) {
			if (sock.socketType == SocketType.In) array.push(sock);
		}

		return array;
	}

	getInSocketByName(name: string): SocketGraphicsItem {
		for (var sock of this.sockets) {
			if (sock.socketType == SocketType.In)
				if (sock.title == name)
					//todo: separate title from name
					return sock;
		}

		return null;
	}

	getOutSockets() {
		var array = new Array();
		for (var sock of this.sockets) {
			if (sock.socketType == SocketType.Out) array.push(sock);
		}

		return array;
	}

	getOutSocketByName(name: string): SocketGraphicsItem {
		// blank or empty name means first out socket
		if (!name) {
			let socks = this.getOutSockets();
			if (socks.length > 0) return socks[0];
			else {
				console.log(
					"[warning] attempting to get  output socket from node with no output sockets"
				);
				return null;
			}
		}

		for (var sock of this.sockets) {
			if (sock.socketType == SocketType.Out)
				if (sock.title == name)
					//todo: separate title from name
					return sock;
		}

		return null;
	}

	// adds socket to node
	public addSocket(name: string, id: string, type: SocketType) {
		var sock = new SocketGraphicsItem();
		sock.id = id;
		sock.title = name;
		sock.node = this;
		sock.socketType = type;
		this.sockets.push(sock);

		this.sortSockets();
	}
}
