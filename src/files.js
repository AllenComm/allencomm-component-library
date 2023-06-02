export default class Files extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				#drop-zone {
					align-items: center;
					border: 2px dashed;
					border-radius: 10px;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					justify-content: center;
					padding: 30px;
					width: 100%;
				}
				#drop-zone:hover img {
					filter: invert(25%) sepia(87%) saturate(2352%) hue-rotate(205deg) brightness(106%) contrast(107%);
				}
				#drop-zone.dragover {
					border-color: #0075ff;
				}
				#list {
					background-color: #d3d3d3;
				}
				#list:has(*) {
					margin-top: 30px;
					padding: 12px;
				}
				input {
					display: none;
				}
				.item {
					align-items: center;
					display: flex;
					justify-content: space-between;
					overflow: hidden;
					width: 100%;
				}
				.item > span {
					max-width: calc(100% - 30px);
				}
				.item > button {
					align-items: center;
					background-color: transparent;
					border: none;
					cursor: pointer;
					display: flex;
				}
				.item > button > img {
					opacity: .4;
					width: 16px;
				}
				.item > button:hover > img {
					opacity: 1;
				}
			</style>
			<button id="drop-zone">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABH9JREFUaEPtmFmIHFUUhr/uHpGo+KIiKIQ8KC4DihHRaBAVokRxZ0YQNYoQNSEuqIiCzPiioOCGC0FxXCHEBxdcg6CESF4SotEEg3F9UEQQH4XMdMtfdav6dNetqltVDclAX2imp+vcc/7/bPfcarHIV2uR42dM4GBHcByBcQQaemCcQkMOXAWcBpzu/up7B/gR+An4HfgU2NrQ8en2UUVgKfAIcEc+MJnqJY+3dGDTAsw1JTIKAgIt8CKRWQOwzdPo9zYb6XJnExJNCWwCbjAAvgV2AvuYYDfzfOPcfiZwhvtcDxxh9mwBLqtLogmBZ4B7jeGXgEeBf0rAXAg8C5xl5D4BrqhDoi6BB4EnI4NxjqwFXqkCoA1vdOGWdE+bDXR5oYqOxHzVPTcC7/SxczXwYVUlTv5y4GOz92bg7Sq66kRgG3CBM/IBcE0Vgx5ZdaJbXSR/A04GDoTqrErgKkCgtfYBp4YaKpA7DvgFONLJ3Aa8Hqq3KoHXABnQWg18FmqoRG4d8KIrqC8AHYhBqwoBtUGdoicAP7iTtsRIZwoWJPNuieApTmcstowl/Mp/IQxCCKx0fVq9+pxIaYv36HFdiYEpYLOTmQ4g8TdwrJOfBPY2JXC2C+u5ZgRIdD7hTt88Gxa8k+lMw0J+JFpso5c2hyuBj5oQuAR4EzgxR8ka99z3OAbvnyGKIvEypGPFPcDzdQkoNdSLlxgQs8B+4Dtgd4Hivuc9BKKfOkyz4KmJNjN0kR0t/X2sDoFlwJdRGcVLxao+r5ZZthz4FPkeQLmsmtlDz32PtWQj4QhEu1v8RS9ylj7bi+pnoIjbMNfVoRIvzTTHlKF2z6dasDkdlkHgle/WoyIYE/KTmDHyw2a/BtYDGhYHliUg4HMmba4F3g8gMFywAi8P63dLQIRUG5P9a8FAJGagNetpGBZCJrUsAU2Tdznp4BwEbgdedfsS8GqB1qOJPt3U1FonXaIVzD4TK2D+POAh4Ph+SR22HA7sSlhZAhppV7sIhPRt65kHonkm9nzSv61HrUMSEnKYPmXrJNeRdPJryUk6m/7VP5aA7q0S1go+SIx1AbOHTz8CbWbpDnSVYdkyEpJXMR/tBDXKKzIDBEwNjuSVoy+FyoAWPbf60inYRmAHoNNXS1fAon4fAmTUBJRCSnOtdBK2BDYCa10N6Kb0VgjKApmiFKqrOpMllsDdwHNOs25cN9W14vblFXFdtRfFh2zUj3wRmFgF83pDkKwqrdQHatQppE73lDPkrQE9U9pYz4eM23kejQi4/t3UGbLxfdwdI43eLpQA0UXicIPqYuCrGnHvp1C2jVZVZ6OZew4kSj2zfDQShEyjFljTFFoB6CS+f2isXw54T2Jr/Hzgc+Co5MWPz2VucozGxxY9jTg2VWzbi7b7rwiFLx+HzRbOQj6MjwMPB8c7myr2dM+qycOelfzDvTjO3NJCivRS814zeceZx8lXrPcBTw9vCPC7cl2jyc+uvf+ZlwXBDj4UBUMicCjiTjGNCRzs8IwjMI5AQw8s+hT6H7bQB0CP4BRuAAAAAElFTkSuQmCC"></img>
				<slot></slot>
			</button>
			<div id="list"></div>
			<input type="file"></input>
		`;
		this._files = [];
		this._multiple = false;
	}
	
	get #dropZone() { return this.shadowRoot.querySelector('#drop-zone'); }
	get #input() { return this.shadowRoot.querySelector('input'); }
	get #list() { return this.shadowRoot.querySelector('#list'); }
	get files () { return this._files; }

	connectedCallback() {
		const accept = this.getAttribute('accept');
		if (accept) this.#input.setAttribute('accept', accept);
		if (this.getAttribute('multiple') === 'true') {
			this._multiple = true;
			this.#input.setAttribute('multiple', '');
		}

		this.#input.addEventListener('change', this.handleInputChange)
		this.#dropZone.addEventListener('click', this.handleClick);
		this.#dropZone.addEventListener('drop', this.handleDrop);
		this.#dropZone.addEventListener('dragover', this.handleDragOver);
		this.#dropZone.addEventListener('dragleave', this.handleDragLeave);
	}

	handleClick = () => {
		this.#input.click();
	}

	handleDragLeave = () => {
		this.#dropZone.classList.remove('dragover');
	}

	handleDragOver = (e) => {
		e.preventDefault();
		this.#dropZone.classList.add('dragover');
	}

	handleDrop = (e) => {
		e.preventDefault();
		const items = e?.dataTransfer?.items || [];
		[...items].forEach((item) => {
			if (item.kind === 'file') {
				const file = item.getAsFile();
				this.addFile(file);
				this.handleDragLeave();
			}
		});
	}

	handleInputChange = (e) => {
		const files = e.target.files || [];
		[...files].forEach(file => {
			this.addFile(file);
		})
		e.target.value = '';
	}

	addFile = (file) => {
		const accept = this.getAttribute('accept');
		if (accept && accept.indexOf(file.type) === -1) return;

		if (this._multiple) {
			this._files.push(file);
		} else {
			this.clear();
			this._files = [file];
		}
		const node = document.createElement('DIV');
		node.className = 'item';
		node.innerHTML = `<span>${file.name}</span><button><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAVUlEQVQ4y+WSuREAIAgEtwm6sP+MKixIAwPfUS6WEHZn+ODzSDi2ZQ0nnQWnkBfFyBT8LLTiqOyZq/LEZyiEj0oQ70oYlwWxJXFoca3y4eTXkJ/vm6g9L0LBODY4BgAAAABJRU5ErkJggg=="></img></button>`;
		node.querySelector('button').addEventListener('click', () => this.removeFile(file, node));
		this.#list.appendChild(node);	
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	clear = () => {
		this.#list.innerHTML = '';
		this._files = [];
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	removeFile = (file, node) => {
		const index = this._files.findIndex(f => f.name === file.name && f.lastModified === file.lastModified);
		this._files.splice(index, 1);
		this.#list.removeChild(node);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-files', Files);
