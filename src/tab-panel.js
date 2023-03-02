export default class TabPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-tab-panel {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input, label {
					cursor: pointer;
				}
			</style>
			<div class='ac-tab-panel'>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab-panel'); }

	connectedCallback() {
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.container.appendChild(a));
		}
	}
}

customElements.define('ac-tab-panel', TabPanel);
