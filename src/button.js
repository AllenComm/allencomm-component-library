export default class Button extends HTMLElement {
	static observedAttributes = ['disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-block;
				}
				:host(:focus-visible) {
					border-radius: 3px;
					outline-offset: 2px;
					outline-width: 1px;
					outline-style: solid;
				}
				button {
					align-items: flex-start;
					background-color: #d46027;
					border-radius: 5px;
					border: none;
					color: #ffffff;
					cursor: pointer;
					display: flex;
					justify-content: center;
					min-width: 140px;
					padding: 10px;
					transition: background-color .2s ease;
				}
				button[disabled] {
					background-color: #eeeeee;
					color: #d7d7d7;
					cursor: default;
					pointer-events: none;
				}
				button:hover {
					background-color: #fc6e28;
				}
			</style>
			<button tabindex='-1'>
				<slot></slot>
			</button>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get #button() { return this.shadowRoot.querySelector('button'); }

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#button.setAttribute('disabled', bool);
			this.setAttribute('aria-disabled', bool);
			this.setAttribute('aria-hidden', bool);
			this.setAttribute('tabindex', -1);
		} else {
			this.#button.removeAttribute('disabled');
			this.removeAttribute('aria-disabled');
			this.removeAttribute('aria-hidden');
			this.setAttribute('tabindex', 0);
		}
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'disabled') {
			const bool = newVal === 'true' || newVal === true;
			this.disabled = bool;
		}
	}

	connectedCallback() {
		if (this.getAttribute('disabled') === 'true') {
			this.disabled = true;
		} else {
			this.disabled = false;
		}
		if (this.getAttribute('style') != null) {
			this.#button.setAttribute('style', this.getAttribute('style'));
		}
	}
}

customElements.define('ac-button', Button);
