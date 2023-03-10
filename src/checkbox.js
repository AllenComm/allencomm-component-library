export default class Checkbox extends HTMLElement {
	static observedAttributes = ['checked'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					width: 100%;
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
					gap: 10px;
				}
			</style>
			<label>
				<input type='checkbox'></input>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.input.checked; }
	get input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.input.checked = bool;
			this.setAttribute('aria-checked', bool);
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		this.input.checked = checked;
		this.input.addEventListener('change', this.handleChange);
		this.setAttribute('aria-checked', checked);
	}
	
	handleChange = () => {
		this.setAttribute('aria-checked', this.checked);
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-checkbox', Checkbox);
