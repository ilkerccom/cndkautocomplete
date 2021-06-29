// MIT License
// Copyright (c) 2021 Ilker Cindik
// Version 0.1.3

(function () {

    // Self-service
    var self = null;
    var form = null;
    var currentElement = { text: '', id: '' };
    this.field = null;
    var staticContent = '';
    var currentIndex = 0;

    // Define our constructor
    this.CndkAutoComplete = function () {

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

        // Override default options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = overrideDefaults(defaults, arguments[0]);
        }

        // Get input element with #id or .classname
        window.onload = (event) => {
            this.field = getElement(this.options.input);
            self = this;

            if (this.field == undefined) {
                throwError('Element cannot find. Please use "." or "#" selector on element.');
            }
            else if (this.field.tagName !== 'INPUT') {
                throwError('Element must a <input> element.');
            }
            else {
                this.run();
            }
        }
    }

    /* ### PUBLIC METHODS ### */

    // Run
    CndkAutoComplete.prototype.run = function () {

        // Set attributes and listeners
        this.field.setAttribute('cndkAutoComplete', true);
        this.field.setAttribute('itemsShow', this.options.itemsShow);
        this.field.setAttribute('autocomplete', 'off');
        this.field.addEventListener('input', textChange);
        this.field.addEventListener('keydown', preventSpecialKeys);

        if (this.options.showAllOnInputClick && this.options.type == 'static') {
            this.field.addEventListener('click', showAllOnInputClick);
        }

        // Get parent closest form
        form = this.field.closest("form");
        form.addEventListener('submit', formOnSubmit);

        // Load .JSON file (Preload) - if type static
        if (this.options.type == 'static') {
            loadJSON(this.options.ajaxFile, function (data) {
                staticContent = data;
            });
        }

        // Get current widh and height of input
        var _width = this.field.offsetWidth;
        var _height = this.field.offsetHeight;

        // Create root div
        var container = document.createElement("DIV");
        container.setAttribute("id", self.options.rootDivId + "Container");
        container.setAttribute("class", this.options.itemClass + '-' + this.options.theme);
        container.setAttribute("style", "position:relative");

        var root = document.createElement("DIV");
        root.setAttribute("id", self.options.rootDivId);
        root.setAttribute("style", "top:" + _height + "px");
        this.field.parentNode.insertBefore(container, this.field);
        container.appendChild(this.field);
        container.appendChild(root);
    }

    /* ### PRIVATE METHODS ### */

    // Ovverride options helper
    function overrideDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    // Show all items on input click [handler]
    function showAllOnInputClick(e) {
        var value = e.target.value;
        clearList();
        if(value.length == 0) showAllItems();
    }

    // This method shows all items in static json file
    function showAllItems() {

        // Reset current index
        currentIndex = 0;

        // Root Div
        var root = document.getElementById(self.options.rootDivId);

        // List
        for (i = 0; i < staticContent.length; i++) {

            // Item layout
            var item = staticContent[i].text;

            // Item div
            var div = document.createElement("DIV");
            div.setAttribute("class", self.options.itemClass + " " + self.options.itemClass + "-" + staticContent[i].id);
            div.setAttribute("data-id", staticContent[i].id);
            div.setAttribute("data-index", i);
            div.addEventListener("click", clickItem);

            // Rendered
            var itemVariables = extractVariable(self.options.itemLayout);
            var itemRender = '';
            var layout = self.options.itemLayout;

            // Resolve variables
            for (var d = 0; d < itemVariables.length; d++) {
                if (itemVariables[d] == 'text') {
                    layout = layout.replace('${' + itemVariables[d] + '}', item);
                };
                layout = layout.replace('${' + itemVariables[d] + '}', staticContent[i][itemVariables[d]]);
            }
            itemRender = layout;

            // Assign
            div.innerHTML = itemRender;
            root.appendChild(div);

            // Set active item (currently first item)
            setActiveItem();
        }
    }

    // On text-change target input
    function textChange(e) {

        // Value
        var value = this.value.toLowerCase();

        // Clear
        clearList();

        // Search
        searchItems(value);
    }

    // Search entered text in items
    function searchItems(value) {

        // Reset current index
        currentIndex = 0;

        // Limit chars to search
        var length = value.length;
        if (length < self.options.minCharsToSearch) { clearList(); return; }

        // Root Div
        var root = document.getElementById(self.options.rootDivId);

        // Get items by type
        if (self.options.type == 'static') {
            var c = 1;
            for (i = 0; i < staticContent.length; i++) {

                // Get values
                var search = staticContent[i].text.toLowerCase();
                var searchId = staticContent[i].id;

                // Add items
                if (search.includes(value) && elementIsExists(searchId) == 0) {
                    var startIndex = search.indexOf(value);
                    var lastIndex = startIndex + value.length;

                    // Item layout
                    var item = staticContent[i].text.slice(0, startIndex);
                    item += "<b>" + staticContent[i].text.slice(startIndex, lastIndex) + "</b>";
                    item += staticContent[i].text.slice(lastIndex)

                    // Item div
                    var div = document.createElement("DIV");
                    div.setAttribute("class", self.options.itemClass + " " + self.options.itemClass + "-" + searchId);
                    div.setAttribute("data-id", searchId);
                    div.setAttribute("data-index", i);
                    div.addEventListener("click", clickItem);

                    // Rendered
                    var itemVariables = extractVariable(self.options.itemLayout);
                    var itemRender = '';
                    var layout = self.options.itemLayout;

                    // Resolve variables
                    for (var d = 0; d < itemVariables.length; d++) {
                        if (itemVariables[d] == 'text') {
                            layout = layout.replace('${' + itemVariables[d] + '}', item);
                        };
                        layout = layout.replace('${' + itemVariables[d] + '}', staticContent[i][itemVariables[d]]);
                    }
                    itemRender = layout;

                    // Assign
                    div.innerHTML = itemRender;
                    root.appendChild(div);

                    // Set active item (currently first item)
                    setActiveItem();

                    // Limit showed items
                    if (c >= self.options.itemsShow) break;
                    else c++;
                }
            }
        }
        else {
            // No char to search
            clearList();
        }
    }

    // Forms is submitting
    function formOnSubmit(e) {
        e.preventDefault();
        if (self.options.submitValueType == '${id}' && currentElement.id != '') {
            self.field.value = currentElement.id;
        }
        form.submit();
    }

    // Remove all neccesary elements
    function clearList() {
        var x = document.getElementsByClassName(self.options.itemClass);
        while (x.length > 0) {
            x[0].parentNode.removeChild(x[0]);
        }
    }

    // Any item of selected
    function itemSelected(e) {
        // Disable on select
        if (self.options.disableInputOnSelect) {
            self.field.setAttribute('disabled', 'disabled');
        }

        // Input layout
        var itemVariables = extractVariable(self.options.itemInputLayout);
        var layout = self.options.itemInputLayout;

        // Resolve variables
        for (var d = 0; d < itemVariables.length; d++) {
            layout = layout.replace('${' + itemVariables[d] + '}', staticContent[currentIndex][itemVariables[d]]);
        }

        // Set Value of Input
        self.field.value = layout;

        // Focus another input
        if(self.options.autoFocusWhenSelect != null){
            var anotherInput = getElement(self.options.autoFocusWhenSelect);
            anotherInput.focus();
        }
    }

    // Clicked item in results
    function clickItem(e) {
        
        // Set selected element
        currentElement.name = e.target.innerText;
        currentElement.id = e.target.attributes["data-id"].value;
        currentIndex = parseInt(e.target.attributes["data-index"].value);
        itemSelected();
    }

    // Prevent special keys (UP-DOWN-ENTER)
    function preventSpecialKeys(e) {
        if (e.keyCode == 38) {
            // Up-Arrow Key
            if (currentIndex > 0) currentIndex--;
            else currentIndex = (self.options.itemsShow - 1);
        }
        else if (e.keyCode == 40) {
            // Down-Arrow Key
            if (currentIndex < (getItemCount() - 1)) currentIndex++;
            else currentIndex = 0;
        }
        else if (e.keyCode == 27) {
            // ESC Key
            currentIndex = 0;
            clearList();
        }
        else if (e.keyCode == 13) {
            // Enter Key
            if (!self.options.submitFormOnEnter && getActiveItem() != null) {
                e.preventDefault();
            }

            // If selected item exists
            var selected = getActiveItem();
            if (selected != null) {

                // Click item
                selected.click();

                // Set selected element
                currentElement.name = selected.innerText;
                currentElement.id = selected.attributes["data-id"].value;
                itemSelected();

                // Clear list
                clearList();

                // Form submit
                if (self.options.submitFormOnItemSelect) {
                    var form = document.getElementsByTagName("form")[0];
                    form.submit();
                }
            }
        }

        // Remove active items
        removeActiveItems();

        // Set active item
        setActiveItem();
    }

    // Load .JSON file functions
    function loadJSON(path, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    var data = JSON.parse(httpRequest.responseText);
                    if (callback) callback(data);
                }
            }
        };
        httpRequest.open('GET', path);
        httpRequest.send();
    }

    // Get element classname or id
    function getElement(input) {
        var firstChar = input.charAt(0);
        if (firstChar === '#') {
            return document.getElementById(input.substr(1));
        }
        else if (firstChar === '.') {
            return document.getElementsByClassName(input.substr(1))[0];
        }
    }

    // Find and extract a variable
    function extractVariable(variable) {
        var regex = new RegExp(/\$\{(\w+?)\}/g),
            text = variable,
            result,
            out = [];
        while (result = regex.exec(text)) {
            out.push(result[1]);
        }
        return out;
    }

    // Returns an integer - currently showing items
    function getItemCount() {
        return document.getElementsByClassName(self.options.itemClass).length;
    }

    // Get selected item
    function getActiveItem() {
        return document.getElementsByClassName(self.options.itemClassActive)[0];
    }

    // Set active item
    function setActiveItem() {
        if (getItemCount() > 0) {
            var activated = document.getElementsByClassName(self.options.itemClass)[currentIndex];
            activated.classList.add(self.options.itemClassActive);
        }
    }

    // Remove active items
    function removeActiveItems() {
        for (i = 0; i < getItemCount(); i++) {
            document.getElementsByClassName(self.options.itemClass)[i].classList.remove(self.options.itemClassActive);
        }
    }

    // Prevent duplicate items
    function elementIsExists(searchId) {
        return document.getElementsByClassName(self.options.itemClass + "-" + searchId).length;
    }

    // Throws a error
    function throwError(error) {
        throw '(Cndk.AutoComplete.js) => ' + error;
    }

    // Hide results when click outside
    document.addEventListener("click", function (e) {
        if (e.target != getElement(self.options.input)) {
            clearList();
        }
    });

}());

