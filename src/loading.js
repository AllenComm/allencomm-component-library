export default class Loading extends HTMLElement {
	//static observedAttributes = ['disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: block;
					outline: none;
					width: 100%;
				}
				.icon, slot[name='icon'] {
					display: flex;
					height: 30px;
					position: absolute;
					place-content: center;
					place-items: center;
					right: 2px;
					top: 0;
					user-select: none;
					width: 30px;
					z-index: 2;
				}
				.icon div, ::slotted(*[slot='icon']) {
					display: flex !important;
					height: 100%;
					max-height: 22px !important;
					max-width: 22px !important;
					place-content: center;
					place-items: center;
					width: 100%;
				}
				slot[name='icon'] {
					pointer-events: none;
				}
				.wrapper {
					align-items: flex-start;
					cursor: pointer;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					gap: 0 10px;
					place-items: center;
					position: relative;
					width: 100%;
				}
			</style>
			<div class='wrapper' tabindex='-1'>
				<div class='icon'>
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="#000000">
							<path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
						</svg>
					</div>
				</div>
				<slot name='icon'></slot>
			</div>
		`;
		this.shadowRoot.addEventListener('mousedown', (e) => e.stopPropagation());
	}

	connectedCallback() {
	}
}

customElements.define('ac-loading', Loading);
