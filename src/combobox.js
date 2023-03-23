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
				.list {
					background: #fff;
					border: 1px ridge #767676;
					border-radius: 0 0 3px 3px;
					display: none;
					flex-direction: column;
					gap: 1px;
					position: absolute;
					width: 100%;
					z-index: 2;
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
		let isHidden = false;
		let i = 0;
		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation();
				const nextSibling = e.target?.nextElementSibling;
				isHidden = nextSibling?.getAttribute('hidden') === 'true';
				if (nextSibling?.nodeName.toLowerCase() === 'ac-option' && !isHidden) {
					e.target.nextElementSibling.focus();
				} else if (this.selected <= -1) {
					i = this.#options.findIndex((a) => a === e.target);
					const arr = this.#options.filter((a) => a.getAttribute('hidden') !== true && a.getAttribute('hidden') !== 'true');
					arr?.[i + 1].focus();
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
				} else if (prevSibling === null || isHidden) {
					this.#input.focus();
				}
				break;
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				this.handleSearch(e);
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
					} else if (this.#options[0].getAttribute('hidden') === 'true') {
						this.#options.find((a) => a.getAttribute('hidden') !== 'true').focus();
					} else {
						this.#options[0].focus();
					}
				}
				if (!this.#expanded) {
					this.#expanded = true;
				}
				break;
			case 'Backspace':
				if (this.selected > -1) {
					this.#selected = -1;
				}
				this.#input.focus();
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
				this.handleSearch(e);
				this.#expanded = false;
			default:
				this.#input.focus();
				break;
		}
	}

	handleSearch = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const getFilteredIndexes = () => {
			return values.map((a, i) => {
				const val = a.split('');
				const cur = currentVal.split('');
				for (let i = 0; i < cur.length; i++) {
					if (val[i] !== cur[i]) {
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
			const cursorStart = this.#input.selectionStart;
			if (this.#options?.[filteredIndexes[0]]?.value) {
				this.#input.value = this.#options[filteredIndexes[0]].value;
				const cursorEnd = this.#input.selectionEnd;
				this.#input.setSelectionRange(cursorStart, cursorEnd);
			}
			}
		};

		const selectInput = () => {
			const result = values.findIndex((a) => a === currentVal);
			const target = e?.target;
			console.log(result, target);
			this.#options.forEach((a, i) => {
				if (i === result || a === target) {
					a.setAttribute('aria-selected', true);
					this.#selected = i;
					this.#input.value = this.#options[this.selected].value;
					this.#expanded = false;
					this.#input.focus();
					this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
				} else {
					a.setAttribute('aria-selected', false);
				}
			});
		};

		const currentVal = this.#input.value.toLowerCase();
		const values = this.#options.map((a) => a.innerText.toLowerCase());
		const autocomplete = this.getAttribute('autocomplete');
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

		if (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) {
			selectInput();
		}

		// Search term is not case sensitive, simple left to right character
		// checking against the options in the list.
		// If autocomplete is list: remove options from list as you filter/type
		// If inline: guess and fill input as user types
		// If both: combine both functionalities
		// If none: allow typed value to select option (same rules, non-case
		// sensitive, left to right checking
	}

	handleValueChange = () => {
		this.setAttribute('aria-valueNow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-combobox', Combobox);
