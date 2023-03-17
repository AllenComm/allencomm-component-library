export default class TextArea extends HTMLElement {
	static observedAttributes = ['value'];

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
	}

	get value() { return this.#textarea.value; }

	get #textarea() { return this.shadowRoot.querySelector('textarea'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'value') {
			this.#textarea.value = newVal;
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const cols = this.getAttribute('cols');
		const maxlength = this.getAttribute('maxlength');
		const minlength = this.getAttribute('minlength');
		const placeholder = this.getAttribute('placeholder');
		const rows = this.getAttribute('rows');
		const resize = this.getAttribute('resize') || 'none';
		const value = this.getAttribute('value');
		if (cols) this.#textarea.setAttribute('cols', cols);
		if (maxlength) this.#textarea.setAttribute('maxlength', maxlength);
		if (minlength) this.#textarea.setAttribute('minlength', minlength);
		if (placeholder) this.#textarea.setAttribute('placeholder', placeholder);
		if (rows) this.#textarea.setAttribute('rows', rows);
		this.#textarea.style.setProperty('resize', resize);
		if (value != null) {
			this.#textarea.value = value;
			this.setAttribute('aria-valueNow', value);
		}
		this.#textarea.addEventListener('input', this.handleChange);
	}

	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-text-area', TextArea);
