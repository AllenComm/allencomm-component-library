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
					display: flex;
					position: absolute;
					z-index: 1;
				}
				::slotted(ac-option[dragging="true"]) {
					cursor: grabbing;
					z-index: 10;
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

					const handle = document.createElement('span');
					handle.setAttribute('class', 'handle');
					handle.style.cursor = 'grab';
					handle.style.order = '-1';
					handle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48">
							<path d="M349.911 896Q321 896 300.5 875.411q-20.5-20.588-20.5-49.5Q280 797 300.589 776.5q20.588-20.5 49.5-20.5Q379 756 399.5 776.589q20.5 20.588 20.5 49.5Q420 855 399.411 875.5q-20.588 20.5-49.5 20.5Zm260 0Q581 896 560.5 875.411q-20.5-20.588-20.5-49.5Q540 797 560.589 776.5q20.588-20.5 49.5-20.5Q639 756 659.5 776.589q20.5 20.588 20.5 49.5Q680 855 659.411 875.5q-20.588 20.5-49.5 20.5Zm-260-250Q321 646 300.5 625.411q-20.5-20.588-20.5-49.5Q280 547 300.589 526.5q20.588-20.5 49.5-20.5Q379 506 399.5 526.589q20.5 20.588 20.5 49.5Q420 605 399.411 625.5q-20.588 20.5-49.5 20.5Zm260 0Q581 646 560.5 625.411q-20.5-20.588-20.5-49.5Q540 547 560.589 526.5q20.588-20.5 49.5-20.5Q639 506 659.5 526.589q20.5 20.588 20.5 49.5Q680 605 659.411 625.5q-20.588 20.5-49.5 20.5Zm-260-250Q321 396 300.5 375.411q-20.5-20.588-20.5-49.5Q280 297 300.589 276.5q20.588-20.5 49.5-20.5Q379 256 399.5 276.589q20.5 20.588 20.5 49.5Q420 355 399.411 375.5q-20.588 20.5-49.5 20.5Zm260 0Q581 396 560.5 375.411q-20.5-20.588-20.5-49.5Q540 297 560.589 276.5q20.588-20.5 49.5-20.5Q639 256 659.5 276.589q20.5 20.588 20.5 49.5Q680 355 659.411 375.5q-20.588 20.5-49.5 20.5Z"/>
						</svg>`;
					a.appendChild(handle);

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
		document.addEventListener('mouseup', this.handleDragStop);
		document.addEventListener('mousemove', this.handleDrag);
	}

	getTargetIndex = () => {
		const childPos = this.#activeEl.getBoundingClientRect();
		let cur = 0;
		let intersection = 0;
		this.#targets.forEach((a, i) => {
			const rect = a.getBoundingClientRect();
			const y = Math.max(rect.y, childPos.y);
			const yy = Math.min(rect.y + rect.height, childPos.y + childPos.height);
			const area = yy - y;
			if (area > intersection) {
				intersection = area;
				cur = i
			}
		});
		return cur;
	}

	handleDrag = (e) => {
		e.preventDefault();
		if (this.#activeEl == null || e.button !== 0) {
			return;
		} else {
			const parentPos = this.#targetsElem.getBoundingClientRect();
			const childPos = this.#activeEl.getBoundingClientRect();
			const nextIndex = this.getTargetIndex();
			const prevIndex = parseInt(this.#activeEl.getAttribute('drag-current'));
			const restrainedY = e.clientY < parentPos.y
				? parentPos.y
				: e.clientY > parentPos.y + parentPos.height
					? parentPos.y + parentPos.height
					: e.clientY;
			const top = `${(restrainedY - (childPos.height / 2)) - parentPos.y}px`;
			this.#activeEl.style.top = top;
			this.#sources.forEach((a) => {
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
		if (this.#activeEl != null || e.button !== 0) {
			return;
		}

		const findParentOption = (elem) => {
			if (elem.parentNode && elem.parentNode.nodeName.toLowerCase() == 'ac-option') {
				return elem.parentNode;
			} else if (elem.parentNode) {
				return findParentOption(elem.parentNode);
			} else {
				return null;
			}
		};

		let el = e.target;
		if (el.nodeName.toLowerCase() != 'ac-option') {
			el = findParentOption(el);
		}
		this.#activeEl = el;
		el.setAttribute('dragging', true);
		const handle = [...el.childNodes].find((a) => a.className == 'handle');
		if (handle != null) {
			console.log(handle);
			handle.style.cursor = 'grabbing';
		}
	}

	handleDragStop = (e) => {
		e.preventDefault();
		if (this.#activeEl == null || e.button !== 0) {
			return;
		}
		this.#activeEl.removeAttribute('dragging');
		this.#activeEl.style.top = `${this.#targets[this.getTargetIndex()].getBoundingClientRect().y - this.#targetsElem.getBoundingClientRect().y}px`;
		this.#activeEl.style.zIndex = null;
		this.#activeEl = null;
	}
}

customElements.define('ac-draggable-list', DraggableList);