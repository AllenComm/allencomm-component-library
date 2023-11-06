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
	    <p>First panel content would be here...</p>
	    <ac-switch><span slot='on-label'>On</span><span slot='off-label'>Off</span></ac-switch>
	</ac-tab-panel>
	<ac-tab-panel>
	    <p>Second panel content would be here...</p>
	</ac-tab-panel>
</ac-tabs>
```

### Slots available

Unnamed = Slots which allow any child to be placed inside

| Accordion | Slots                                                                            |
|-----------|----------------------------------------------------------------------------------|
| `content` | Auto assigned children based on `ac-accordion-button` and `ac-accordion-content` |
|           | Anything else is not slotted                                                     |

| Button  | Slots |
|---------|-------|
| Unnamed |       |

| Card             | Slots                                                                                  |
|------------------|----------------------------------------------------------------------------------------|
| Unnamed/`front`  | (`front` is optional, but preferred if using `back`) Assigned to front of card content |
| `back`           | (Optional, cards can just be front facing) Assigned to back of card content            |
| `card-front-btn` | **Optional** Button on top of front face of card, switches face                        |
| `card-back-btn`  | **Optional** Button on top of back face of card, switches face                         |

| Checkbox    | Slots                                      |
|-------------|--------------------------------------------|
| Unnamed     |                                            |
| `on-label`  | **Optional** Only shown when checkbox is on  |
| `off-label` | **Optional** Only shown when checkbox is off |

| Combobox     | Slots                                                             |
|--------------|-------------------------------------------------------------------|
| Unnamed      |                                                                   |
| `expand-btn` | (Optional, should be `<img>`) Used to replace the expand-btn icon |
| `clear-btn`  | (Optional, should be `<img>`) Used to replace the clear-btn icon  |
| `options`    | Auto assigned children based on `ac-option`                       |

| Draggable-List | Slots                                      |
|----------------|--------------------------------------------|
| Unnamed        | Auto assigned children base on `ac-option` |

| Divider | Slots |
|---------|-------|
| None    |       |

| Files | Slots |
|-------|-------|
| None  |       |

| Loading | Slots |
|---------|-------|
| None    |       |

| Listbox   | Slots                                       |
|-----------|---------------------------------------------|
| Unnamed   |                                             |
| `options` | Auto assigned children based on `ac-option` |

| Number  | Slots |
|---------|-------|
| Unnamed |       |

| Option  | Slots |
|---------|-------|
| Unnamed |       |

| Password | Slots |
|----------|-------|
| None     |       |

| Radio       | Slots                                   |
|-------------|-----------------------------------------|
| Unnamed     |                                         |
| `on-label`  | **Optional** Only shown when radio is on  |
| `off-label` | **Optional** Only shown when radio is off |

| Select       | Slots                                                             |
|--------------|-------------------------------------------------------------------|
| Unnamed      |                                                                   |
| `expand-btn` | (Optional, should be `<img>`) Used to replace the expand-btn icon |
| `options`    | Auto assigned children based on `ac-option`                       |

| Slider  | Slots |
|---------|-------|
| Unnamed |       |

| Snackbar | Slots |
|----------|-------|
| Unnamed  |       |

| Switch      | Slots                                    |
|-------------|------------------------------------------|
| Unnamed     |                                          |
| `on-label`  | **Optional** Only shown when switch is on  |
| `off-label` | **Optional** Only shown when switch is off |

| Table | Slots |
|-------|-------|
| None  |       |

| Tabs     | Slots                                          |
|----------|------------------------------------------------|
| `tabs`   | Auto assigned children based on `ac-tab`       |
| `panels` | Auto assigned children based on `ac-tab-panel` |
|          | Anything else is not slotted                   |

| Text-Area | Slots |
|-----------|-------|
| Unnamed   |       |

| Text-Field | Slots                                                         |
|------------|---------------------------------------------------------------|
| Unnamed    |                                                               |
| `icon`     | (Optional, should be `<img>`) Used to replace the search icon |

### Attributes available

| Accordion  | Attributes  |
|------------|-------------|
| `selected` | **Boolean** |

| Button     | Attributes  |
|------------|-------------|
| `disabled` | **Boolean** |

| Card | Attributes |
|------|------------|
| None |            |

| Checkbox     | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `disabled`   | **Boolean**                                                     |
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |

| Combobox     | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `disabled`   | **Boolean**                                                     |
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |

| Draggable-List | Attributes |
|----------------|------------|
| None           |            |

| Divider | Attributes |
|---------|------------|
| None    |            |

| Files        | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `accept`     |                                                                 |
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |
| `multiple`   | **Boolean**                                                     |

| Loading | Attributes |
|---------|------------|
| None    |            |

| Listbox    | Attributes  |
|------------|-------------|
| `multiple` | **Boolean** |

| Number        | Attributes                                                      |
|---------------|-----------------------------------------------------------------|
| `error`       | **Boolean**                                                     |
| `helpertext`  | **String**; *Optional*; Text, shown when `error` is set to true |
| `max`         |                                                                 |
| `maxlength`   |                                                                 |
| `min`         |                                                                 |
| `minlength`   |                                                                 |
| `placeholder` |                                                                 |
| `size`        |                                                                 |
| `step`        |                                                                 |
| `value`       |                                                                 |

| Option      | Attributes  |
|-------------|-------------|
| `draggable` | **Boolean** |

| Password      | Attributes                                                      |
|---------------|-----------------------------------------------------------------|
| `error`       | **Boolean**                                                     |
| `helpertext`  | **String**; *Optional*; Text, shown when `error` is set to true |
| `maxlength`   |                                                                 |
| `minlength`   |                                                                 |
| `placeholder` |                                                                 |
| `size`        |                                                                 |
| `value`       |                                                                 |

| Radio        | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `checked`    | **Boolean**                                                     |
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |
| `name`       |                                                                 |
| `value`      |                                                                 |

| Select       | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |

| Slider       | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |
| `max`        |                                                                 |
| `min`        |                                                                 |
| `step`       |                                                                 |
| `value`      |                                                                 |

| Snackbar    | Attributes                                                                                           |
|-------------|------------------------------------------------------------------------------------------------------|
| `anchor`    | **String** `<vertical> <horizontal>` Valid options: `left`, `right`, `center`, `top`, `bottom`       |
| `animation` | **String** Valid options: `slide`, `grow`, `fade`                                                    |
| `autohide`  | **Number** Hides the component in *N* milliseconds                                                   |
| `direction` | **String** Slide direction, coming from *N* direction - Valid options: `left`, `right`, `up`, `down` |
| `onclose`   | **Function**                                                                                         |
| `open`      | **Boolean**                                                                                          |

| Switch       | Attributes                                                      |
|--------------|-----------------------------------------------------------------|
| `checked`    | **Boolean**                                                     |
| `error`      | **Boolean**                                                     |
| `helpertext` | **String**; *Optional*; Text, shown when `error` is set to true |

| Table             | Attributes  |
|-------------------|-------------|
| `allow-selection` | **Boolean** |
| `columns`         |             |
| `filters`         |             |
| `page`            | **Number**  |
| `page-size`       | **Number**  |

| Tabs       | Attributes                                |
|------------|-------------------------------------------|
| `selected` | **Boolean**                                 |
| `variant`  | **String**; *Optional*; Empty or `alternate` |

| Text-Area     | Attributes                                                                                |
|---------------|-------------------------------------------------------------------------------------------|
| `auto-height` | Toggles auto expansion by component when text is higher than the default. *Default: true* |

| Text-Area     | Attributes                                                                                             |
|---------------|--------------------------------------------------------------------------------------------------------|
| `auto-height` | **Boolean**; Toggles auto expansion by component when text is higher than the default; *Default: true* |
| `cols`        |                                                                                                        |
| `error`       | **Boolean**                                                                                            |
| `helpertext`  | **String**; *Optional*; Text, shown when `error` is set to true                                        |
| `lines`       |                                                                                                        |
| `maxlength`   |                                                                                                        |
| `minlength`   |                                                                                                        |
| `placeholder` |                                                                                                        |
| `resize`      |                                                                                                        |
| `rows`        |                                                                                                        |
| `values`      |                                                                                                        |

| Text-Field    | Attributes                                               |
|---------------|----------------------------------------------------------|
| `error`       | **Boolean**; *Optional*;                                 |
| `helpertext`  | **String**; *Optional*; Text, shown when `error` is true |
| `maxlength`   | **Number**                                               |
| `minlength`   | **Number**                                               |
| `placeholder` | **String**                                               |
| `search`      | **Boolean**                                              |
| `size`        | **Number**                                               |
| `value`       | **String**                                               |

## Development

Clone the repository and use a local server to serve the `index.html`. Each
component is a named `.js` file and placed in the `src` directory.

To create a new component...

- Create the `.js` file in the `src` directory following `kebab-case` convention
- Export the component
	`export default class ComponentName extends HTMLElement {...` and
	`customElements.define('ac-component-name', ComponentName);`
- Export the component in the `index.js` file with
	`import ComponentName from './src/component-name.js';` and adding it to the
	`export {...}` object
- Import the component in the `index/debug/example.html` file(s) with
	`<script src="./index.js" type="module" defer></script>`
