export default class Option extends HTMLElement {
	static observedAttributes = ['hidden'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-radius: 3px;
					cursor: pointer;
					display: flex;
					padding: 5px;
				}
				:host([aria-selected='true']) {
					background: #0075ff;
				}
				:host([hidden='true']) {
					display: none;
				}
			</style>
			<slot></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get value() { return this.innerText }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'hidden') {
			const bool = newVal === 'true';
			this.setAttribute('aria-hidden', bool);
		}
	}

	connectedCallback() {
		this.setAttribute('tabindex', 0);
	}
}

customElements.define('ac-option', Option);
