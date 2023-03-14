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
			<button><slot></slot></button>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}
}

customElements.define('ac-tab', Tab);
