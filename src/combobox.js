export default class Combobox extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-radius: 3px;
					display: block;
					position: relative;
				}
				:host(:focus-within) {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 2px;
				}
				:host([expanded='true']) .list {
					display: flex;
				}
				input {
					display: block;
					outline: none;
					position: relative;
					width: 100%;
					z-index: 2;
				}
				.list {
					background: #fff;
					border: 1px ridge #767676;
					border-radius: 0 0 3px 3px;
					display: none;
					flex-direction: column;
					gap: 1px;
					position: absolute;
					width: 100%;
					top: 5px;
					z-index: 1;
				}
			</style>
			<input type='text'/>
			<div class='list'>
				<slot name='options'></slot>
			</div>
		`;

		this._expanded = false;
		this._options = [];
		this._selected = -1;
	}

	get selected() { return this._selected; }
	get value() { return this.#input.value; }

	get #expanded() { return this._expanded; }
	get #input() { return this.shadowRoot.querySelector('input'); }
	get #list() { return this.shadowRoot.querySelector('.list'); }
	get #options() { return this._options; }

	set #expanded(newVal) {
		this._expanded = newVal;
		this.setAttribute('expanded', newVal);
		this.setAttribute('aria-expanded', newVal);
	}
	set #options(arr) { this._options = arr; }
	set #selected(newVal) { this._selected = newVal; }

	connectedCallback() {
		const initialSelected = this.getAttribute('selected');
		const options = [...document.querySelectorAll('ac-combobox')];
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

		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-option') {
					const optionSelected = a.getAttribute('selected') || false;
					this.#options.push(a);
					a.addEventListener('blur', this.handleChildBlur);
					a.addEventListener('click', this.handleChildSelect);
					a.addEventListener('focus', this.handleChildFocus);
					a.addEventListener('keydown', this.handleChildKeydown);
					a.setAttribute('aria-selected', false);
					a.setAttribute('slot', 'options');
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
					setTimeout(() => a.setAttribute('tabindex', -1));
				}
			});
		}
		this.#expanded = false;
		this.#input.addEventListener('input', this.handleSearch);
		this.#input.setAttribute('role', 'combobox');
		this.#list.setAttribute('role', 'listbox');
		this.addEventListener('blur', this.handleFocusOut);
		this.addEventListener('keydown', this.handleKeydown);
		this.setAttribute('aria-haspopup', this.#list.id);
	}

	handleChildBlur = (e) => {
		if (this.contains(e.target) && (!this.contains(e.relatedTarget) || e.relatedTarget === this) && this.getAttribute('aria-activedescendant')) {
			this.removeAttribute('aria-activedescendant');
			this.handleFocusOut(e);
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
				this.handleChildSelect(e);
				break;
			case 'Escape':
				e.preventDefault();
				e.stopPropagation();
				this.#expanded = false;
				this.#input.focus();
				break;
		}
	}

	handleChildSelect = (e) => {
		e.stopPropagation();
		const target = e.target;
		const multiple = this.getAttribute('aria-multiselectable');
		const cur = target.getAttribute('aria-selected') === 'true';
		this.#expanded = false;
		this.#options.forEach((a, i) => {
			if (a.id !== target.id && a.getAttribute('aria-selected')) {
				a.setAttribute('aria-selected', false);
			} else {
				target.setAttribute('aria-selected', true);
				this.#selected = i;
			}
		});
		this.#input.value = this.#options[this.selected].value;
		this.#input.focus();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	handleFocusOut = (e) => {
		if (e.target.nodeName.toLowerCase() !== 'ac-combobox' || (e.relatedTarget === null || e.relatedTarget.nodeName.toLowerCase() !== 'ac-option')) {
			this.#expanded = false;
		}
	}

	handleKeydown = (e) => {
		if (e.code === 'Escape' && this.#expanded) {
			e.preventDefault();
			e.stopPropagation();
			this.#expanded = false;
			this.#input.focus();
		} else if (e.target.nodeName.toLowerCase() === 'ac-combobox') {
			if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
				e.preventDefault();
				e.stopPropagation();
				if (this.selected > -1) {
					this.#options[this.selected].focus();
				} else {
					this.#options[0].focus();
				}
			}

			if (!this.#expanded) {
				this.#expanded = true;
			}
		}
	}

	handleValueChange = () => {
		this.setAttribute('aria-valueNow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
