export default class Accordion extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-bottom: 1px solid #000;
					display: grid;
					flex-direction: column;
					justify-items: flex-start;
					grid-template-columns: 100%;
					width: 100%;
				}
			</style>
			<slot name='content'></slot>
		`;
		this._buttons = [];
		this._content = [];
		this._selected = -1;
		this._selectedArr = [];
	}

	get selected() {
		const multiple = this.getAttribute('aria-multiselectable');
		if (multiple !== null && multiple) {
			return this._selectedArr;
		}
		return this._selected;
	}

	get #buttons() { return this._buttons; }
	get #content() { return this._content; }

	set #buttons(arr) { this._buttons = arr; }
	set #content(arr) { this._content = arr; }
	set #selected(newVal) {
		if (typeof(newVal) === 'object' && newVal?.isArray()) {
			this._selectedArr = newVal;
		} else {
			this._selected = newVal;
		}
	}

	connectedCallback() {
		const initialSelected = this.getAttribute('selected');
		const multiple = this.getAttribute('multiple');
		const buttons = [...document.querySelectorAll('ac-accordion')];
		const buttonCounts = buttons.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-accordion-button').length;
		});
		const currentTabsIndex = buttons.findIndex((a) => a === this);
		const offset = buttonCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let buttonIndex = 0;
		let contentIndex = 0;
		let buttonId = buttonIndex + offset;
		let contentId = contentIndex + offset;

		if (multiple != null && multiple) {
			this.setAttribute('aria-multiselectable', true);
			this.#selected = [];
		}

		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-accordion-button') {
					const buttonSelected = a.getAttribute('selected') || false;
					this.#buttons.push(a);
					a.addEventListener('click', this.handleChange);
					a.setAttribute('slot', 'content');
					a.setAttribute('aria-selected', false);
					a.style.setProperty('grid-row', (buttonIndex > 0 ? (buttonIndex * 2) + 1 : 1));
					if (!a.id) a.id = `button-${buttonId + 1}`;
					if (initialSelected === a.id || buttonSelected) {
						if (multiple) {
							this.#selected = this.selected.push(buttonIndex);
						} else {
							this.#selected = buttonIndex;
						}
						a.setAttribute('aria-selected', true);
					}
					buttonIndex = buttonIndex + 1;
					buttonId = buttonId + 1;
				} else if (a.nodeName.toLowerCase() === 'ac-accordion-content') {
					this.#content.push(a);
					a.setAttribute('slot', 'content');
					a.setAttribute('hidden', true);
					a.setAttribute('role', 'region');
					a.style.setProperty('grid-row', (contentIndex > 0 ? (contentIndex * 2) + 2 : 2));
					if (!a.id) a.id = `content-${contentId + 1}`;
					if (this.#buttons[contentIndex]) {
						this.#buttons[contentIndex].setAttribute('aria-controls', a.id);
						a.setAttribute('aria-labelledby', this.#buttons[contentIndex].id);
					}
					if (multiple) {
						if (this.selected.findIndex((i) => i === contentIndex) > -1) {
							a.setAttribute('hidden', false);
						}
					} else {
						if (this.selected === contentIndex) {
							a.setAttribute('hidden', false);
						}
					}
					contentIndex = contentIndex + 1;
					contentId = contentId + 1;
				}
			});
		}
		this.addEventListener('keydown', this.handleKeydown);
	}

	handleChange = (e) => {
		e.stopPropagation();
		const target = e.target;
		const multiple = this.getAttribute('aria-multiselectable');
		const cur = target.getAttribute('aria-selected') === 'true';
		if (!multiple) {
			this.#buttons.forEach((a, i) => {
				if (a.id !== target.id && a.getAttribute('aria-selected')) {
					a.setAttribute('aria-selected', false);
					this.#content[i].setAttribute('hidden', true);
				} else {
					target.setAttribute('aria-selected', true);
					this.#selected = i;
					this.#content[i].setAttribute('hidden', false);
				}
			});
		} else {
			const i = this.#buttons.findIndex((a) => a === target);
			target.setAttribute('aria-selected', !cur);
			this.#content[i]?.setAttribute('hidden', cur);
			if (cur) {
				this.#selected = this.selected.slice().splice(this.selected.indexOf(i), 1);
			} else {
				this.#selected = this.selected.push(i);
			}
		}
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				if (e.target.nodeName.toLowerCase() === 'ac-accordion-button') {
					e.preventDefault();
					e.stopPropagation();
					this.handleChange(e);
				}
				break;
		}
	}
}

customElements.define('ac-accordion', Accordion);
