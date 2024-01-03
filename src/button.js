export default class Button extends HTMLElement {
	static observedAttributes = ['disabled'];

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
					pointer-events: auto;
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
				button:focus-visible {
					border-radius: 3px;
					outline-offset: 2px;
					outline-width: 2px;
					outline-style: solid;
				}
			</style>
			<button tabindex=0>
				<slot></slot>
			</button>
		`;
		this.addEventListener('focus', (e) => this.preventHostInteraction(e));
		this.addEventListener('click', (e) => this.preventHostInteraction(e));
		this.addEventListener('mousedown', (e) => this.preventHostInteraction(e));
		this.#button.addEventListener('click', (e) => this.handleClick(e));
		this.#button.addEventListener('keydown', (e) => this.handleKeyDown(e));
		this.#button.addEventListener('mousedown', (e) => e.stopPropagation());
		this._disabled = false;
	}

	get #button() { return this.shadowRoot.querySelector('button'); }

	get disabled() { return this._disabled; }
	set disabled(newVal) {
		const bool = newVal === 'true' || newVal === true;
		this._disabled = bool;
		if (bool) {
			this.#button.setAttribute('disabled', bool);
			this.#button.setAttribute('tabindex', -1);
			this.setAttribute('aria-disabled', bool);
		} else {
			this.#button.removeAttribute('disabled');
			this.#button.setAttribute('tabindex', 0);
			this.removeAttribute('aria-disabled');
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

	handleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		if (this.disabled) return;
		const clickEvent = new Event('click', { 'bubbles': false, 'cancelable': true, 'composed': true });
		this.dispatchEvent(clickEvent);
	}

	handleKeyDown(e) {
		if (this.disabled) return;
		if (e.key === 'Enter' || e.key === 'Space') {
			this.handleClick();
		}
	}

	preventHostInteraction(e) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
}

customElements.define('ac-button', Button);
