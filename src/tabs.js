export default class Tabs extends HTMLElement {
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
			<div class='ac-tabs'>
				<slot name='tabs'></slot>
				<slot name='panels'></slot>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
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
