export default class Select extends HTMLElement {
	static observedAttributes = ['disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					background-color: #fff;
					border: 1px solid #767676;
					border-radius: 3px;
					cursor: pointer;
					display: block;
					height: 24px;
					outline: none;
					padding: 1px 2px;
					position: relative;
					width: 100%;
					z-index: 3;
				}
				:host(:focus-within) {
					border-radius: 3px;
					outline: 2px solid #000;
					outline-offset: 2px;
				}
				:host([expanded='true']) .list {
					visibility: visible;
				}
				:host([disabled='true']) {
					background-color: #eee;
					border-color: #b0b0b0;
					outline: none;
				}
				:host([disabled='true']), :host([disabled='true']) .arrow {
					cursor: default;
					fill: #b0b0b0;
				}
				.arrow {
					cursor: pointer;
					display: block;
					height: 24px;
					position: absolute;
					right: 0;
					top: 0;
					width: 24px;
					z-index: 2;
				}
				.arrow div {
					display: flex;
					height: 100%;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.inner {
					height: 100%;
				}
				.list {
					background-color: #fff;
					border: 1px ridge #767676;
					border-radius: 0 0 3px 3px;
					display: flex;
					flex-direction: column;
					gap: 1px;
					left: 0;
					max-height: 300px;
					overflow-y: auto;
					position: absolute;
					visibility: hidden;
					width: 100%;
					z-index: 3;
				}
				.list[above='true'] {
					top: 0;
					transform: translateY(-100%);
				}
			</style>
			<div class='inner'></div>
			<div class='list'>
				<slot name='options'></slot>
			</div>
			<div class='arrow'>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
						<path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z"/>
					</svg>
				</div>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._expanded = false;
		this._options = [];
		this._selected = -1;
	}

	get selected() { return this._selected; }
	get value() { return this.#inner.innerText; }

	get #btnArrow() { return this.shadowRoot.querySelector('.arrow'); }
	get #disabled() { return this._disabled; }
	get #expanded() { return this._expanded; }
	get #inner() { return this.shadowRoot.querySelector('.inner'); }
	get #list() { return this.shadowRoot.querySelector('.list'); }
	get #options() { return this._options; }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.removeEventListener('blur', this.handleFocusOut);
			this.removeEventListener('click', this.handleOpen);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
			this.#options.forEach((a) => {
				a.removeEventListener('click', this.handleSubmit);
			});
		} else {
			this.addEventListener('blur', this.handleFocusOut);
			this.addEventListener('click', this.handleOpen);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
			this.#options.forEach((a) => {
				a.addEventListener('click', this.handleSubmit);
			});
		}
	}
	set #expanded(newVal) {
		this._expanded = newVal;
		this.setAttribute('expanded', newVal);
		this.setAttribute('aria-expanded', newVal);
		if (newVal) {
			this.setAttribute('aria-controls', this.#list.id);
		} else {
			this.setAttribute('aria-controls', '');
		}
	}
	set #options(arr) { this._options = arr; }
	set #selected(newVal) {
		this._selected = newVal;
		if (newVal > -1) {
			this.#options[newVal].setAttribute('aria-selected', true);
		}
		this.#options.map((a, i) => {
			if (newVal > -1 && i === newVal) {
				this.#inner.innerText = this.#options[this.selected].value;
				this.#expanded = false;
				this.focus();
				this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
				a.setAttribute('aria-selected', true);
			} else {
				a.setAttribute('aria-selected', false);
			}
		});
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		const initialSelected = this.getAttribute('selected');
		const combos = [...document.querySelectorAll('ac-select')];
		const comboCounts = combos.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length;
		});
		const currentTabsIndex = combos.findIndex((a) => a === this);
		const offset = comboCounts.map((a, i) => {
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
					a.setAttribute('aria-selected', false);
					a.setAttribute('slot', 'options');
					if (!a.id) {
						a.id = `option-${optionId + 1}`;
					}
					if (initialSelected === a.id || optionSelected) {
						this.#selected = optionIndex;
					}
					optionIndex = optionIndex + 1;
					optionId = optionId + 1;
					setTimeout(() => a.setAttribute('tabindex', -1));
				}
			});
		}
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
		this.#expanded = false;
		this.#btnArrow.addEventListener('click', () => this.#expanded = !this.#expanded);
		this.#list.setAttribute('role', 'listbox');
		const rect = this.getBoundingClientRect();
		const listRect = this.#list.getBoundingClientRect();
		const parentRect = this.parentElement.getBoundingClientRect();
		if ((rect.height + rect.top + listRect.height) > (parentRect.height + parentRect.top)) {
			this.#list.setAttribute('above', 'true');
		}
		this.setAttribute('aria-haspopup', this.#list.id);
		this.setAttribute('role', 'select');
	}

	handleFocusOut = (e) => {
		if (e.target.nodeName.toLowerCase() !== 'ac-select' || (e.relatedTarget === null || e.relatedTarget.nodeName.toLowerCase() !== 'ac-option')) {
			this.#expanded = false;
		}
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nodeName.toLowerCase() === 'ac-select') {
					if (this.selected > -1 && this.selected < this.#options.length - 1) {
						this.#selected = this.selected + 1;
					} else if (this.selected > -1 && this.selected === this.#options.length - 1) {
						break;
					} else {
						this.#selected = 0;
					}
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nodeName.toLowerCase() === 'ac-select') {
					if (this.selected > 0) {
						this.#selected = this.selected - 1;
					} else {
						this.#selected = 0;
					}
				}
				break;
		}
	}

	handleOpen = (e) => {
		if (e?.target.nodeName.toLowerCase() === 'ac-select') {
			this.#expanded = !this.#expanded;
		}
	}

	handleSubmit = (e) => {
		if (e?.target.nodeName.toLowerCase() === 'ac-option') {
			this.#selected = this.#options.findIndex((a) => a === e.target);
		}
	}
}

customElements.define('ac-select', Select);