export default class Button extends HTMLElement {
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
					cursor: pointer;
					display: flex;
				}
			</style>
			<button tabindex='-1'>
				<slot></slot>
			</button>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get #button() { return this.shadowRoot.querySelector('button'); }

	connectedCallback() {
		this.#button.addEventListener('click', this.handleChange);
		this.tabIndex = 0;
	}

	handleChange = () => {
		this.dispatchEvent(new Event('click', { 'bubbles': true, 'cancelable': true, 'composed': true }));
	}
}

customElements.define('ac-button', Button);
