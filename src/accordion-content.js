export default class AccordionContent extends HTMLElement {
	static observedAttributes = ['hidden'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-block;
					grid-column: 1;
					grid-row: 1;
				}
				:host([hidden="false"]) {
					opacity: 1;
					z-index: 1;
				}
				:host([hidden="true"]) {
					display: none;
					opacity: 0;
					z-index: -1;
				}
				:host([density='cozy']) {
					padding: 24px;
				}
				:host([density='comfortable']) {
					padding: 12px;
				}
				:host([density='compact']) {
					padding: 6px;
				}
				.content {
					display: flex;
					flex-direction: column;
					width: 100%;
				}
			</style>
			<div class='content'><slot></slot></div>
		`;
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'hidden') {
			const bool = newVal === 'true';
			if (bool) {
				this.setAttribute('tabindex', -1);
			} else {
				this.removeAttribute('tabindex');
			}
		}
	}

	connectedCallback() {
		this.setAttribute('tabindex', -1);
	}
}

customElements.define('ac-accordion-content', AccordionContent);
