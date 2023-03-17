export default class Listbox extends HTMLElement {
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
					justify-items: center;
					padding: 1px;
				}
				:host([aria-activedescendant='true']) .list {
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
		this._options = [];
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

	get #options() { return this._options; }

	set #options(arr) { this._options = arr; }
	set #selected(newVal) {
		if (typeof(newVal) === 'array') {
			this._selectedArr = newVal;
		} else {
			this._selected = newVal;
		}
	}

	connectedCallback() {
		const initialSelected = this.getAttribute('selected');
		const multiple = this.getAttribute('multiple');
		const options = [...document.querySelectorAll('ac-listbox')];
		const optionCounts = options.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length;
		});
		const currentTabsIndex = options.findIndex((a) => a === this);
		const offset = optionCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let optionIndex = 0;
		let optionId = optionIndex + offset;

		if (multiple != null && multiple) {
			this.setAttribute('aria-multiselectable', true);
			this.#selected = [];
		}

		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-option') {
					const optionSelected = a.getAttribute('selected') || false;
					this.#options.push(a);
					a.addEventListener('blur', this.handleChildBlur);
					a.addEventListener('click', this.handleChange);
					a.addEventListener('focus', this.handleChildFocus);
					a.addEventListener('keydown', this.handleChildKeydown);
					a.setAttribute('slot', 'options');
					a.setAttribute('aria-selected', false);
					if (!a.id) {
						a.id = `option-${optionId + 1}`;
					}
					if (initialSelected === a.id || optionSelected) {
						if (multiple) {
							this.#selected = this.selected.push(optionIndex);
						} else {
							this.#selected = optionIndex;
						}
						a.setAttribute('aria-selected', true);
					}
					optionIndex = optionIndex + 1;
					optionId = optionId + 1;
				}
			});
		}
		this.setAttribute('role', 'listbox');
	}

	handleChange = (e) => {
		e.stopPropagation();
		const target = e.target;
		const multiple = this.getAttribute('aria-multiselectable');
		const cur = target.getAttribute('aria-selected') === 'true';
		if (!multiple) {
			this.#options.forEach((a, i) => {
				if (a.id !== target.id && a.getAttribute('aria-selected')) {
					if (!multiple) {
						a.setAttribute('aria-selected', false);
					}
				} else {
					target.setAttribute('aria-selected', !cur);
					this.#selected = cur ? -1 : i;
				}
			});
		} else {
			const i = this.#options.findIndex((a) => a === target);
			target.setAttribute('aria-selected', !cur);
			if (cur) {
				const temp = this.selected.slice();
				const index = temp.indexOf(i);
				const newArr = temp.splice(index, 1);
				this.#selected = newArr;
			} else {
				this.#selected = this.selected.push(i);
			}
		}
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	handleChildBlur = (e) => {
		if (this.contains(e.target) && !this.contains(e.relatedTarget) && this.getAttribute('aria-activedescendant')) {
			this.setAttribute('aria-activedescendant', false)
		}
	}

	handleChildFocus = (e) => {
		if (this.contains(e.target) && this.getAttribute('aria-activedescendant') !== 'true') {
			this.setAttribute('aria-activedescendant', true);
		}
	}

	handleChildKeydown = (e) => {
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nextElementSibling) {
					e.target.nextElementSibling.focus();
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.previousElementSibling) {
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
}

customElements.define('ac-listbox', Listbox);
