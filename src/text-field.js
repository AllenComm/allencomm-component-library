export default class TextField extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				div {
					display: flex;
					flex-direction: column;
					gap: 10px;
					padding: 16px;
					width: 100%;
				}
			</style>
			<label>
				<input type='text'/>
				<slot></slot>
			</label>
		`;
	}
}

customElements.define('ac-text-field', TextField);
