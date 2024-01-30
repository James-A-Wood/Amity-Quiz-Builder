import "../libraries/jquery.js";

const log = console.log;


function whittle(array, num) {
    if (!array || !num || !Array.isArray(array) || isNaN(num)) return log("'whittle' got some bad parameters!");
    if (num > array.length) return array;
    while (array.length > num) array.splice(Math.floor(Math.random() * array.length), 1);
    return array;
};


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


function SettingsSaver(def = {}) {

    this.key = def.key ?? "oneworld_settings";

    localStorage[this.key] = localStorage[this.key] ?? JSON.stringify({});

    const saveSettings = obj => localStorage[this.key] = JSON.stringify(obj);
    const getSavedValues = () => JSON.parse(localStorage[this.key]);
    const that = this;

    const dataHoldingAttributeFor = {
        checkbox: "checked",
        text: "value",
        number: "value",
        "select-one": "value",
        "select-multiple": "value",
    };

    function registerSingleInput($input) {
        const id = $input.attr("id");
        $input.on("change", () => {
            const updated = getSavedValues();
            updated[id] = that.getValue($input);
            that.onSettingChange();
            saveSettings(updated);
        });
        if (!getSavedValues().hasOwnProperty(id)) return false;
        const attributeToSet = dataHoldingAttributeFor[$input[0].type];
        $input.prop(attributeToSet, getSavedValues()[id]);
    };

    this.getValue = $elem => $elem[0][dataHoldingAttributeFor[$elem[0].type]];
    this.onSettingChange = () => undefined;

    this.registerInput = array => {
        const inputs = Array.isArray(array) ? array : [array];
        inputs.forEach($input => registerSingleInput($input));
    };

    this.oninput = (id, func) => $(id).on("input", func);
    this.onchange = (id, func) => $(id).on("change", func);
}

function highlightCopied(obj = {}) {

    obj.copiedClass = obj.copiedClass ?? "copied";
    obj.timeout = obj.timeout ?? "20";

    const $elem = obj.elem;
    $elem.removeClass(obj.copiedClass);

    setTimeout(() => $elem.addClass(obj.copiedClass), obj.timeout);
}


function copyToClipboard() {

    var clipboard = new ClipboardJS("#copy-table-button");

    clipboard.on('success', function (e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);

        e.clearSelection();
    });

    clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
}


function ModalWindow(obj = {}) {

    // required
    const $modal = obj.modalWindow;
    const $toggleButton = obj.toggleButtons;
    const displayClass = obj.displayClass.replace(/\./g, ""); // removing any dots that may have been included

    if (!$modal || !$toggleButton || !displayClass) return log("ModalWindow requires a modal element, toggle button(s), and a class to toggle!");

    this.displayEvent = obj.displayEvent ?? "click";
    this.dismissKeys = obj.dismissKeys ?? ["Escape"];
    this.failOn = () => false;
    this.onToggle = () => undefined;
    this.isActive = true;

    for (let key in obj) this[key] = obj[key];

    const changeClass = val => {
        if (this.failOn()) return;
        $modal.toggleClass(displayClass, val ?? !$modal.hasClass(displayClass));
        this.onToggle();
    };

    $toggleButton.on(this.displayEvent, () => this.isActive && changeClass());

    $(window).on("keydown", e => {
        const dismissKeys = Array.isArray(this.dismissKeys) ? this.dismissKeys : [this.dismissKeys];
        dismissKeys.forEach(key => e.key.toLowerCase() === key.toLowerCase() && changeClass(false));
    });
}

const optionTextSwitcher = (function () {

    const allSelectsArray = [];

    let currentLanguage = "english";

    const replaceOptionText = ($select, array) => $select.find("option").each((i, option) => $(option).text(array[i]));

    const setLanguage = language => {
        currentLanguage = language;
        allSelectsArray.forEach($select => $select[language]());
    };

    const addNew = ($selectElem, japaneseOptions) => {

        if ($selectElem[0].tagName.toLowerCase() !== "select") return log("Need a $select tag for the first parameter!");
        if (!Array.isArray(japaneseOptions)) return log("Second parameter must be an array of Japanese strings!");

        allSelectsArray.push($selectElem);
        const englishOptions = $selectElem.find("option").map((i, option) => $(option).text()).get();
        $selectElem.japanese = () => replaceOptionText($selectElem, japaneseOptions);
        $selectElem.english = () => replaceOptionText($selectElem, englishOptions);
    };

    return {
        setLanguage,
        addNew,
    };
}());


function MessageWindow(obj = {}) {

    const $elem = obj.element;
    const displayMaxDuration = obj.displayMaxDuration ?? 3000;
    const waitBeforeDisplay = obj.delayDuration ?? 200;
    const minDisplayTime = obj.minDisplayTime ?? 1000;
    const queue = [];
    const that = this;

    let myTimeout;
    let lastDisplayTime = Date.now();

    this.display = t => {
        if (!t) return;
        queue.push(t);
        displayNextMessage();
    };

    this.dismiss = () => {
        if (Date.now() - lastDisplayTime < minDisplayTime) return false;
        $elem.removeClass("showing");
        setTimeout(displayNextMessage, waitBeforeDisplay);
    };

    this.isShowing = () => $elem.hasClass("showing");

    $(window).on("keyup click", this.dismiss);

    function displayNextMessage() {
        $elem.text("");
        if (!queue.length) return false;
        clearTimeout(myTimeout);
        $elem.text(queue.pop()).addClass("showing");
        lastDisplayTime = Date.now();
        myTimeout = setTimeout(() => that.dismiss(), displayMaxDuration);
    }
}


export { SettingsSaver, shuffle, whittle, highlightCopied, copyToClipboard, ModalWindow, optionTextSwitcher, MessageWindow };
