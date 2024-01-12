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
| Unnamed | \*    |

| Card             | Slots                                                                                  |
|------------------|----------------------------------------------------------------------------------------|
| Unnamed/`front`  | (`front` is optional, but preferred if using `back`) Assigned to front of card content |
| `back`           | *Optional: cards can just be front facing*; Assigned to back of card content           |
| `card-front-btn` | *Optional*; Button on top of front face of card, switches face                         |
| `card-back-btn`  | *Optional*; Button on top of back face of card, switches face                          |

| Checkbox    | Slots                                       |
|-------------|---------------------------------------------|
| Unnamed     | \*                                          |
| `on-label`  | *Optional*; Only shown when checkbox is on  |
| `off-label` | *Optional*; Only shown when checkbox is off |

| Combobox     | Slots                                                              |
|--------------|--------------------------------------------------------------------|
| Unnamed      | \*                                                                 |
| `expand-btn` | *Optional: should be `<img>`*; Used to replace the expand-btn icon |
| `clear-btn`  | *Optional: should be `<img>`*; Used to replace the clear-btn icon  |
| `options`    | Auto assigned children based on `ac-option`                        |

| Draggable-List | Slots                                      |
|----------------|--------------------------------------------|
| Unnamed        | Auto assigned children base on `ac-option` |

| Divider | Slots |
|---------|-------|
| None    | N\A   |

| Files | Slots |
|-------|-------|
| None  | N\A   |

| Loading | Slots |
|---------|-------|
| None    | N\A   |

| Listbox   | Slots                                       |
|-----------|---------------------------------------------|
| Unnamed   | \*                                          |
| `options` | Auto assigned children based on `ac-option` |

| Number  | Slots |
|---------|-------|
| Unnamed | \*    |

| Option  | Slots |
|---------|-------|
| Unnamed | \*    |

| Password | Slots |
|----------|-------|
| None     | N\A   |

| Radio       | Slots                                    |
|-------------|------------------------------------------|
| Unnamed     | \*                                       |
| `on-label`  | *Optional*; Only shown when radio is on  |
| `off-label` | *Optional*; Only shown when radio is off |

| Select       | Slots                                                              |
|--------------|--------------------------------------------------------------------|
| Unnamed      | \*                                                                 |
| `expand-btn` | *Optional: should be `<img>`*; Used to replace the expand-btn icon |
| `options`    | Auto assigned children based on `ac-option`                        |

| Slider  | Slots |
|---------|-------|
| Unnamed | \*    |

| Snackbar | Slots |
|----------|-------|
| Unnamed  | \*    |

| Switch      | Slots                                     |
|-------------|-------------------------------------------|
| Unnamed     | \*                                        |
| `on-label`  | *Optional*; Only shown when switch is on  |
| `off-label` | *Optional*; Only shown when switch is off |

| Table | Slots |
|-------|-------|
| None  | N\A   |

| Tabs     | Slots                                          |
|----------|------------------------------------------------|
| `tabs`   | Auto assigned children based on `ac-tab`       |
| `panels` | Auto assigned children based on `ac-tab-panel` |
|          | Anything else is not slotted                   |

| Text-Area | Slots |
|-----------|-------|
| Unnamed   | \*    |

| Text-Field | Slots                                                          |
|------------|----------------------------------------------------------------|
| Unnamed    | \*                                                             |
| `icon`     | *Optional: should be `<img>`*; Used to replace the search icon |

### Attributes available

Attribute notes:

1. `disabled`: **Boolean**; Toggles interactivity of component
2. `error`: **Boolean**; Toggles showing of `helpertext`, for form validation
3. `helpertext`: **String**; Text to show when `error` is true
4. `selected`: **String**; Initial selection, can be an `id` of child, or the child can have `selected` set to `true`

| Accordion  | Attributes   |
|------------|--------------|
| `selected` | *See note 4* |

| Button     | Attributes   |
|------------|--------------|
| `disabled` | *See note 1* |

| Card   | Attributes                                                         |
|--------|--------------------------------------------------------------------|
| `face` | **String**; Initial face to show; Valid options: `front` or `back` |

| Checkbox     | Attributes                                                                    |
|--------------|-------------------------------------------------------------------------------|
| `checked`    | **Boolean**; Initial value; Updated with new checked value changed internally |
| `disabled`   | *See note 1*                                                                  |
| `error`      | *See note 2*                                                                  |
| `helpertext` | *See note 3*                                                                  |

| Combobox       | Attributes                                  |
|----------------|---------------------------------------------|
| `allow-input`  | **Boolean**; Allows new options to be input |
| `autocomplete` | **String**; `list`, `inline`, `both`        |
| `disabled`     | *See note 1*                                |
| `error`        | *See note 2*                                |
| `helpertext`   | *See note 3*                                |
| `selected`     | *See note 4*                                |

| Draggable-List | Attributes |
|----------------|------------|
| None           | N\A        |

| Divider | Attributes |
|---------|------------|
| None    | N\A        |

| Files        | Attributes                                                |
|--------------|-----------------------------------------------------------|
| `accept`     | **String**; Defines file types accepted                   |
| `error`      | *See note 2*                                              |
| `helpertext` | *See note 3*                                              |
| `multiple`   | **Boolean**; Allows user to select multiple files at once |

| Loading | Attributes |
|---------|------------|
| None    | N\A        |

| Listbox    | Attributes                             |
|------------|----------------------------------------|
| `multiple` | **Boolean**; Allow multiple selections |
| `selected` | *See note 4*                           |

| Number        | Attributes                                                                |
|---------------|---------------------------------------------------------------------------|
| `error`       | *See note 2*                                                              |
| `helpertext`  | *See note 3*                                                              |
| `max`         | **Number**; Maximum value allowed; Must be higher than `min`              |
| `maxlength`   | **Number**; Maximum digits allowed                                        |
| `min`         | **Number**; Minimum value allowed; Must be lower than `max`               |
| `minlength`   | **Number**; Minimum digits allowed                                        |
| `placeholder` | **String**; Placeholder text                                              |
| `size`        | **Number**; Width of component in number of characters                    |
| `step`        | **Number**; Granularity of value and changes in value                     |
| `value`       | **Number**; Initial value; Updated with new value when changed internally |

| Option      | Attributes                                               |
|-------------|----------------------------------------------------------|
| `draggable` | **Boolean**; Indicates if component is draggable variant |

| Password      | Attributes                                                                |
|---------------|---------------------------------------------------------------------------|
| `error`       | *See note 2*                                                              |
| `helpertext`  | *See note 3*                                                              |
| `maxlength`   | **Number**; Maximum digits allowed                                        |
| `minlength`   | **Number**; Minimum digits allowed                                        |
| `placeholder` | **String**; Placeholder text                                              |
| `size`        | **Number**; Width of component in number of characters                    |
| `value`       | **String**; Initial value; Updated with new value when changed internally |

| Radio        | Attributes                                                                                                                              |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `checked`    | **Boolean**; Initial value; Updated with new checked value changed internally                                                           |
| `error`      | *See note 2*                                                                                                                            |
| `helpertext` | *See note 3*                                                                                                                            |
| `name`       | **String**; Named group to which the radio belongs; Toggled radio components in the same name group will toggle all others in the group |
| `value`      | **String**; Contains the radio's value, differentiates multiple radios belonging to the same `name` group                               |

| Select       | Attributes   |
|--------------|--------------|
| `error`      | *See note 2* |
| `helpertext` | *See note 3* |

| Slider       | Attributes                                                                |
|--------------|---------------------------------------------------------------------------|
| `error`      | *See note 2*                                                              |
| `helpertext` | *See note 3*                                                              |
| `max`        | **Number**; Maximum value allowed; Must be higher than `min`              |
| `min`        | **Number**; Minimum value allowed; Must be lower than `max`               |
| `step`       | **Number**; Granularity of value and changes in value                     |
| `value`      | **Number**; Initial value; Updated with new value when changed internally |

| Snackbar    | Attributes                                                                                           |
|-------------|------------------------------------------------------------------------------------------------------|
| `anchor`    | **String**; `<vertical> <horizontal>`; Valid options: `left`, `right`, `center`, `top`, `bottom`     |
| `animation` | **String**; Valid options: `slide`, `grow`, `fade`                                                   |
| `autohide`  | **Number**; Hides the component in *N* milliseconds                                                  |
| `direction` | **String**; Slide direction, coming from *N* direction; Valid options: `left`, `right`, `up`, `down` |
| `onclose`   | **Function**; Function called when component closes                                                  |
| `open`      | **Boolean**; Initial status of component; Updated with new value when changed internally             |

| Switch       | Attributes                                                                    |
|--------------|-------------------------------------------------------------------------------|
| `checked`    | **Boolean**; Initial value; Updated with new checked value changed internally |
| `error`      | *See note 2*                                                                  |
| `helpertext` | *See note 3*                                                                  |

| Table             | Attributes                               |
|-------------------|------------------------------------------|
| `allow-selection` | **Boolean**; Allows cells to be selected |
| `columns`         | **JSON**; Column data                    |
| `filters`         | **JSON**; Filter data                    |
| `page`            | **Number**; Current page                 |
| `page-size`       | **Number**; Initial page size            |
| `rows`            | **JSON**; Row data                       |

| Tabs       | Attributes                             |
|------------|----------------------------------------|
| `selected` | *See note 4*                           |
| `variant`  | **String**; Valid options: `alternate` |

| Text-Area     | Attributes                                                                            |
|---------------|---------------------------------------------------------------------------------------|
| `auto-height` | **Boolean**; Toggles auto expansion by component when text is higher than the default |
| `cols`        | **Number**; Width of component in number of characters                                |
| `error`       | *See note 2*                                                                          |
| `helpertext`  | *See note 3*                                                                          |
| `lines`       | **Number**; Same as `rows`                                                            |
| `maxlength`   | **Number**; Maximum digits allowed                                                    |
| `minlength`   | **Number**; Minimum digits allowed                                                    |
| `placeholder` | **String**; Placeholder text                                                          |
| `resize`      | **String**; CSS property applied to component                                         |
| `rows`        | **Number**; Height of component in number of characters                               |
| `value`       | **Number**; Initial value; Updated with new value when changed internally             |

| Text-Field    | Attributes                                                                |
|---------------|---------------------------------------------------------------------------|
| `error`       | *See note 2*                                                              |
| `helpertext`  | *See note 3*                                                              |
| `maxlength`   | **Number**; Maximum digits allowed                                        |
| `minlength`   | **Number**; Minimum digits allowed                                        |
| `placeholder` | **String**; Placeholder text                                              |
| `search`      | **Boolean**; Toggles showing search icon in component                     |
| `size`        | **Number**; Width of component in number of characters                    |
| `value`       | **Number**; Initial value; Updated with new value when changed internally |

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
