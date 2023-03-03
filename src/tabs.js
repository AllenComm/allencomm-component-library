export default class Tabs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					align-items: center;
					display: flex;
					gap: 10px;
					width: 100%;
				}
			</style>
			<slot name='tabs'></slot>
			<slot name='panels'></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
		this.addEventListener('change', this.handleChange);
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					a.setAttribute('slot', 'tabs');
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					a.setAttribute('slot', 'panels');
				}
			});
		}
	}
}

customElements.define('ac-tabs', Tabs);
