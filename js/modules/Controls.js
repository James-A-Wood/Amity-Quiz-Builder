
import { optionTextSwitcher } from "../modules/modules.js";

function Controls(settingsSaver, messageWindow) {

    const log = console.log;

    const $gakunenSelect = $("#gakunen-select");
    const $shuffleButton = $("#toggle-shuffle-checkbox");
    const $pageRange = $("#page-range");
    const $numProblemsInput = $("#num-problems-input");
    const $noProperNounsCheckbox = $("#no-proper-nouns-checkbox");
    const $noWeirdParenthesesCheckbox = $("#no-weird-parentheses-checkbox");
    const $juuyougoOnlyCheckbox = $("#juuyougo-only-checkbox");
    const $mainPassageOnlyWordsCheckbox = $("#main-passage-words-only-checkbox");
    const $titleImageHolder = $(".title-image-holder");

    let validRange = false;

    [
        $pageRange,
        $noProperNounsCheckbox,
        $noWeirdParenthesesCheckbox,
        $juuyougoOnlyCheckbox,
        $mainPassageOnlyWordsCheckbox,
    ].forEach($elem => {
        settingsSaver.registerInput($elem);
        settingsSaver.onchange($elem, () => this.onchange());
    });

    settingsSaver.registerInput($gakunenSelect);
    settingsSaver.onchange($gakunenSelect, () => {
        this.onchange();
        $titleImageHolder.removeClass("selected");
        const indexOfImage = $gakunenSelect.val() - 1;
        $titleImageHolder.eq(indexOfImage).addClass("selected");
        // $("body").removeClass("year_1 year_2 year_3").addClass("year_" + $gakunenSelect.val());
    });

    optionTextSwitcher.addNew($gakunenSelect, ["第１学年", "第２学年", "第３学年"]);

    this.onchange = () => undefined;
    this.rangeIsValid = () => !inputNotValid();
    this.doAvoidProperNouns = () => $noProperNounsCheckbox.is(":checked");
    this.doDeleteWeirdParentheses = () => $noWeirdParenthesesCheckbox.is(":checked");
    this.doUseJuuyougoOnly = () => $juuyougoOnlyCheckbox.is(":checked");
    this.doUseMainPassageWordsOnly = () => $mainPassageOnlyWordsCheckbox.is(":checked");
    this.onLanguageChange = language => optionTextSwitcher.setLanguage(language);
    this.getGakunen = () => parseInt($gakunenSelect.val());

    this.setNumProblems = n => {
        const max = parseInt($numProblemsInput.attr("max"));
        const min = parseInt($numProblemsInput.attr("min"));
        const current = $numProblemsInput.val();
        if (current > max) $numProblemsInput.val(max);
        if (current < min) $numProblemsInput.val(min);
        $numProblemsInput.val(n);
    };

    this.shuffle = () => undefined;

    this.getRange = () => {

        const val = $pageRange.val();
        const ranges = val.replace(/[^\d\-,\s{2,}]/g, "");

        const pages = ranges.split(",").map(range => {
            const fromTo = range.split("-");
            const from = parseInt(fromTo[0]);
            const until = parseInt(fromTo.length === 2 ? fromTo[1] : fromTo[0]);
            return { from, until };
        });

        return {
            gakunen: parseInt($gakunenSelect.val()),
            pages: pages,
            pagesString: val.toString(),
        };
    };

    this.copyItems = () => undefined;

    $shuffleButton.onchange = () => this.shuffle($shuffleButton.is(":checked"));

    $gakunenSelect.trigger("change");

    // scrubbin' anything other than digits, spaces, hyphens, and commas
    $pageRange.on("input", () => $pageRange.val($pageRange.val().replace(/[^\d\s\-,]/g, "").replace(/\-{2,}/g, "-").replace(/\s{2,}/g, " ")));
    $pageRange.on("change", () => {
        const validationResults = inputNotValid();
        if (!validationResults) return {}; // was return true
        log("Here?");
        messageWindow.display(validationResults);
        return false;
    });

    $titleImageHolder.on("click", function () {
        const index = $titleImageHolder.index($(this));
        const gakunen = index + 1;
        $gakunenSelect.val(gakunen).trigger("change");
    });


    const inputNotValid = (function () {

        const conditions = [
            {
                rule: /[^\d,\-]/, // characters other than digits, commas, or hyphens
                errorMessage: "Invalid range! Use only numbers, hyphens, or commas!",
            },
            {
                rule: /[,\-](\D|$)/, // comma or hyphen not followed by a number
                errorMessage: "Invalid range! Number missing after punctuation!",
            },
            {
                rule: /(^|\D)[,\-]/, // comma or hyphen not preceded by a number
                errorMessage: "Invalid range! Number missing before punctuation!",
            },
            {
                rule: /\-\d+\-/, // any digits surrounded by hyphens
                errorMessage: "Invalid range!",
            },
        ];

        function numbersAreOutOfOrder(str) {
            str = str.replace(/\s/g, "");
            const array = str.split(/[,\-]/g);
            return array.some((item, i) => parseInt(item) < parseInt(array[i - 1]));
        }

        return function () {
            const string = $pageRange.val().replace(/\s/g, "");
            for (let i = 0; i < conditions.length; i++) {
                const rule = conditions[i].rule;
                const message = conditions[i].errorMessage;
                if (rule.test(string)) return message;
                if (numbersAreOutOfOrder(string)) return "Numbers are out of order!";
            }
            return null;
        };
    }());
}

export { Controls };
