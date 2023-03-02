export default class Tab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				div.ac-tab {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
				input, label {
					cursor: pointer;
				}
			</style>
			<div class='ac-tab'></div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.container.appendChild(a));
		}
	}
}

customElements.define('ac-tab', Tab);
