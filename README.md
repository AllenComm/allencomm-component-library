# AllenComm Component Library

This is the repository for AllenComm's UI component library.

## Usage

### Import into a project

`<script type="module" src="https://allencomm.github.io/allencomm-component-library/index.js" defer></script>`

### Use in a project

Each web component can be used as a normal HTML component, such as:

```
<ac-tabs slot='front'>
	<ac-tab>Content</ac-tab>
	<ac-tab>Design</ac-tab>
	<ac-tab-panel>
		<ac-text-area onChange=${(e) => updateStem(e)} value=${stem}>Stem</ac-text-area>
		<p>Options</p>
		<ac-button onClick=${() => onAddNewOption()}>Add option</ac-button>
	</ac-tab-panel>
</ac-tabs>
```

### Slots available

Unnamed = Slots which allow any child to be placed inside

- Accordion
	- `content` - Auto assigned children based on `ac-accordion-button` and `ac-accordion-content`
	- Anything else is not slotted
- Button
	- unnamed
- Card
	- unnamed/`front` - (`front` is optional, but preferred if using `back`) Assigned to front of card content
	- `back` - (Optional, cards can just be front facing) Assigned to back of card content
	- `card-front-btn` - (Optional) Button on top of front face of card, switches face
	- `card-back-btn` - (Optional) Button on top of back face of card, switches face
- Checkbox
	- unnamed
	- `on-label` - (Optional) Only shown when checkbox is on
	- `off-label` - (Optional) Only shown when checkbox is off
- Combobox
	- unnamed
	- `expand-btn` - (Optional, should be `<img>`) Used to replace the expand-btn icon
	- `clear-btn` - (Optional, should be `<img>`) Used to replace the clear-btn icon
	- `options` - Auto assigned children based on `ac-option`
- Listbox
	- unnamed
	- `options` - Auto assigned children based on `ac-option`
- Number
	- unnamed
- Option
	- unnamed
- Radio
	- unnamed
	- `on-label` - (Optional) Only shown when radio is on
	- `off-label` - (Optional) Only shown when radio is off
- Select
	- unnamed
	- `expand-btn` - (Optional, should be `<img>`) Used to replace the expand-btn icon
	- `options` - Auto assigned children based on `ac-option`
- Slider
	- unnamed
- Switch
	- unnamed
	- `on-label` - (Optional) Only shown when switch is on
	- `off-label` - (Optional) Only shown when switch is off
- Tabs
	- `tabs` - Auto assigned children based on `ac-tab`
	- `panels` - Auto assigned children based on `ac-tab-panel`
	- Anything else is not slotted
- Text-Area
	- unnamed
- Text-Field
	- unnamed
	- `icon` - (Optional, should be `<img>`) Used to replace the search icon

## Development

Clone the repository and use a local server to serve the `index.html`. Each component is a named `.js` file and placed in the `src` directory.

To create a new component...

- Create the `.js` file in the `src` directory following convention [[example]]
- Export the component [[example]]
- Import the component in the `src/index.js` file [[example]]
