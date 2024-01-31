export default class Checkbox extends HTMLElement {
	static observedAttributes = ['checked', 'error', 'disabled'];

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
					height: 22px;
					outline: 2px solid #000;
					outline-offset: 2px;
					width: 22px;
					z-index: 1;
				}
				:host([disabled='true']) input, :host([disabled='true']) label {
					cursor: default;
				}
				#helper {
					color: rgb(240, 45, 50);
					font-size: 90%;
					margin-right: 10px;
				}
				#helper.hidden {
					display: none;
				}
				.inner {
					display: flex;
					justify-content: center;
				}
				input {
					height: 0;
					margin: 0;
					width: 0;
				}
				input, label, span.icon {
					cursor: pointer;
				}
				input.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
				}
				label {
					align-items: center;
					display: flex;
					gap: 0 10px;
					width: 100%;
				}
				span.icon {
					background-color: #fff;
					border: 1px solid #d7d7d7;
					border-radius: 2px;
					height: 22px;
					width: 22px;
					transition: background-color .05s ease, border-color .05s ease;
				}
				span.icon svg {
					display: inline-block;
					opacity: 0;
					transition: opacity .1s ease;
				}
				span.icon[checked='true'] {
					background-color: #d46027;
					border-color: #d46027;
					transition: background-color .1s ease, border-color .25s ease;
				}
				span.icon[checked='true'] svg {
					opacity: 1;
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
				<div class='inner'>
					<div id='helper' class='hidden'></div>
					<input tabindex='-1' type='checkbox'></input>
					<span class='icon'>
						<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path fill="#fff" d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
					</span>
				</div>
				<slot name='on-label'></slot>
				<slot name='off-label'></slot>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
	}

	get checked() { return this.#input.checked; }

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#icon.removeEventListener('click', this.handleChange);
			this.#icon.setAttribute('disabled', bool);
			this.#input.setAttribute('disabled', bool);
			this.#input.removeEventListener('click', this.handleChange);
			this.#input.removeEventListener('change', this.handleChange);
			this.removeEventListener('keydown', this.handleKeydown);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#icon.addEventListener('click', this.handleChange);
			this.#icon.removeAttribute('disabled');
			this.#input.removeAttribute('disabled');
			this.#input.addEventListener('click', this.handleChange);
			this.#input.addEventListener('change', this.handleChange);
			this.addEventListener('keydown', this.handleKeydown);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
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
			this.dispatchEvent(new Event('error', { 'composed': true }));
		} else {
			if (this.#helperDiv.innerText.length > 0) {
				this.#helperDiv.setAttribute('aria-hidden', !bool);
				this.#helperDiv.classList.add('hidden');
			}
		}
	}

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #input() { return this.shadowRoot.querySelector('input'); }

	get #icon() { return this.shadowRoot.querySelector('span.icon'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#icon.checked = bool;
			this.#input.checked = bool;
			this.setAttribute('aria-checked', bool);
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		this.#icon.checked = checked;
		this.#input.checked = checked;
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
		this.setAttribute('aria-checked', checked);
	}

	handleChange = (e) => {
		this.#icon.setAttribute('checked', this.#input.checked);
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
