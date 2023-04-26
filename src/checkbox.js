export default class Checkbox extends HTMLElement {
	static observedAttributes = ['checked', 'disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: block;
					outline: none;
					width: 100%;
				}
				:host(:focus-visible) input:after {
					border-radius: 3px;
					content: '';
					display: block;
					height: 13px;
					outline: 2px solid #000;
					outline-offset: 2px;
					width: 13px;
					z-index: 1;
				}
				:host([disabled='true']) input, :host([disabled='true']) label {
					cursor: default;
				}
				.inner {
					display: flex;
					flex: 1;
					justify-content: flex-end;
				}
				input {
					margin: 0;
				}
				input, label {
					cursor: pointer;
				}
				label {
					align-items: center;
					display: flex;
					flex-wrap: wrap;
					gap: 0 10px;
					width: 100%;
				}
				::slotted(*[slot='off-label']:not(:empty)) {
					display: inline-block;
				}
				::slotted(*[slot='on-label']) {
					display: none;
				}
				label:has(input:checked) ::slotted(*[slot='off-label']) {
					display: none;
				}
				label:has(input:checked) ::slotted(*[slot='on-label']:not(:empty)) {
					display: inline-block;
				}
			</style>
			<label tabindex='-1'>
				<slot name='on-label'></slot>
				<slot name='off-label'></slot>
				<slot></slot>
				<div class='inner'>
					<input tabindex='-1' type='checkbox'></input>
				</div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get checked() { return this.#input.checked; }

	get #input() { return this.shadowRoot.querySelector('input'); }
	get #disabled() { return this._disabled; }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.setAttribute('disabled', bool);
			this.#input.removeEventListener('click', this.handleChange);
			this.#input.removeEventListener('change', this.handleChange);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#input.removeAttribute('disabled');
			this.#input.addEventListener('click', this.handleChange);
			this.#input.addEventListener('change', this.handleChange);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#input.checked = bool;
			this.setAttribute('aria-checked', bool);
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		this.#input.checked = checked;
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
		this.setAttribute('aria-checked', checked);
	}

	handleChange = () => {
		this.setAttribute('aria-checked', this.#input.checked);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'Enter':
			case 'Space':
				e.preventDefault();
				e.stopPropagation();
				this.#input.checked = !this.#input.checked;
				this.handleChange(e);
				break;
		}
	}
}

customElements.define('ac-checkbox', Checkbox);
