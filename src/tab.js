export default class Tab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-block;
				}
				div.ac-tab {
					cursor: pointer;
					display: block;
					width: 100%;
				}
			</style>
			<div class='ac-tab'></div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-tab'); }

	connectedCallback() {
		this.container.addEventListener('click', this.handleClick);
		if (this.childNodes.length > 0) {
			Array.from(this.childNodes).map((a) => this.container.appendChild(a));
		}
	}

	handleClick() {
		this.dispatchEvent(new Event('change', { 'bubbles': true, 'composed': true }));
	}
}

customElements.define('ac-tab', Tab);
