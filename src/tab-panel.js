export default class TabPanel extends HTMLElement {
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
				:host([hidden="false"]) {
					opacity: 1;
				}
				:host([hidden="true"]) {
					opacity: 0;
				}
				.panel {
					display: flex;
					flex-direction: column;
					width: 100%;
				}
			</style>
			<div class='panel'><slot></slot></div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('.panel'); }

	connectedCallback() {
	}
}

customElements.define('ac-tab-panel', TabPanel);
