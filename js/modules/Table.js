import { highlightCopied, ModalWindow } from "./modules.js";


const log = console.log;

function Table(id, wordsList, settings = {}) {

    const rowClass = settings.rowClass ?? ".items-row";
    const englishWordClass = settings.englishWordClass;
    const japaneseWordClass = settings.japaneseWordClass;
    const checkboxClass = ".is-active-checkbox";
    const $table = $(`${id} `); // removed 'tbody'
    const $toggleAllButton = $("#toggle-all-checkbox");
    const $numActiveWordsHolder = $("#num-active-holder");
    const $rowTemplate = $(rowClass).clone();
    const that = this;

    const displayWindow = new ModalWindow({
        modalWindow: $("#words-table-holder"),
        toggleButtons: $(".words-table-toggle-button"),
        displayClass: "showing",
        failOn: () => this.getNumberWords() < 4,
    });

    const getAllRows = () => $table.find(rowClass);

    const showNumActive = () => {
        const numActive = this.getNumberActiveWords();
        $numActiveWordsHolder.text(`(x${numActive})`);
        this.onChangeNumberActive(numActive);
    };

    this.onChangeNumberActive = () => undefined;

    $table.find(rowClass).remove();
    $toggleAllButton.on("click", () => {
        const newValue = $toggleAllButton.is(":checked") ? true : false;
        $table.find(checkboxClass).each((index, checkbox) => $(checkbox).prop("checked", newValue));
        showNumActive();
        this.onToggleActive();
    });

    this.onBuildTable = () => undefined;
    this.onToggleActive = () => undefined;
    this.getRange = () => undefined;
    this.doAvoidProperNouns = () => undefined;
    this.doDeleteWeirdParentheses = () => undefined;

    // this.rowsAreSorted = () => {
    //     return getAllRows().every(row => {
    //         const thisRowNumber = this.getRowNumber(row);
    //         const nextRowNumber = this.getRowNumber(row?.nextSibling);
    //         if (!thisRowNumber || !nextRowNumber) return true;
    //         return thisRowNumber < nextRowNumber;
    //     });
    // };

    this.getAllWords = language => this.getActiveRows().map(row => this.getWordByLanguage(row, language));

    // this.randomizeRows = doShuffle => doShuffle ? addRows(shuffle(getAllRows())) : this.unshuffleRows();

    // this.unshuffleRows = () => {
    //     const rowsInOrder = getAllRows().sort((r1, r2) => {
    //         const n1 = parseInt(this.getRowNumber(r1));
    //         const n2 = parseInt(this.getRowNumber(r2));
    //         return n1 < n2 ? -1 : (n1 > n2 ? 1 : 0);
    //     });
    //     addRows(rowsInOrder);
    // };

    this.getRowNumber = row => parseInt(row?.querySelector(".item-number")?.innerHTML);
    this.getWordByLanguage = (row, language) => row?.querySelector(`.${language}`)?.innerHTML;
    this.getEnglish = row => this.getWordByLanguage(row, englishWordClass);
    this.getJapanese = row => this.getWordByLanguage(row, japaneseWordClass);
    this.getActiveRows = () => getAllRows().get().filter(row => $(row).find(checkboxClass).is(":checked"));
    this.getNumberActiveWords = () => this.getActiveRows().length;
    this.getNumberWords = () => getAllRows().length;
    this.rangeIsValid = () => false;
    this.onEmptyTable = () => undefined;

    this.highlightCopiedRows = () => {
        document.querySelectorAll(".word-cell").forEach(cell => highlightCopied({ elem: cell, }));
    };

    this.buildTable = () => {
        emptyTable();
        if (!this.rangeIsValid()) return false;
        const words = getWords();
        words.forEach(word => newTableRow(wordsList[word]));
        showNumActive();
        this.onBuildTable(this.getNumberActiveWords());
    };

    function emptyTable() {
        $table.find(rowClass).each((_, $row) => $row.remove());
        that.onEmptyTable(0);
    }

    const newTableRow = obj => {

        if (!obj.english || !obj.japanese) return log("Bad data, bitch!");

        if (this.doAvoidProperNouns() && /[A-Z]/g.test(obj.english)) return false;
        if (this.doUseJuuyougoOnly() && !obj.juuyougo) return false;
        if (this.doUseMainPassageWordsOnly() && !obj.mainPage) return false;

        if (this.doDeleteWeirdParentheses()) obj.japanese = obj.japanese.replace(/〔.*〕/g, "");

        const $newRow = $rowTemplate.clone();

        $newRow.find(`.${englishWordClass}`).text(obj.english);
        $newRow.find(`.${japaneseWordClass}`).text(obj.japanese);
        $newRow.find(".item-number").text("p. " + obj.page);
        $newRow.find(".is-active-checkbox").on("change", () => {
            showNumActive();
            this.onChangeNumberActive(this.getNumberActiveWords());
            this.onToggleActive();
        });

        $table.append($newRow);
    };

    function getWords() {

        const gakunen = that.getRange().gakunen;
        const pages = that.getRange().pages;

        let returnArray = [];

        pages.forEach(group => {

            const lowerLimit = group.from;
            const upperLimit = group.until;

            const words = Object.keys(wordsList).filter(word => {
                const page = wordsList[word].page
                const isInGakunen = wordsList[word].year === gakunen;
                const isInRange = page >= lowerLimit && page <= upperLimit;
                return isInGakunen && isInRange;
            });

            returnArray.push(...words);
        });

        // cool way to remove duplicates - taking advantage of the fact that 'indexOf' returns the 
        // index of only the FIRST instance, so it removes any instances with different indexes
        returnArray = returnArray.filter((element, index) => returnArray.indexOf(element) === index);

        returnArray.sort((a, b) => {
            if (wordsList[a].page > wordsList[b].page) return 1;
            if (wordsList[a].page < wordsList[b].page) return -1;
            return 0;
        });

        return returnArray;
    };
}

export { Table };
