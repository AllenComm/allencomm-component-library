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
					width: 90%;
				}
				slot[name="panels"] {
					display: grid;
				}
			</style>
			<div class='list'>
				<slot name='tabs'></slot>
				<div class='indicator'></div>
			</div>
			<slot name='panels'></slot>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());

		this._panels = [];
		this._selected = 0;
		this._tabs = [];
	}

	get selected() { return this._selected; }

	get #indicator() { return this.shadowRoot.querySelector('.indicator'); }
	get #panels() { return this._panels; }
	get #tabs() { return this._tabs; }

	set #panels(arr) { this._panels = arr; }
	set #selected(i) { this._selected = i; }
	set #tabs(arr) { this._tabs = arr; }

	connectedCallback() {
		this.addEventListener('click', this.handleChange);
		const initialSelected = this.getAttribute('selected') || null;
		let tabIndex = 0;
		let panelIndex = 0;
		if (this.childNodes.length > 0) {
			this.childNodes.forEach((a) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					const tabSelected = a.getAttribute('selected') || false;
					this.#tabs.push(a);
					a.setAttribute('slot', 'tabs');
					a.setAttribute('style', `grid-column: ${tabIndex + 1} / auto;`);
					a.setAttribute('aria-selected', false);
					if (!a.id) {
						a.id = `tab-${tabIndex + 1}`;
					}
					if (initialSelected === a.id || tabSelected || (!initialSelected && !tabSelected && tabIndex === 0)) {
						this.#selected = tabIndex;
						a.setAttribute('aria-selected', true);
						this.#indicator.setAttribute('style', `grid-column: ${this.selected + 1}`);
					}
					tabIndex = tabIndex + 1;
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					this.#panels.push(a);
					a.setAttribute('slot', 'panels');
					a.setAttribute('hidden', true);
					if (!a.id) {
						a.id = `panel-${panelIndex + 1}`;
					}
					if (this.#tabs[panelIndex]) {
						this.#tabs[panelIndex].setAttribute('aria-controls', a.id);
						a.setAttribute('aria-labelledby', this.#tabs[panelIndex].id);
					}
					if (this.selected === panelIndex) {
						a.setAttribute('hidden', false);
					}
					panelIndex = panelIndex + 1;
				}
			});
		}
	}

	handleChange = (e) => {
		e.stopPropagation();
		this.#tabs.forEach((a, i) => {
			if (a.id !== e.target.id && a.getAttribute('aria-selected')) {
				a.setAttribute('aria-selected', false);
				this.#panels[i]?.setAttribute('aria-selected', false);
				this.#panels[i]?.setAttribute('hidden', true);
			} else {
				e.target.setAttribute('aria-selected', true);
				this.#panels[i]?.setAttribute('hidden', false);
				this.#selected = i;
			}
		});
		this.#indicator.setAttribute('style', `grid-column: ${this.selected + 1}`);
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'composed': true }));
	}
}

customElements.define('ac-tabs', Tabs);
