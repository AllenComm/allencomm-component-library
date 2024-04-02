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
					width: 100%;
				}
				:host([variant='alternate']) .list {
					background-color: #d3d3d3;
					border-color: #d3d3d3;
					border-radius: 3px;
					border-style: solid;
					border-width: 1px;
					grid-gap: 2px;
					grid-template-rows: auto;
				}
				:host([variant='alternate']) .indicator {
					background-color: #fff;
					border-radius: 3px;
					grid-row: 1;
					height: calc(100% - 2px);
					margin: 1px;
					width: calc(100% - 2px);
				}
				.list {
					border-bottom-color: #666;
					border-bottom-width: 1px;
					border-bottom-style: solid;
					display: grid;
					grid-auto-flow: row;
					grid-template-rows: auto 4px;
					justify-items: center;
				}
				.indicator {
					background-color: #d46027;
					height: 4px;
					transform: translateX(0);
					width: 100%;
				}
				slot[name="panels"] {
					display: grid;
					grid-template-columns: 100%;
				}
			</style>
			<div class='list'>
				<slot name='tabs'></slot>
				<div class='indicator'></div>
			</div>
			<slot name='panels'></slot>
		`;
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

	init() {
		const initialSelected = this.getAttribute('selected');
		const isAlternate = this.getAttribute('variant') === 'alternate';
		const tabs = [...document.querySelectorAll('ac-tabs')];
		const tabCounts = tabs.map((a) => {
			return [...a.children].filter((b) => b.tagName.toLowerCase() === 'ac-tab').length;
		});
		const currentTabsIndex = tabs.findIndex((a) => a === this);
		const offset = tabCounts.map((a, i) => {
			if (i < currentTabsIndex) {
				return a;
			}
			return 0;
		}).reduce((a, b) => a + b, 0);
		let tabIndex = 0;
		let panelIndex = 0;
		let tabId = tabIndex + offset;
		let panelId = panelIndex + offset;

		if (this.childNodes.length > 0 && this.childNodes.length != this.#tabs.length) {
			this.childNodes.forEach((a, i) => {
				if (a.nodeName.toLowerCase() === 'ac-tab') {
					if (!a.id) a.id = `tab-${tabId + 1}`;
					if (this.#tabs.find((b) => b.id === a.id) == undefined) {
						const tabSelected = a.getAttribute('selected') || false;
						a.addEventListener('click', this.handleChange);
						a.setAttribute('slot', 'tabs');
						a.setAttribute('aria-selected', false);
						a.style.setProperty('grid-column', `${tabIndex + 1} / auto`);
						a.style.setProperty('grid-row', '1');
						if (isAlternate) {
							a.style.setProperty('z-index', '2');
							a.setAttribute('variant', 'alternate');
						}
						if (initialSelected === a.id || tabSelected || (!initialSelected && !tabSelected && tabIndex === 0)) {
							this.#selected = tabIndex;
							a.setAttribute('aria-selected', true);
							this.#indicator.setAttribute('style', `grid-column: ${this.selected + 1}`);
						}
						this.#tabs.push(a);
					}
					tabId = tabId + 1;
					tabIndex = tabIndex + 1;
				} else if (a.nodeName.toLowerCase() === 'ac-tab-panel') {
					this.#panels.push(a);
					a.setAttribute('slot', 'panels');
					a.setAttribute('hidden', true);
					if (!a.id) a.id = `panel-${panelId + 1}`;
					if (this.#tabs[panelIndex]) {
						this.#tabs[panelIndex].setAttribute('aria-controls', a.id);
						a.setAttribute('aria-labelledby', this.#tabs[panelIndex].id);
					}
					if (this.selected === panelIndex) {
						a.setAttribute('hidden', false);
					}
					panelIndex = panelIndex + 1;
					panelId = panelId + 1;
				}
			});
		}
		this.addEventListener('keydown', this.handleKeydown);
	}

	connectedCallback() {
		const observer = new MutationObserver(this.handleChildChange);
		const target = this.shadowRoot.host;
		observer.observe(target, { attributes: false, childList: true, subtree: false });
		this.init();
	}

	handleChange = (e) => {
		e.stopPropagation();
		const target = e.currentTarget;
		this.#tabs.forEach((a, i) => {
			if (a.id !== target.id && a.getAttribute('aria-selected')) {
				a.setAttribute('aria-selected', false);
				this.#panels[i]?.setAttribute('aria-selected', false);
				this.#panels[i]?.setAttribute('hidden', true);
			} else {
				target.setAttribute('aria-selected', true);
				this.#panels[i]?.setAttribute('hidden', false);
				this.#selected = i;
			}
		});
		this.#indicator.setAttribute('style', `grid-column: ${this.selected + 1}`);
		this.dispatchEvent(new Event('change', { 'bubbles': false, 'cancelable': true, 'composed': true }));
	}

	handleChildChange = (mutationList, observer) => {
		if (mutationList.some(a => a.type === 'childList')) {
			this.init();
		}
	}

	handleKeydown = (e) => {
		switch (e.code) {
			case 'NumpadEnter':
			case 'Enter':
			case 'Space':
				if (e.currentTarget.nodeName.toLowerCase() === 'ac-tab') {
					e.preventDefault();
					e.stopPropagation();
					this.handleChange(e);
				}
				break;
		}
	}
}

customElements.define('ac-tabs', Tabs);
