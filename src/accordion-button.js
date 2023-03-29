export default class AccordionButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					border-top: 1px solid #000;
					display: block;
					width: 100%;
				}
				button {
					background: none;
					border: none;
					cursor: pointer;
					display: flex;
					padding: 10px;
					place-content: flex-start;
					text-align: center;
					width: 100%;
				}
			</style>
			<button role='heading' tabindex='0'><slot></slot></button>
		`;
	}
}

customElements.define('ac-accordion-button', AccordionButton);
