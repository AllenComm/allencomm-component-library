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
				button {
					align-items: flex-start;
					background-color: #D46027;
					border: none;
					border-radius: 5px;
					cursor: pointer;
					color: white;
					display: flex;
					padding: 10px 25px;
					text-transform: uppercase;
				}
				button:hover {
					background-color: #FC6E28;
				}
				button[disabled] {
					background-color: #EEEEEE;
					cursor: default;
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
	get #disabled() { return this._disabled; }

	set #disabled(newVal) {
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
			this.#disabled = bool;
		}
	}

	connectedCallback() {
		if (this.getAttribute('disabled') === 'true') {
			this.#disabled = true;
		} else {
			this.#disabled = false;
		}
	}
}

customElements.define('ac-button', Button);
