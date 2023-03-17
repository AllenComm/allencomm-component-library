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
			</style>
			<label tabindex='-1'>
				<input tabindex='-1' type='checkbox'></input>
				<slot></slot>
			</label>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get checked() { return this.#input.checked; }

	get #input() { return this.shadowRoot.querySelector('input'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'checked') {
			const bool = newVal === 'true';
			this.#input.checked = bool;
			this.ariaChecked = bool;
		}
	}

	connectedCallback() {
		const checked = this.getAttribute('checked') || false;
		this.#input.checked = checked;
		this.#input.addEventListener('change', this.handleChange);
		this.ariaChecked = checked;
		this.tabIndex = 0;
		this.addEventListener('keydown', this.handleKeydown);
	}
	
	handleChange = () => {
		this.ariaChecked = this.#input.checked;
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
