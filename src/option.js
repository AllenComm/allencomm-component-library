export default class Option extends HTMLElement {
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
			</style>
			<slot></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	connectedCallback() {
		this.setAttribute('tabindex', 0);
	}
}

customElements.define('ac-option', Option);
