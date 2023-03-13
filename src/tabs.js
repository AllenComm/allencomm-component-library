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

		this._index = 0; // selectedIndex?
		this._panels = [];
		this._selected = null; // selectedNode?
		this._tabs = [];
	}

	get container() { return this.shadowRoot.querySelector('.list'); }
	get index() { return this._index; }
	get indicator() { return this.shadowRoot.querySelector('.indicator'); }
	get panels() { return this._panels; }
	get selected() { return this._selected; }
	get slot() { return this.shadowRoot.querySelector('slot'); }
	get tabs() { return this._tabs; }

	set index(i) { this._index = i; }
	set panels(arr) { this._panels = arr; }
	set selected(id) { this._selected = id; }
	set tabs(arr) { this._tabs = arr; }

	connectedCallback() {
		this.addEventListener('change', this.handleChange);
		const selected = this.getAttribute('selected') || null;
		let tabIndex = 0;
		let panelIndex = 0;
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					this.tabs.push(a);
					a.setAttribute('slot', 'tabs');
					a.setAttribute('style', `grid-column: ${tabIndex + 1} / auto;`);
					a.setAttribute('aria-selected', false);
					if (!a.id) {
						a.id = `tab-${tabIndex + 1}`;
					}
					if (selected === a.id || (!selected && tabIndex === 0)) {
						this.index = tabIndex;
						this.selected = a.id;
						a.setAttribute('aria-selected', true);
						this.indicator.setAttribute('style', `grid-column: ${this.index + 1}`);
					}
					tabIndex = tabIndex + 1;
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					this.panels.push(a);
					a.setAttribute('slot', 'panels');
					a.setAttribute('hidden', true);
					if (!a.id) {
						a.id = `panel-${panelIndex + 1}`;
					}
					if (this.tabs[panelIndex]) {
						this.tabs[panelIndex].setAttribute('aria-controls', a.id);
						a.setAttribute('aria-labelledby', this.tabs[panelIndex].id);
					}
					if (this.index === panelIndex) {
						a.setAttribute('hidden', false);
					}
					panelIndex = panelIndex + 1;
				}
			});
		}
	}

	handleChange = (e) => {
		this.selected = e.target.id;
		this.tabs.map((a, i) => {
			if (a.id !== e.target.id && a.getAttribute('aria-selected')) {
				a.setAttribute('aria-selected', false);
				this.panels[i]?.setAttribute('aria-selected', false);
				this.panels[i]?.setAttribute('hidden', true);
			} else {
				e.target.setAttribute('aria-selected', true);
				this.panels[i]?.setAttribute('hidden', false);
				this.index = i;
			}
		});
		this.indicator.setAttribute('style', `grid-column: ${this.index + 1}`);
	}
}

customElements.define('ac-tabs', Tabs);
