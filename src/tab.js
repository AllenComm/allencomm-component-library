export default class Tab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: block;
					width: 100%;
				}
				button {
					background: none;
					border: none;
					cursor: pointer;
					display: flex;
					padding: 10px;
					place-content: center;
					text-align: center;
					width: 100%;
				}
			</style>
			<button tabindex='-1'><slot></slot></button>
		`;
	}

	connectedCallback() {
		this.setAttribute('tabindex', 0);
	}
}

customElements.define('ac-tab', Tab);
