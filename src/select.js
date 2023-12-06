export default class Select extends HTMLElement {
	static observedAttributes = ['disabled', 'error', 'selected'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					cursor: pointer;
					display: block;
					outline: none;
					width: 100%;
				}
				:host(:focus-visible) {
					outline: none;
				}
				:host(:focus-within) .inner {
					border-radius: 3px;
					outline: 1px solid #000;
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
				.arrow, slot[name='expand-btn'] {
					cursor: pointer;
					display: block;
					height: 24px;
					position: absolute;
					right: 0;
					top: 0;
					width: 24px;
					z-index: 2;
				}
				.arrow.hidden {
					display: none;
				}
				.arrow div, ::slotted(*[slot='expand-btn']) {
					display: flex !important;
					height: 100%;
					max-height: 24px !important;
					max-width: 24px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				.component {
					display: flex;
					gap: 10px;
					width: 100%;
				}
				#helper {
					color: rgb(240, 45, 50);
					font-size: 90%;
					padding: 5px 5px 0;
				}
				#helper.hidden {
					display: none;
				}
				.inner {
					background-color: #fff;
					border: 1px solid #000;
					border-radius: 3px;
					cursor: pointer;
					min-height: 26px;
					outline: none;
					padding: 1px 2px;
				}
				.inner.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
				}
				.list {
					background-color: #fff;
					border: 1px ridge #767676;
					border-radius: 0 0 3px 3px;
					display: flex;
					flex-direction: column;
					gap: 1px;
					left: 0;
					margin: 0 1px;
					max-height: 300px;
					overflow-y: auto;
					position: absolute;
					visibility: hidden;
					width: calc(100% - 2px);
					z-index: 3;
				}
				.list[anchor='bottom'] {
					top: 0;
					transform: translateY(-100%);
				}
				.outer {
					display: block;
					flex: 1;
					position: relative;
					width: 100%;
				}
			</style>
			<div class='component'>
				<slot></slot>
				<div class='outer'>
					<div class='inner'></div>
					<div class='list'>
						<slot name='options'></slot>
					</div>
					<slot name='expand-btn'></slot>
					<div class='arrow'>
						<div>
							<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 96 960 960" width="18">
								<path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z"/>
							</svg>
						</div>
					</div>
					<div id='helper' class='hidden'></div>
				</div>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._expanded = false;
		this._options = [];
		this._selected = -1;
		this._slotExpand = null;
	}

	get #btnArrow() {
		if (this.#slotExpand !== null) {
			return this.#slotExpand;
		}
		return this.shadowRoot.querySelector('.arrow');
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#btnArrow.removeEventListener('click', this.handleOpen);
			this.removeEventListener('blur', this.handleFocusOut);
			this.removeEventListener('click', this.handleOpen);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
			this.options.forEach((a) => {
				a.removeEventListener('click', this.handleSubmit);
			});
		} else {
			this.#btnArrow.addEventListener('click', this.handleOpen);
			this.addEventListener('blur', this.handleFocusOut);
			this.addEventListener('click', this.handleOpen);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
			this.options.forEach((a) => {
				a.addEventListener('click', this.handleSubmit);
			});
		}
	}

	get #expanded() { return this._expanded; }
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

	get error() { return this._error; }
	set error(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._error = bool;
		if (bool) {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.removeAttribute('aria-hidden');
				this.#helperDiv.classList.remove('hidden');
			}
			this.shadowRoot.querySelector('.inner').classList.add('error');
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
			this.shadowRoot.querySelector('.inner').classList.remove('error');
		}
	}

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #inner() { return this.shadowRoot.querySelector('.inner'); }

	get #list() { return this.shadowRoot.querySelector('.list'); }

	get options() { return this._options; }
	set options(arr) { this._options = arr; }

	get #slotExpand() { return this._slotExpand; }
	set #slotExpand(newVal) { this._slotExpand = newVal; }

	get selected() { return this._selected; }
	set selected(newVal) {
		this._selected = newVal;
		if (newVal == -1) {
			this.#inner.innerText = '';
		}
		this.options.map((a, i) => {
			if (newVal > -1 && i === newVal) {
				this.#inner.innerText = a.innerHTML;
				this.#expanded = false;
				this.focus();
				this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
				a.setAttribute('aria-selected', true);
			} else {
				a.setAttribute('aria-selected', false);
			}
		});
	}

	get textValue() { return this.#inner.innerText; }

	get value() { return this.options[this.selected].value; }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'selected') {
			const ids = this.options.map((a) => a.id);
			if (ids.indexOf(newVal) > -1) {
				this.selected = ids.indexOf(newVal);
			} else if (!isNaN(parseInt(newVal))) {
				this.selected = parseInt(newVal);
			}
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	init() {
		const combos = [...document.querySelectorAll('ac-select')];
		const comboCounts = combos.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-option').length;
		});
		const currentTabsIndex = combos.findIndex((a) => a === this);
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

		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-option') {
					this.options.push(a);
					a.setAttribute('aria-selected', false);
					a.setAttribute('slot', 'options');
					if (!a.id) {
						a.id = `option-${optionId + 1}`;
					}
					optionIndex = optionIndex + 1;
					optionId = optionId + 1;
					setTimeout(() => {
						a.setAttribute('tabindex', -1)
					});
				} else if (a.slot === 'expand-btn') {
					this.shadowRoot.querySelector('.arrow').classList.add('hidden');
					this.#slotExpand = a;
				}
			});
		}
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
		this.#expanded = false;
		this.#list.setAttribute('role', 'listbox');
		if (this.getAttribute('anchor') !== null) this.#list.setAttribute('anchor', this.getAttribute('anchor'));
		this.setAttribute('aria-haspopup', this.#list.id);
		this.setAttribute('role', 'select');

		const initialSelected = this.getAttribute('selected');
		this.options.map((a, i) => {
			if (initialSelected === a.id || initialSelected === a.innerHTML || a.getAttribute('selected') === 'true') {
				this.selected = i;
			}
		});
	}

	connectedCallback() {
		const observer = new MutationObserver(this.handleChildChange);
		const target = this.shadowRoot.host;
		observer.observe(target, { attributes: true, childList: true, subtree: true });
		this.init();
	}

	handleChildChange = (mutationList, observer) => {
		const shouldUpdate = mutationList.some(a => a.type === 'childList' || (a.type === 'attributes' && a.attributeName === 'selected'));
		if (shouldUpdate) {
			this.init();
		}
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
					if (this.selected > -1 && this.selected < this.options.length - 1) {
						this.selected = this.selected + 1;
					} else if (this.selected > -1 && this.selected === this.options.length - 1) {
						break;
					} else {
						this.selected = 0;
					}
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nodeName.toLowerCase() === 'ac-select') {
					if (this.selected > 0) {
						this.selected = this.selected - 1;
					} else {
						this.selected = 0;
					}
				}
				break;
		}
	}

	handleOpen = (e) => {
		const name = e.target.nodeName.toLowerCase();
		const className = e.target.className;
		if (name === this.#slotExpand?.nodeName.toLowerCase() || name === 'ac-select' || className === 'arrow') {
			e.preventDefault();
			e.stopPropagation();
			this.#expanded = !this.#expanded;
		}
	}

	handleSubmit = (e) => {
		if (e?.target.nodeName.toLowerCase() === 'ac-option') {
			this.selected = this.options.findIndex((a) => a === e.target);
		}
	}
}

customElements.define('ac-select', Select);
