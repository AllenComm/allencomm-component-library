export default class DraggableList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					outline: none;
					width: 100%;
				}
				.sources {
					display: flex;
					flex-direction: column;
					position: relative;
				}
				.targets {
					display: flex;
					flex-direction: column;
					position: relative;
				}
			</style>
			<slot></slot>
			<div class='sources'>
				<slot name='sources'></slot>
			</div>
			<div class='targets'></div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._activeEl = null;
		this._activeX = null;
		this._activeY = null;
		this._sources = [];
		this._targets = [];
	}

	get #activeEl() { return this._activeEl; }
	get #activeX() { return this._activeX; }
	get #activeY() { return this._activeY; }
	get #sources() { return this._sources; }
	get #targets() { return this._targets; }
	get #targetsElem() { return this.shadowRoot.querySelector('.targets'); }

	set #activeEl(newEl) { this._activeEl = newEl; }
	set #activeX(newVal) { this._activeX = newVal; }
	set #activeY(newVal) { console.log('new y', newVal); this._activeY = newVal; }
	set #sources(arr) { this._sources = arr; }
	set #targets(arr) { this._targets = arr; }

	connectedCallback() {
		const sources = [...document.querySelectorAll('ac-draggable-list')];
		const sourceCounts = sources.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length;
		});
		const currentTabsIndex = sources.findIndex((a) => a === this);
		const offset = sourceCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let sourceIndex = 0;
		let sourceId = sourceIndex + offset;
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-option') {
					this.#sources.push(a);
					if (!a.id) a.id = `draggable-source-${sourceId + 1}`;
					a.addEventListener('mousedown', this.handleDragStart);
					a.addEventListener('mousemove', this.handleDrag);
					a.addEventListener('mouseup', this.handleDragStop);
					a.setAttribute('draggable', 'true');
					a.setAttribute('slot', 'sources');
					a.style.position = 'absolute';
					a.style.zIndex = '1';

					const height = a.getBoundingClientRect().height;
					const target = document.createElement('div');
					target.setAttribute('slot', 'targets');
					target.id = `draggable-target-${sourceId + 1}`;
					target.style.height = `${height + 10}px`;
					this.#targetsElem.appendChild(target);

					const parentPos = this.#targetsElem.getBoundingClientRect();
					const childPos = target.getBoundingClientRect();
					a.style.top = `${childPos.y - parentPos.y}px`;

					sourceIndex = sourceIndex + 1;
					sourceId = sourceId + 1;
				}
			});
		}
		this.#targetsElem.addEventListener('mouseout', this.handleDragStop);
	}

	handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation(e);
		if (this.#activeEl == null) {
			return;
		}
		const el = e.target;
		if (this.#activeEl.id == el.id) {
			console.log('drag', el.id);
			const parentPos = this.#targetsElem.getBoundingClientRect();
			console.log('y', e.clientY);
			el.style.top = `${e.clientY - parentPos.y}px`;
			// el.style.top = `${e.clientY}px`;
			el.style.zIndex = '2';
		}
	}

	handleDragStart = (e) => {
		e.preventDefault();
		e.stopPropagation(e);
		if (this.#activeEl != null) {
			return;
		}
		const el = e.target;
		console.log('drag start', el.id);
		const startPos = el.getBoundingClientRect();
		const parentPos = this.#targetsElem.getBoundingClientRect();
		this.#activeEl = el;
		this.#activeX = startPos.x - parentPos.x;
		this.#activeY = startPos.y - parentPos.y;
	}

	handleDragStop = (e) => {
		e.preventDefault();
		const el = e.target;
		const parentPos = this.#targetsElem.getBoundingClientRect();
		console.log('drag stop', el.id);
		el.style.zIndex = '1';
		el.style.top = `${this.#activeY - parentPos.y}px`;
		this.#activeEl = null;
	}
};

customElements.define('ac-draggable-list', DraggableList);
