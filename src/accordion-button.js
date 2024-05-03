export default class AccordionButton extends HTMLElement {
	static observedAttributes = ['aria-selected'];

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
					align-items: center;
					background: none;
					border: none;
					cursor: pointer;
					display: flex;
					font-size: 15px;
					font-weight: 600;
					gap: 10px;
					padding: 10px;
					place-content: flex-start;
					text-align: center;
					width: 100%;
				}
				button:focus-visible {
					border-radius: 5px;
					outline: 2px solid #000;
					z-index: 1;
				}
				button slot {
					align-content: center;
					display: inline-block;
				}
				button span {
					display: flex;
				}
				button span[hidden="true"] {
					display: none;
				button span svg {
					height: 100%;
				}
			</style>
			<button role='heading' tabindex='0'>
				<slot></slot>
				<span class='icon-expand'>
					<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/></svg>
				</span>
				<span class='icon-collapse'>
					<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z"/></svg>
				</span>
			</button>
		`;
	}

	get #iconCollapse() { return this.shadowRoot.querySelector('span.icon-collapse'); }

	get #iconExpand() { return this.shadowRoot.querySelector('span.icon-expand'); }

	attributeChangedCallback(attr, oldVal, newVal) {
		if (attr === 'aria-selected') {
			const bool = newVal === 'true';
			if (bool) {
				this.#iconExpand.setAttribute('hidden', 'true');
				this.#iconCollapse.removeAttribute('hidden');
			} else {
				this.#iconExpand.removeAttribute('hidden');
				this.#iconCollapse.setAttribute('hidden', 'true');
			}
		}
	}

	connectedCallback() {
		// this.setAttribute('tabindex', -1);
	}
}

customElements.define('ac-accordion-button', AccordionButton);
