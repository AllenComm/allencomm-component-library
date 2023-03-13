export default class Tabs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: flex;
					flex-direction: column;
					gap: 10px;
					width: 100%;
				}
				.list {
					display: grid;
					grid-auto-flow: row;
					grid-template-rows: auto 5px;
					justify-items: center;
				}
				.indicator {
					background-color: #0075ff;
					border-radius: 5px 5px 0 0;
					transform: translateX(0);
					width: 80%;
				}
			</style>
			<div class='list'>
				<slot name='tabs'></slot>
				<div class='indicator'></div>
			</div>
			<slot name='panels'></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
		this.addEventListener('change', this.handleChange);
		const selected = this.getAttribute('selected') || null;
		const tabs = [];
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					tabs.push(a);
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					a.setAttribute('slot', 'panels');
				}
			});
		}
		tabs.map((a, i) => {
			a.setAttribute('slot', 'tabs');
			a.setAttribute('style', `grid-column: ${i + 1} / auto;`);
			if (selected === a.id || (!selected && i === 0)) {
				a.setAttribute('aria-selected', true);
			} else {
				a.setAttribute('aria-selected', false);
			}
		});
	}

	handleChange = (e) => {
		console.log('e', e);
	}
}

customElements.define('ac-tabs', Tabs);
