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

		this._selected = null;
		this._tabs = [];
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }
	get selected() { return this._selected; }
	get slot() { return this.shadowRoot.querySelector('slot'); }
	get tabs() { return this._tabs; }

	set selected(id) { this._selected = id; }
	set tabs(arr) { this._tabs = arr; }

	connectedCallback() {
		this.addEventListener('change', this.handleChange);
		const selected = this.getAttribute('selected') || null;
		let i = 0;
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					this.tabs.push(a);
					a.setAttribute('slot', 'tabs');
					a.setAttribute('style', `grid-column: ${i + 1} / auto;`);
					if (!a.id) {
						a.id = a.shadowRoot.querySelector('slot')?.assignedNodes()?.[0].nodeValue;
					}
					if (selected === a.id || (!selected && i === 0)) {
						this.selected = a.id;
						a.setAttribute('aria-selected', true);
					} else {
						a.setAttribute('aria-selected', false);
					}
					i = i + 1;
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					a.setAttribute('slot', 'panels');
				}
			});
		}
	}

	handleChange = (e) => {
		this.selected = e.target.id;
		e.target.setAttribute('aria-selected', true);
		this.tabs.map((a) => {
			if (a.id !== e.target.id && a.getAttribute('aria-selected')) {
				a.setAttribute('aria-selected', false);
			}
		});
	}
}

customElements.define('ac-tabs', Tabs);
