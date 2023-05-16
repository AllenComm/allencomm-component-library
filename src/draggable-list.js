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
				.sources, .sources > slot {
					display: flex;
					flex-direction: column;
					position: relative;
				}
				::slotted(ac-option) {
					cursor: grab;
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
		this._sources = [];
		this._targets = [];
	}

	get #activeEl() { return this._activeEl; }
	get #sources() { return this._sources; }
	get #targets() { return this._targets; }
	get #targetsElem() { return this.shadowRoot.querySelector('.targets'); }

	set #activeEl(newEl) { this._activeEl = newEl; }
	set #isMouseDown(newVal) { this._isMouseDown = newVal; }
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
					a.setAttribute('drag-current', sourceId);
					a.setAttribute('draggable', 'true');
					a.setAttribute('slot', 'sources');
					a.setAttribute('drag-start', sourceId);
					a.style.position = 'absolute';
					a.style.zIndex = '1';

					const height = a.getBoundingClientRect().height;
					const target = document.createElement('div');
					target.setAttribute('slot', 'targets');
					target.id = `draggable-target-${sourceId + 1}`;
					target.style.height = `${height + 10}px`;
					this.#targetsElem.appendChild(target);
					this.#targets.push(target);

					const parentPos = this.#targetsElem.getBoundingClientRect();
					const childPos = target.getBoundingClientRect();
					a.style.top = `${childPos.y - parentPos.y}px`;

					sourceIndex = sourceIndex + 1;
					sourceId = sourceId + 1;
				}
			});
		}
		window.addEventListener('mouseup', this.handleDragStop);
		window.addEventListener('mousemove', this.handleDrag);
	}

	getTargetIndex = () => {
		const childPos = this.#activeEl.getBoundingClientRect();
		let cur = 0;
		let intersection = 0;
		this.#targets.forEach((a, i) => {
			const rect = a.getBoundingClientRect();
			const y = Math.max(rect.y, childPos.y);
			const yy = Math.min(rect.y + rect.height, childPos.y + childPos.height);
			console.log(y, yy, intersection);
			const h = yy - y;
			if (h > intersection) {
				intersection = h;
				cur = i
			}
		});
		console.log(cur, intersection);
		return cur;
	}

	handleDrag = (e) => {
		e.preventDefault();
		const el = e.target;
		if (this.#activeEl == null) {
			return;
		} else {
			const parentPos = this.#targetsElem.getBoundingClientRect();
			const childPos = this.#activeEl.getBoundingClientRect();
			const nextIndex = this.getTargetIndex();
			const prevIndex = parseInt(this.#activeEl.getAttribute('drag-current'));
			const top = `${(e.clientY - (childPos.height / 2)) - parentPos.y}px`;
			this.#activeEl.style.top = top;
			this.#sources.forEach((a, i) => {
				if (a.id !== this.#activeEl.id && parseInt(a.getAttribute('drag-current')) === nextIndex) {
					a.style.top = `${this.#targets[prevIndex].getBoundingClientRect().y - this.#targetsElem.getBoundingClientRect().y}px`;
					a.setAttribute('drag-current', prevIndex);
					this.#activeEl.setAttribute('drag-current', nextIndex);
				}
			});
			this.#activeEl.setAttribute('drag-current', nextIndex);
		}
	}

	handleDragStart = (e) => {
		e.preventDefault();
		this.#isMouseDown = true;
		if (this.#activeEl != null) {
			return;
		}
		const el = e.target;
		const parentPos = this.#targetsElem.getBoundingClientRect();
		this.#activeEl = el;
		el.setAttribute('dragging', true);
		if (el.style.zIndex != 10) el.style.zIndex = 10;
		if (el.style.cursor != 'grabbing') el.style.cursor = 'grabbing';
	}

	handleDragStop = (e) => {
		e.preventDefault();
		if (this.#activeEl == null) {
			return;
		}
		this.#activeEl.style.top = `${this.#targets[this.getTargetIndex()].getBoundingClientRect().y - this.#targetsElem.getBoundingClientRect().y}px`;
		this.#activeEl.style.zIndex = '1';
		this.#activeEl.removeAttribute('dragging');
		this.#activeEl.style.cursor = 'grab';
		this.#activeEl = null;
	}
};

customElements.define('ac-draggable-list', DraggableList);
