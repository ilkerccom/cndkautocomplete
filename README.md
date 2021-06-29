
# Cndk.AutoComplete.js

![alt text](https://i.ibb.co/G3B0vjs/Ekran-Kayd-2021-06-29-22-02-04.gif?raw=true)

Cndk.AutoComplete.js is a pure JavaScript plugin. It performs auto-complete operations within an INPUT.

## Installation

Include the CSS file.

```html
<link href="/cndk.autocomplete.css" rel="stylesheet" type="text/css">
```
Include the JS file.

```html
<script src="/cndk.autocomplete.js" type="text/javascript"></script>
```

## How To Use

### Javascript Init

```
<script>
        var autoComplete = new CndkAutoComplete(
        {
           input: '#inputCountry',
           ajaxFile: '/demos/json/phone_codes.json'
        });
</script>
```

`input` : Selector of a input. You can use class name '.' or id '#'.

`ajaxFile` : JSON file.

#

### HTML Code

```html
<input type="text" id="inputCountry" name="country" class="form-control" placeholder="Search" autofocus="">
```


## JSON Example

`text` and `id` variables are required. It would be helpful if the id value was unique. You can send additional keys in the JSON file. Use these switches in the design regulations.

```
[
    {
        // Default keys
        "text": "Germany",
        "id": "1",

        // Extra keys
        "flag": "https://www.countryflags.io/de/flat/32.png",
        "code": "+144"
    },
    ...
]
```


## Default Options

```
// Default options
        var defaults = {
            input: '', /* Input selector with classname (.) or  ID (#) */
            ajaxFile: '', /* Static or dynamic AjaxFile URL */
            type: 'static', /* static | dynamic */
            minCharsToSearch: 1, /* Min chars to search in items */
            itemsShow: 5, /* Max items to show on list */
            autoFocusWhenSelect: null, /* Focus another input element when any item has been selected */
            disableInputOnSelect: false, /* Disable input if any item has been selected */
            showAllOnInputClick: true, /* Shows all items when value length = 0 and options is = true */
            submitFormOnEnter: false, /* Submit form when press Enter key on the keyboard */
            submitFormOnItemSelect: false, /* Submit form when any item has been selected */
            submitValueType: '${id}', /* $text | $id */
            itemLayout: '${text}', /* Can be used of any json value like in .JSON response => $id | $text | $url */
            itemInputLayout: '${text}', /* Can be used of any json value like in .JSON response => $id | $text | $url */
            rootDivId: "cndkAutoComplete",
            itemClass: 'cndk-item',
            itemClassActive: 'cndk-item-active',
            theme: 'light' /* light | dark */
        }
```

### Custom Item Layout (List) and (Input)

`itemLayout` refers to the view in the list. `itemInputLayout` represents the input value. Here you can use any extra key from json file.

```
<script>
        var autoComplete = new CndkAutoComplete(
            {
                ...
                itemLayout: '<img style="width:15px;" src="${flag}"/> ${text} (<em>${code}</em>)',
                itemInputLayout: '${code}'
            });
    </script>
```
Sample JSON file response of the above example.

```
[
    {
        "text": "Germany",
        "id": "1",
        "flag": "https://www.countryflags.io/tr/flat/32.png",
        "code": "+144"
    },
]
```

## Options

### input `NULL` (Required)
Input selector with classname (.) or ID (#). You can use the default JQuery selectors.

### ajaxFile `NULL` (Required)
Static or dynamic AjaxFile URL. The response should be as in the example above.

### type `static` (Optional)
It can take "static" or "dynamic" values. Statically sent data is preloaded. Dynamically sent data is received during execution.

### minCharsToSearch `1` (Optional)
A call is made when the total length in the input exceeds this value.

### itemsShow `5` (Optional)
Max items to show on list.

### autoFocusWhenSelect `NULL` (Optional)
Focus another input element when any item has been selected. Here you can send a different element as in the `input` value. Example: `autoFocusWhenSelect: '#anotherInput'`

### disableInputOnSelect `false` (Optional)
Disable input if any item has been selected.

### showAllOnInputClick `true` (Optional)
Shows all items when click on input if value not length = 0.

### submitFormOnEnter `false` (Optional)
Submit form when press Enter key on the keyboard.

### submitFormOnItemSelect `false` (Optional)
Submit form when any item has been selected.

### submitValueType `${id}` (Optional)
You can specify which data type to send when the form is submitted.

### itemLayout `${text}` (Optional)
You can specify how the elements in the list appear. You can use HTML code. You can also use any key returned from JSON data. Example: `itemLayout: '<img style="width:15px;" src="${flag}"/> ${text} (<em>${code}</em>)','`

### itemInputLayout `${text}` (Optional)
You can specify how the input value will appear when an element is selected. HTML code cannot be used. You can also use any key returned from JSON data. Example: `itemInputLayout: '${text}'` or `itemInputLayout: '${id}'`

### theme `light` (Optional)
You can use 'light' or 'dark' theme mode.

## License
[MIT](https://choosealicense.com/licenses/mit/)