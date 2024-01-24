export default class Combobox extends HTMLElement {
	static observedAttributes = ['disabled', 'error'];

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
				#helper {
					color: rgb(240, 45, 50);
					flex: 100%;
					font-size: 90%;
					padding: 5px 5px 0px 5px;
				}
				#helper.hidden {
					display: none;
				}
				input {
					border-color: #d7d7d7;
					border-radius: 5px;
					border-style: solid;
					border-width: 1px;
					display: block;
					font-size: 14px;
					height: 36px;
					outline: none;
					position: relative;
					width: 100%;
					z-index: 1;
				}
				input.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
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
					max-height: 36px !important;
					max-width: 36px !important;
					place-content: center;
					place-items: center;
					pointer-events: none;
					width: 100%;
				}
				.arrow.disabled, .clear.disabled {
					display: none;
				}
				button.arrow, button.clear, ::slotted(*[slot='expand-btn']), ::slotted(*[slot='clear-btn']) {
					background: none;
					border: none;
					display: flex !important;
					height: 100%;
					margin: 0;
					max-height: 36px !important;
					max-width: 22px !important;
					padding: 0;
					place-content: center;
					place-items: center;
					pointer-events: all;
					width: 100%;
				}
				.arrow, slot[name='expand-btn'] {
					right: 0;
				}
				.clear, slot[name='clear-btn'] {
					right: 24px;
				}
				slot[name='clear-btn'] {
					pointer-events: none;
				}
				::slotted(*[slot='clear-btn']) {
					pointer-events: auto;
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
				<button class='arrow' tabIndex='-1'>
					<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
						<path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z"/>
					</svg>
				</button>
				<slot name='expand-btn'></slot>
				<button class='clear' hidden='true'>
					<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
						<path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/>
					</svg>
				</button>
				<slot name='clear-btn'></slot>
				<div class='list'>
					<slot name='options'></slot>
				</div>
				<div id='helper' class='hidden'></div>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._allowInput = false;
		this._disabled = false;
		this._expanded = false;
		this._error = false;
		this._focused = null;
		this._options = [];
		this._selected = -1;
		this._slotClear = null;
		this._slotExpand = null;
	}

	get allowInput() { return this._allowInput; }
	set allowInput(newVal) { this._allowInput = newVal; }

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

	get disabled() { return this._disabled; }
	set disabled(newVal) {
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

	get error() { return this._error; }
	set error(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._error = bool;
		if (bool) {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.removeAttribute('aria-hidden');
				this.#helperDiv.classList.remove('hidden');
			}
			this.#input.classList.add('error');
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
			this.#input.classList.remove('error');
		}
	}

	get #expanded() { return this._expanded; }
	set #expanded(newVal) {
		this._expanded = newVal;
		this.setAttribute('expanded', newVal);
		this.setAttribute('aria-expanded', newVal);
	}

	get #focused() { return this._focused; }
	set #focused(newVal) { this._focused = newVal; }

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #input() { return this.shadowRoot.querySelector('input'); }

	get #list() { return this.shadowRoot.querySelector('.list'); }

	get #options() { return this._options; }
	set #options(arr) { this._options = arr; }

	get selected() { return this._selected; }
	set selected(newVal) {
		if (typeof newVal != 'number') {
			return;
		}
		this._selected = newVal;
		if (newVal > -1) {
			this.#btnClear.setAttribute('hidden', false);
		} else {
			this.#input.value = '';
			this.#options.forEach((a) => a.setAttribute('hidden', false));
			this.#btnClear.setAttribute('hidden', true);
		}
		this.#options.forEach((a, i) => {
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

	get #slotClear() { return this._slotClear; }
	set #slotClear(newVal) { this._slotClear = newVal; }

	get #slotExpand() { return this._slotExpand; }
	set #slotExpand(newVal) { this._slotExpand = newVal; }

	get value() { return this.#input.value; }

	get #visibleOptions() { return this.#options.filter((a) => a.getAttribute('hidden') !== 'true'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	init = () => {
		this.#options = [];
		this.disabled = true;
		const combos = [...document.querySelectorAll('ac-combobox')];
		const comboCounts = combos.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length;
		});
		const currentTabsIndex = combos.findIndex((a) => a === this);
		const allowInput = this.getAttribute('allow-input');
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		const offset = comboCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let optionIndex = 0;
		let optionId = optionIndex + offset;

		if (allowInput) this.allowInput = allowInput;
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
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
					this.shadowRoot.querySelector('.arrow').classList.add('disabled');
					this.#slotExpand = a;
				} else if (a.slot === 'clear-btn') {
					this.shadowRoot.querySelector('.clear').classList.add('disabled');
					this.#slotClear = a;
					a.setAttribute('hidden', true);
				}
			});
		}

		this.selected = -1;
		const initialSelected = this.getAttribute('selected');
		this.#options.forEach((a, i) => {
			if (initialSelected === a.id || initialSelected === a.innerHTML || (a.getAttribute('selected') === 'true' || a.getAttribute('selected') === true)) {
				this.selected = i;
			}
		});

		this.disabled = this.getAttribute('disabled') === 'true';
		this.#expanded = false;
		this.#input.setAttribute('role', 'combobox');
		this.#list.setAttribute('role', 'listbox');
		this.setAttribute('aria-haspopup', this.#list.id);
	}

	connectedCallback() {
		const observer = new MutationObserver(this.handleChildChange);
		const target = this.shadowRoot.host;
		observer.observe(target, { attributes: true, childList: true, subtree: true });
		this.init();
	}

	handleBtnClearClick = () => {
		this.selected = -1;
	};

	handleChildBlur = (e) => {
		this.#focused = null;
		if (this.contains(e.target) && (!this.contains(e.relatedTarget) || e.relatedTarget === this) && this.getAttribute('aria-activedescendant')) {
			this.removeAttribute('aria-activedescendant');
			this.handleFocusOut(e);
		}
	}

	handleChildChange = (mutationList, observer) => {
		const shouldUpdate = mutationList.some(a => a.type === 'childList' || (a.type === 'attributes' && a.attributeName === 'selected'));
		if (shouldUpdate) {
			this.init();
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
		const nextSibling = e.target?.nextElementSibling;
		const prevSibling = e.target?.previousElementSibling;
		const curIndex = this.#visibleOptions.findIndex((a) => a === this.#focused);
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				isHidden = nextSibling?.getAttribute('hidden') === 'true';
				if (nextSibling?.nodeName.toLowerCase() === 'ac-option' && !isHidden) {
					nextSibling.focus();
				} else {
					this.#visibleOptions[curIndex + 1].focus();
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				isHidden = prevSibling?.getAttribute('hidden') === 'true';
				if (prevSibling?.nodeName.toLowerCase() === 'ac-option' && !isHidden) {
					prevSibling.focus();
				} else if (prevSibling === null) {
					this.#input.focus();
				} else {
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
		if (typeof override === 'boolean') {
			this.#expanded = override;
		} else {
			this.#expanded = !this.#expanded;
		}
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
						this.selected = index;
					}
				}
			} else if (this.#input.value !== this.#options[this.selected]?.innerText) {
				this.#input.value = this.#options[this.selected]?.innerText || '';
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
					const val = a;
					const cur = currentVal;
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
			this.selected = -1;
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
				break;
			case 'Tab':
				if (this.allowInput && this.#input.value.length > 0 && this.#options.findIndex((a) => a.value === this.#input.value) <= -1) {
					this.handleSubmit(e);
				}
				break;
			default:
				this.#expanded = false;
				break;
		}
	}

	handleSubmit = (e) => {
		const target = e?.target;
		let int = -1;
		if (target?.value?.length > 0) {
			if (target.nodeName.toLowerCase() === 'ac-combobox') {
				int = this.#options.findIndex((a) => a.innerText.toLowerCase() === this.#input.value.toLowerCase());
				if (int == -1 && this.allowInput) {
					this.#input.value = target.value;
					const config = {
						ariaHidden: false,
						ariaSelected: true,
						hidden: false,
						id: `option-${this.#options.length}`,
						slot: 'options',
						tabindex: -1
					};
					int = this.#options.length;
					const elem = document.createElement('ac-option', config);
					const text = document.createTextNode(target.value);
					elem.appendChild(text);
					elem.setAttribute('selected', true);
					this.appendChild(elem);
					this.#options.push(elem);
				}
			} else if (target.nodeName.toLowerCase() === 'ac-option') {
				int = this.#options.findIndex((a) => a === target);
			} else if (this.#visibleOptions?.[0]) {
				int = this.#options.findIndex((a) => a === this.#visibleOptions[0]);
			}
		}

		if (int > -1) {
			this.selected = int;
		} else {
			this.selected = -1;
		}

		if (this.#expanded) {
			this.#expanded = false;
		}

		this.#input.focus();
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
