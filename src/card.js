export default class Card extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}
				div.ac-card {
					align-items: center;
					display: flex;
					flex-direction: column;
					gap: 10px;
					width: 100%;
				}
				input, label {
					cursor: pointer;
				}
			</style>
			<div class='ac-card'>
				<slot name='default'><p>Default text...</p></slot>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	get container() { return this.shadowRoot.querySelector('div.ac-card'); }

	connectedCallback() {
		const style = this.getAttribute('style') || null;
		if (style) {
			this.container.setAttribute('style', style);
		}
		this.childNodes.forEach((a) => a.setAttribute('slot', 'default'));
	}
}

customElements.define('ac-card', Card);
