export default class Tabs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: column;
					gap: 10px;
					width: 100%;
				}
				div.ac-tab-list {
					display: grid;
					grid-auto-flow: row;
					grid-template-rows: auto 5px;
					justify-items: center;
				}
				div.ac-active-indicator {
					background-color: #0075ff;
					border-radius: 5px 5px 0 0;
					transform: translateX(0);
					width: 80%;
				}
			</style>
			<div class='ac-tab-list'>
				<slot name='tabs'></slot>
				<div class='ac-active-indicator'></div>
			</div>
			<slot name='panels'></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
		this.addEventListener('change', this.handleChange);
		const tabs = [];
		if (this.childNodes.length > 0) {
			//console.log(this.childNodes);
			this.childNodes.forEach((a, i) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					tabs.push(a);
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					a.setAttribute('slot', 'panels');
				}
			});
		}
		//console.log(tabs);
		tabs.map((a, i) => {
			a.setAttribute('slot', 'tabs');
			a.setAttribute('style', `grid-column: ${i + 1} / auto;`);
		});
		//this.shadowRoot.querySelector('div.ac-tab-list').setAttribute('style', `grid-template-columns: repeat(${tabs.length}, auto);`);
	}
}

customElements.define('ac-tabs', Tabs);
