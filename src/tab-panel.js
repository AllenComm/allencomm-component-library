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
					grid-column: 1;
					grid-row: 1;
				}
				:host([hidden="false"]) {
					opacity: 1;
					z-index: 1;
				}
				:host([hidden="true"]) {
					opacity: 0;
					z-index: -1;
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
}

customElements.define('ac-tab-panel', TabPanel);
