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
			this.#textarea.value = parseFloat(newVal);
			this.setAttribute('aria-valuenow', newVal);
		}
	}

	connectedCallback() {
		const cols = this.getAttribute('cols') || null;
		const maxlength = this.getAttribute('maxlength') || null;
		const minlength = this.getAttribute('minlength') || null;
		const placeholder = this.getAttribute('placeholder') || '';
		const rows = this.getAttribute('rows') || null;
		const resize = this.getAttribute('resize') || 'none';
		const value = this.getAttribute('value') || null;
		this.#textarea.setAttribute('cols', cols);
		this.#textarea.setAttribute('maxlength', maxlength);
		this.#textarea.setAttribute('minlength', minlength);
		this.#textarea.setAttribute('placeholder', placeholder);
		this.#textarea.setAttribute('rows', rows);
		this.#textarea.style.setProperty('resize', resize);
		this.#textarea.value = value;
		this.#textarea.addEventListener('input', this.handleChange);
		this.setAttribute('aria-valuenow', value);
	}

	handleChange = () => {
		this.setAttribute('aria-valuenow', this.value);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-text-area', TextArea);
