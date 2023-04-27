export default class Combobox extends HTMLElement {
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
					border-radius: 3px;
					display: flex;
					gap: 10px;
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
				:host([disabled='true']) .arrow {
					cursor: default;
					fill: #b0b0b0;
				}
				input {
					display: block;
					outline: none;
					position: relative;
					width: 100%;
					z-index: 1;
				}
				.arrow, .clear, slot[name='clear-btn'], slot[name='expand-btn'] {
					cursor: pointer;
					display: block;
					height: 22px;
					position: absolute;
					top: 0;
					width: 22px;
					z-index: 2;
				}
				slot[name='clear-btn'], slot[name='expand-btn'] {
					display: flex !important;
					height: 100%;
					max-height: 24px !important;
					max-width: 24px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.arrow.hidden, .clear.hidden {
					display: none;
				}
				.arrow div, .clear div, ::slotted(*[slot='expand-btn']), ::slotted(*[slot='clear-btn']) {
					display: flex !important;
					height: 100%;
					max-height: 22px !important;
					max-width: 22px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.arrow, slot[name='expand-btn'] {
					right: 0;
				}
				.clear, slot[name='clear-btn'] {
					right: 24px;
				}
				.clear[hidden='true'], ::slotted(*[slot='clear-btn'][hidden='true']) {
					display: none !important;
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
				.outer {
					flex: 1;
					position: relative;
				}
			</style>
			<slot></slot>
			<div class='outer'>
				<input type='text'/>
				<slot name='expand-btn'></slot>
				<div class='arrow'>
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
							<path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z"/>
						</svg>
					</div>
				</div>
				<slot name='clear-btn'></slot>
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
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._expanded = false;
		this._focused = null;
		this._options = [];
		this._selected = -1;
		this._slotClear = null;
		this._slotExpand = null;
	}

	get selected() { return this._selected; }
	get value() { return this.#input.value; }

	get #btnArrow() {
		if (this.#slotExpand !== null) {
			return this.#slotExpand;
		}
		return this.shadowRoot.querySelector('.arrow');
	}
	get #btnClear() {
		if (this.#slotClear !== null) {
			return this.#slotClear;
		}
		return this.shadowRoot.querySelector('.clear');
	}
	get #disabled() { return this._disabled; }
	get #expanded() { return this._expanded; }
	get #focused() { return this._focused; }
	get #input() { return this.shadowRoot.querySelector('input'); }
	get #list() { return this.shadowRoot.querySelector('.list'); }
	get #options() { return this._options; }
	get #slotClear() { return this._slotClear; }
	get #slotExpand() { return this._slotExpand; }
	get #visibleOptions() { return this.#options.filter((a) => a.getAttribute('hidden') !== 'true'); }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#btnArrow.removeEventListener('click', this.handleExpandToggle);
			this.#btnClear.removeEventListener('click', this.handleBtnClearClick);
			this.#input.removeEventListener('click', this.handleExpandToggle);
			this.#input.removeEventListener('input', this.handleFilter);
			this.#input.setAttribute('disabled', bool);
			this.removeEventListener('blur', this.handleFocusOut);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.#options.forEach((a) => {
				a.removeEventListener('blur', this.handleChildBlur);
				a.removeEventListener('click', this.handleSubmit);
				a.removeEventListener('focus', this.handleChildFocus);
				a.removeEventListener('keydown', this.handleChildKeydown);
			});
		} else {
			this.#btnArrow.addEventListener('click', this.handleExpandToggle);
			this.#btnClear.addEventListener('click', this.handleBtnClearClick);
			this.#input.addEventListener('click', this.handleExpandToggle.bind(this, true));
			this.#input.addEventListener('input', this.handleFilter);
			this.#input.removeAttribute('disabled');
			this.addEventListener('blur', this.handleFocusOut);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.#options.forEach((a) => {
				a.addEventListener('blur', this.handleChildBlur);
				a.addEventListener('click', this.handleSubmit);
				a.addEventListener('focus', this.handleChildFocus);
				a.addEventListener('keydown', this.handleChildKeydown);
			});
		}
	}
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
			this.#btnClear.setAttribute('hidden', false);
		} else {
			this.#options.forEach((a) => a.setAttribute('hidden', false));
			this.#btnClear.setAttribute('hidden', true);
		}
		this.#options.map((a, i) => {
			if (newVal > -1 && i === newVal) {
				this.#input.value = a.innerHTML;
				this.#expanded = false;
				this.#input.focus();
				this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
				a.setAttribute('aria-selected', true);
			} else {
				a.setAttribute('aria-selected', false);
			}
		});
	}
	set #slotClear(newVal) { this._slotClear = newVal; }
	set #slotExpand(newVal) { this._slotExpand = newVal; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
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
					this.#options.push(a);
					a.setAttribute('aria-selected', false);
					a.setAttribute('slot', 'options');
					if (!a.id) {
						a.id = `option-${optionId + 1}`;
					}
					optionIndex = optionIndex + 1;
					optionId = optionId + 1;
					setTimeout(() => a.setAttribute('tabindex', -1));
				} else if (a.slot === 'expand-btn') {
					this.shadowRoot.querySelector('.arrow').classList.add('hidden');
					this.#slotExpand = a;
				} else if (a.slot === 'clear-btn') {
					this.shadowRoot.querySelector('.clear').classList.add('hidden');
					this.#slotClear = a;
					a.setAttribute('hidden', true);
				}
			});
		}
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
		this.#expanded = false;
		this.#input.setAttribute('role', 'combobox');
		this.#list.setAttribute('role', 'listbox');
		this.setAttribute('aria-haspopup', this.#list.id);
		this.#options.map((a, i) => {
			if (initialSelected === a.id || initialSelected === a.innerHTML || a.getAttribute('selected') === 'true') {
				this.#selected = i;
			}
		});
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

	handleExpandToggle = (override) => {
		this.#input.focus();
		if (override === true || override === false) {
			this.#expanded = override;
		} else {
			this.#expanded = !this.#expanded;
		}

		//const name = e.target.nodeName.toLowerCase();
		//const className = e.target.className;
		//if (name === this.#slotExpand?.nodeName.toLowerCase() || name === 'ac-select' || className === 'arrow') {
		//	e.preventDefault();
		//	e.stopPropagation();
		//	this.#expanded = !this.#expanded;
		//}
	}

	handleFocusOut = (e) => {
		if (!e.srcElement.contains(e.relatedTarget)) {
			this.#expanded = false;
			this.#options.forEach((a) => a.setAttribute('hidden', false));
			if (this.selected <= -1) {
				if (!this.#options.some((a) => a.innerText === this.#input.value)) {
					this.#input.value = '';
				} else {
					const index = this.#options.findIndex((a) => a.innerText === this.#input.value);
					if (this.#options[index].value.length > 0) {
						this.#selected = index;
					}
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

		const getFilteredIndexes = (strictOverride) => {
			return values.map((a, i) => {
				if (a.length <= 0 || a.length === null || a.length === undefined) {
					return undefined;
				}
				if (this.getAttribute('strict') === 'true' || strictOverride) {
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
				const filteredIndexes = getFilteredIndexes(true);
				const start = this.#input.selectionStart;
				const firstOption = this.#options?.[filteredIndexes[0]];
				if (firstOption?.value) {
					this.#input.value = this.#input.value + firstOption.value.split('').slice(start).join('');
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

		if (this.#input.value.length <= 0) {
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

	handleSubmit = (e) => {
		const target = e?.target;
		let int = -1;
		if (target?.value?.length > 0) {
			if (target.nodeName.toLowerCase() === 'ac-combobox') {
				int = this.#options.findIndex((a) => a.innerText.toLowerCase() === this.#input.value.toLowerCase());
			} else if (target.nodeName.toLowerCase() === 'ac-option') {
				int = this.#options.findIndex((a) => a === target);
			} else if (this.#visibleOptions?.[0]) {
				int = this.#options.findIndex((a) => a === this.#visibleOptions[0]);
			}
		}

		if (int > -1) {
			this.#selected = int;
			this.#input.value = this.#options[int].value;
		} else {
			this.#selected = -1;
		}

		if (this.#expanded) {
			this.#expanded = false;
		}

		this.#input.focus();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
