export default class TextArea extends HTMLElement {
	static observedAttributes = ['disabled', 'value'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					outline: none;
					width: 100%;
				}
				textarea {
					border-radius: 3px;
					border-width: 1px;
					padding: 5px;
					width: 100%;
				}
				textarea:focus-visible {
					border-color: #000;
					border-style: solid;
					outline: 1px solid #000;
					z-index: 1;
				}
				label {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					flex-wrap: wrap;
					width: 100%;
				}
			</style>
			<label tabindex='-1'>
				<slot></slot>
				<textarea></textarea>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get value() { return this.#textarea.value; }

	set value(newVal) { this.#textarea.value = newVal }

	get #disabled() { return this._disabled; }
	get #textarea() { return this.shadowRoot.querySelector('textarea'); }

	set #disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#textarea.removeEventListener('input', this.handleChange);
			this.#textarea.setAttribute('disabled', bool);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
		} else {
			this.#textarea.addEventListener('input', this.handleChange);
			this.#textarea.removeAttribute('disabled');
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#textarea.value = newVal;
			this.setAttribute('aria-valueNow', newVal);
		} else if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		const cols = this.getAttribute('cols');
		const lines = this.getAttribute('lines');
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const resize = this.getAttribute('resize') || 'none';
		const rows = this.getAttribute('rows');
		const value = this.getAttribute('value');
		if (cols) this.#textarea.setAttribute('cols', cols);
		if (maxlength) this.#textarea.setAttribute('maxlength', maxlength);
		if (minlength) this.#textarea.setAttribute('minlength', minlength);
		if (placeholder) this.#textarea.setAttribute('placeholder', placeholder);
		if (rows) {
			this.#textarea.setAttribute('rows', rows);
		} else if (lines) {
			this.#textarea.setAttribute('rows', lines);
		}
		this.#textarea.style.setProperty('resize', resize);
		if (value != null) {
			this.#textarea.value = value;
			this.setAttribute('aria-valueNow', value);
		}
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
	}

	handleChange = () => {
		this.setAttribute('aria-valueNow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-text-area', TextArea);
