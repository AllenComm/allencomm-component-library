export default class DatePicker extends HTMLElement {
	static observedAttributes = ['disabled', 'error', 'value'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-block;
					pointer-events: none;
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
				input[type="date"] {
					align-items: center;
					border-radius: 5px;
					border: 1px solid #d7d7d7;
					color: #000;
					cursor: pointer;
					display: flex;
					font-family: sans-serif;
					font-size: 16px;
					height: 36px;
					justify-content: center;
					padding: 6px 8px;
					pointer-events: auto;
					transition: border-color .2s ease;
				}
				input[disabled] {
					background-color: #eeeeee;
					color: #d7d7d7;
					cursor: default;
					pointer-events: none;
				}
				input:focus-visible {
					border-radius: 3px;
					outline-offset: 2px;
					outline-width: 2px;
					outline-style: solid;
				}
				input.error {
					border-color: rgb(240, 45, 50);
					border-style: solid;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<input type='date'></input>
				<div id='helper' class='hidden'></div>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
		this._error = false;
	}

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#input.setAttribute('disabled', bool);
			this.#input.setAttribute('tabindex', -1);
			this.setAttribute('aria-disabled', bool);
			if (this.getAttribute('disabled') === null) {
				this.setAttribute('disabled', bool);
			}
		} else {
			this.#input.removeAttribute('disabled');
			this.#input.setAttribute('tabindex', 0);
			this.removeAttribute('aria-disabled');
			this.removeAttribute('disabled');
		}
	}

	get error() { return this._error; }
	set error(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._error = bool;
		console.log('error changed to:', newVal, 'which is:', bool);
		if (bool) {
			console.log('showing helper', this.#helperDiv.innerText);
			console.dir(this.#helperDiv);
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

	get #helperDiv() { return this.shadowRoot.querySelector('#helper'); }

	get #input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.value = newVal;
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		} else if (attr === 'error') {
			const bool = newVal === 'true' || newVal === true;
			this.error = bool;
		}
	}

	connectedCallback() {
		const error = this.getAttribute('error');
		const helpertext = this.getAttribute('helpertext');
		const max = this.getAttribute('max');
		const min = this.getAttribute('min');
		const value = this.getAttribute('value');
		if (error) this.error = error;
		if (helpertext) this.#helperDiv.innerText = helpertext;
		if (max) this.#input.setAttribute('max', max);
		if (min) this.#input.setAttribute('min', min);
		if (value) this.#input.setAttribute('value', value);
		if (this.getAttribute('disabled') === 'true' || this.getAttribute('disabled') === true) {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
	}
}

customElements.define('ac-date-picker', DatePicker);
