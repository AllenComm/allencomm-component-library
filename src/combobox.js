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
					z-index: 1;
				}
				.arrow, .clear {
					cursor: pointer;
					display: block;
					height: 24px;
					position: absolute;
					top: 0;
					width: 24px;
					z-index: 2;
				}
				.arrow div, .clear div {
					display: flex;
					height: 100%;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.arrow {
					right: 0;
				}
				.clear {
					right: 24px;
				}
				.clear[hidden='true'] {
					display: none;
				}
				.list {
					background: #fff;
					border: 1px ridge #767676;
					border-radius: 0 0 3px 3px;
					display: none;
					flex-direction: column;
					gap: 1px;
					max-height: 300px;
					overflow-y: auto;
					position: absolute;
					width: 100%;
					z-index: 3;
				}
			</style>
			<input type='text'/>
			<div class='arrow'>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
						<path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z"/>
					</svg>
				</div>
			</div>
			<div class='clear' hidden='true'>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
						<path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/>
					</svg>
				</div>
			</div>
			<div class='list'>
				<slot name='options'></slot>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._expanded = false;
		this._focused = null;
		this._options = [];
		this._selected = -1;
	}

	get selected() { return this._selected; }
	get value() { return this.#input.value; }

	get #btnArrow() { return this.shadowRoot.querySelector('.arrow'); }
	get #btnClear() { return this.shadowRoot.querySelector('.clear'); }
	get #expanded() { return this._expanded; }
	get #focused() { return this._focused; }
	get #input() { return this.shadowRoot.querySelector('input'); }
	get #list() { return this.shadowRoot.querySelector('.list'); }
	get #options() { return this._options; }
	get #visibleOptions() { return this.#options.filter((a) => a.getAttribute('hidden') !== 'true'); }

	set #expanded(newVal) {
		this._expanded = newVal;
		this.setAttribute('expanded', newVal);
		this.setAttribute('aria-expanded', newVal);
	}
	set #focused(newVal) { this._focused = newVal };
	set #options(arr) { this._options = arr; }
	set #selected(newVal) {
		this._selected = newVal;
		if (newVal > -1) {
			this.#options[newVal].setAttribute('aria-selected', true);
			this.#btnClear.setAttribute('hidden', false);
		} else {
			this.#btnClear.setAttribute('hidden', true);
		}
		this.#options.map((a, i) => {
			if (newVal > -1 && i === newVal) {
				this.#input.value = this.#options[this.selected].value;
				this.#expanded = false;
				this.#input.focus();
				this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
				a.setAttribute('aria-selected', true);
			} else {
				a.setAttribute('aria-selected', false);
			}
		});
	}

	connectedCallback() {
		const initialSelected = this.getAttribute('selected');
		const combos = [...document.querySelectorAll('ac-combobox')];
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
					a.addEventListener('blur', this.handleChildBlur);
					a.addEventListener('click', this.handleSubmit);
					a.addEventListener('focus', this.handleChildFocus);
					a.addEventListener('keydown', this.handleChildKeydown);
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
		this.#expanded = false;
		this.#btnArrow.addEventListener('click', () => this.#expanded = !this.#expanded);
		this.#btnClear.addEventListener('click', this.handleBtnClearClick);
		this.#input.addEventListener('click', () => this.#expanded = true);
		this.#input.addEventListener('input', this.handleFilter);
		this.#input.setAttribute('role', 'combobox');
		this.#list.setAttribute('role', 'listbox');
		this.addEventListener('blur', this.handleFocusOut);
		this.addEventListener('keydown', this.handleKeydown);
		this.setAttribute('aria-haspopup', this.#list.id);
	}

	handleBtnClearClick = () => {
		this.#input.value = '';
		this.#selected = -1;
	};

	handleChildBlur = (e) => {
		this.#focused = null;
		if (this.contains(e.target) && (!this.contains(e.relatedTarget) || e.relatedTarget === this) && this.getAttribute('aria-activedescendant')) {
			this.removeAttribute('aria-activedescendant');
			this.handleFocusOut(e);
		}
	}

	handleChildFocus = (e) => {
		this.#focused = e.target;
		if (this.contains(e.target) && this.getAttribute('aria-activedescendant') !== 'true') {
			this.setAttribute('aria-activedescendant', e.target.id);
		}
	}

	handleChildKeydown = (e) => {
		let isHidden = false;
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				const nextSibling = e.target?.nextElementSibling;
				isHidden = nextSibling?.getAttribute('hidden') === 'true';
				if (nextSibling?.nodeName.toLowerCase() === 'ac-option' && !isHidden) {
					nextSibling.focus();
				} else {
					const curIndex = this.#visibleOptions.findIndex((a) => a === this.#focused);
					this.#visibleOptions[curIndex + 1].focus();
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				const prevSibling = e.target?.previousElementSibling;
				isHidden = prevSibling?.getAttribute('hidden') === 'true';
				if (prevSibling?.nodeName.toLowerCase() === 'ac-option' && !isHidden) {
					prevSibling.focus();
				} else if (prevSibling === null) {
					this.#input.focus();
				} else {
					const curIndex = this.#visibleOptions.findIndex((a) => a === this.#focused);
					this.#visibleOptions[curIndex - 1].focus();
				}
				break;
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				this.handleSubmit(e);
				break;
			case 'Escape':
				e.preventDefault();
				e.stopPropagation();
				this.#expanded = false;
				this.#input.focus();
				break;
		}
	}

	handleFocusOut = (e) => {
		if (e.target.nodeName.toLowerCase() !== 'ac-combobox' || (e.relatedTarget === null || e.relatedTarget.nodeName.toLowerCase() !== 'ac-option')) {
			this.#expanded = false;
			if (this.selected <= -1) {
				if (!this.#options.some((a) => a.innerText === this.#input.value)) {
					this.#input.value = '';
				} else {
					this.#selected = this.#options.findIndex((a) => a.innerText === this.#input.value);
				}
			} else if (this.#input.value !== this.#options[this.selected].innerText) {
				this.#input.value = this.#options[this.selected].innerText;
			}
		}
	}

	handleFilter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const currentVal = this.#input.value;
		const values = this.#options.map((a) => a.innerText);
		const autocomplete = this.getAttribute('autocomplete');

		const getFilteredIndexes = () => {
			return values.map((a, i) => {
				if (this.getAttribute('strict') === 'true') {
					const val = a.split('');
					const cur = currentVal.split('');
					for (let j = 0; j < cur.length; j++) {
						if (this.getAttribute('casesensitive') === 'true') {
							if (val[j] !== cur[j]) {
								return undefined;
							}
						} else {
							if (val[j] === undefined || val[j].toLowerCase() !== cur[j].toLowerCase()) {
								return undefined;
							}
						}
					}
				} else {
					let val = a;
					let cur = currentVal;
					if (this.getAttribute('casesensitive') === 'true' && !val.includes(cur)) {
						return undefined;
					} else if (!val.toLowerCase().includes(cur.toLowerCase())) {
						return undefined;
					}
				}
				return i;
			}).filter((b) => b !== undefined);
		};

		const filterList = () => {
			if (!this.#expanded) {
				this.#expanded = true;
			}
			const filteredIndexes = getFilteredIndexes();
			this.#options.map((a, i) => {
				if (filteredIndexes.indexOf(i) == -1) {
					a.setAttribute('hidden', true);
				} else {
					a.setAttribute('hidden', false);
				}
			});
		};

		const guessInput = () => {
			if (e?.inputType !== 'deleteContentBackward') {
				const filteredIndexes = getFilteredIndexes();
				const start = this.#input.selectionStart;
				if (this.#options?.[filteredIndexes[0]]?.value) {
					this.handleSubmit(e, filteredIndexes[0]);
					const end = this.#input.selectionEnd;
					this.#input.setSelectionRange(start, end);
				}
			}
		};

		if (autocomplete != null) {
			const type = autocomplete;
			if (type === 'inline') {
				guessInput();
			} else if (type === 'list') {
				filterList();
			} else if (type === 'both') {
				guessInput();
				filterList();
			}
		}

		if (this.#input.value.length <=0) {
			this.#selected = -1;
		}
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nodeName.toLowerCase() === 'ac-combobox') {
					if (this.selected > -1 && this.#options[this.selected].getAttribute('hidden') !== 'true') {
						this.#options[this.selected].focus();
					} else if (this.#options[0].getAttribute('hidden') === 'true' && this.#visibleOptions?.[0]) {
						this.#visibleOptions[0].focus();
					} else {
						this.#options[0].focus();
					}
				}
				if (!this.#expanded) {
					this.#expanded = true;
				}
				break;
			case 'Escape':
				e.preventDefault();
				e.stopPropagation();
				this.#expanded = false;
				this.#input.focus();
				break;
			case 'Enter':
			case 'NumpadEnter':
				e.preventDefault();
				e.stopPropagation();
				if (!this.#expanded) {
					this.#expanded = false;
				}
				this.handleSubmit(e);
			default:
				this.#input.focus();
				break;
		}
	}

	handleSubmit = (e, overrideIndex) => {
		const target = e?.target;
		let int = -1;

		if (overrideIndex) {
			// input typed in and overrided
			int = overrideIndex;
		} else if (target.nodeName.toLowerCase() === 'ac-combobox') {
			// input change OR input submit
			int = this.#options.findIndex((a) => a.innerText.toLowerCase() === this.#input.value.toLowerCase());
		} else if (target.nodeName.toLowerCase() === 'ac-option') {
			// select from list
			int = this.#options.findIndex((a) => a === target);
		} else if (this.#visibleOptions?.[0]) {
			// default to first in list
			int = this.#options.findIndex((a) => a === this.#visibleOptions[0]);
		}

		if (int > -1) {
			this.#selected = int;
			this.#input.value = this.#options[int].value;
			if (this.#expanded) {
				this.#expanded = false;
			}
		}

		this.#input.focus();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
