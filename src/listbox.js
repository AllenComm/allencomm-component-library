export default class Listbox extends HTMLElement {
	static observedAttributes = ['multiple', 'selected'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					align-items: flex-start;
					display: flex;
					flex-direction: column;
					gap: 10px;
					justify-items: center;
					padding: 1px;
				}
				:host([aria-activedescendant]:not([aria-activedescendant=''])) .list {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 2px;
				}
				:host([orientation='horizontal']) {
					align-items: center;
					flex-direction: row;
					justify-content: space-between;
				}
				:host([orientation='horizontal']) .list {
					flex-direction: row;
				}
				.list {
					display: flex;
					flex-direction: column;
					gap: 1px;
				}
			</style>
			<slot></slot>
			<div class='list'>
				<slot name='options'></slot>
			</div>
		`;
		this._initialized = false;
		this._options = [];
		this._multiple = false;
		this._selected = -1;
		this._selectedArr = [];

		const observer = new MutationObserver(this.updateChildren);
		observer.observe(this, { childList: true });
	}

	get #initialized() { return this._initialized; }
	set #initialized(newVal) { this._initialized = newVal; }

	get options() { return this._options; }
	set #options(arr) { this._options = arr; }

	get #multiple() { return this._multiple; }
	set #multiple(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._multiple = bool;
		this.setAttribute('aria-multiselectable', bool);
	}

	get selected() {
		if (this.#multiple) {
			return this._selectedArr;
		}
		return this._selected;
	}
	set selected(newVal) {
		if (typeof(newVal) === 'object') {
			this._selectedArr = newVal;
		} else {
			this._selected = parseInt(newVal);
		}

		if (this.#multiple) {
			this.options.forEach((a, i) => {
				if (this._selectedArr.includes(i)) {
					a.setAttribute('aria-selected', true);
				} else {
					a.setAttribute('aria-selected', false);
				}
			});
		} else {
			this.options.forEach((a, i) => {
				if (i === parseInt(newVal)) {
					a.setAttribute('aria-selected', true);
				} else if (a.getAttribute('aria-selected') === 'true' || a.getAttribute('aria-selected')) {
					a.setAttribute('aria-selected', false);
				}
			});
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'multiple') {
			const bool = newVal === 'true' || newVal === true;
			this.#multiple = bool;
		} else if (attr === 'selected') {
			this.selected = newVal;
		}
	}

	connectedCallback() {
		const multiple = this.getAttribute('multiple');
		if (multiple != null && multiple) {
			this.#multiple = multiple;
			this.selected = [];
		} else {
			this.#multiple = false;
		}
		this.setAttribute('role', 'listbox');
		this.updateChildren(null, null, true);
	}

	handleChange = (e) => {
		e.stopPropagation();
		const target = e.target;
		const cur = target.getAttribute('aria-selected') === 'true';
		const i = this.options.findIndex((a) => a === target);
		if (!this.#multiple) {
			this.selected = i
		} else {
			const newSelected = this.selected.slice();
			target.setAttribute('aria-selected', !cur);
			if (cur) {
				newSelected.splice(this.selected.indexOf(i), 1);
				this.selected = newSelected;
			} else {
				newSelected.push(i);
				this.selected = newSelected;
			}
		}
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	handleChildBlur = (e) => {
		if (this.contains(e.target) && !this.contains(e.relatedTarget) && this.getAttribute('aria-activedescendant')) {
			this.removeAttribute('aria-activedescendant');
		}
	}

	handleChildFocus = (e) => {
		if (this.contains(e.target) && this.getAttribute('aria-activedescendant') !== 'true') {
			this.setAttribute('aria-activedescendant', e.target.id);
		}
	}

	handleChildKeydown = (e) => {
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				if (e.target?.nextElementSibling?.nodeName.toLowerCase() === 'ac-option') {
					e.target.nextElementSibling.focus();
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				if (e.target?.previousElementSibling?.nodeName.toLowerCase() === 'ac-option') {
					e.target.previousElementSibling.focus();
				}
				break;
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				this.handleChange(e);
				break;
		}
	}

	updateChildren = (mutationList, observer, initial) => {
		const initialSelected = this.getAttribute('selected');
		const multiple = this.getAttribute('multiple');
		const options = [...document.querySelectorAll('ac-listbox')];
		const optionCounts = options.map((a) => { return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length; });
		const currentTabsIndex = options.findIndex((a) => a === this);
		const offset = optionCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let optionIndex = 0;
		let optionId = optionIndex + offset;
		this.#options = [];

		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-option') {
					const optionSelected = a.getAttribute('selected') || false;
					this.options.push(a);
					a.addEventListener('blur', this.handleChildBlur);
					a.addEventListener('click', this.handleChange);
					a.addEventListener('focus', this.handleChildFocus);
					a.addEventListener('keydown', this.handleChildKeydown);
					if (initial) {
						a.setAttribute('aria-selected', false);
					}
					a.setAttribute('slot', 'options');
					if (!a.id) {
						a.id = `option-${optionId + 1}`;
					}
					if ((initialSelected === a.id || optionSelected) && initial) {
						if (multiple) {
							this.selected = this.selected.push(optionIndex);
						} else {
							this.selected = optionIndex;
						}
						a.setAttribute('aria-selected', true);
					}
					optionIndex = optionIndex + 1;
					optionId = optionId + 1;
				}
			});
		}
	}
}

customElements.define('ac-listbox', Listbox);
