
import { list as wordsList } from "./modules/oneworld_wordlist.js";
import { SettingsSaver, optionTextSwitcher, MessageWindow } from "./modules/modules.js";
import { QuizBuilder } from "./modules/Quiz.js";
import { Table } from "./modules/Table.js";
import { Controls } from "./modules/Controls.js";
import "./libraries/jquery.js";


const log = console.log;

const systanController = new SystanController(Table, Controls, QuizBuilder, SettingsSaver, MessageWindow);
function SystanController(Table, Controls, QuizBuilder, SettingsSaver, MessageWindow) {

    const englishWordClass = "english-word";
    const japaneseWordClass = "japanese-word";
    const messageWindow = new MessageWindow({
        element: $("#message-window"),
    });

    const $body = $("body");
    const table = new Table("#words-table", wordsList, { englishWordClass, japaneseWordClass, });
    const settingsSaver = new SettingsSaver();
    const controls = new Controls(settingsSaver, messageWindow);
    const quizBuilder = new QuizBuilder(table, settingsSaver, { englishWordClass, japaneseWordClass });

    quizBuilder.getLanguage = () => $("body").hasClass("english-mode") ? "english" : "japanese";
    quizBuilder.getGakunen = () => controls.getGakunen();
    quizBuilder.buildNew = () => {
        const num = table.getActiveRows().length;
        quizBuilder.setNumProblems(num);
        quizBuilder.generateQuiz();
    };

    table.getRange = controls.getRange;
    table.doAvoidProperNouns = () => controls.doAvoidProperNouns();
    table.doDeleteWeirdParentheses = () => controls.doDeleteWeirdParentheses();
    table.doUseJuuyougoOnly = () => controls.doUseJuuyougoOnly();
    table.doUseMainPassageWordsOnly = () => controls.doUseMainPassageWordsOnly();
    table.rangeIsValid = () => controls.rangeIsValid();

    table.onBuildTable = numActiveWords => {
        quizBuilder.buildNew();
        showNumberActiveWords(numActiveWords);
        controls.setNumProblems(table.getNumberActiveWords());
    };
    table.onToggleActive = () => quizBuilder.buildNew();
    table.onChangeNumberActive = n => {
        showNumberActiveWords(n);
        controls.setNumProblems(n);
    };
    table.onEmptyTable = n => showNumberActiveWords(n);

    // controls.shuffle = doShuffle => {
    //     table.randomizeRows(doShuffle);
    //     $body.toggleClass("shuffled", !table.rowsAreSorted());
    // };

    controls.onchange = () => table.buildTable();

    controls.copyItems = () => {

        if (!table.getActiveRows().length) return alert("Please select some items to copy!");

        const doEnglish = getCopyTarget().english;
        const doJapanese = getCopyTarget().japanese;

        let wordsList = "";

        table.getActiveRows().forEach((item, index) => {
            const english = table.getEnglish(item);
            const japanese = table.getJapanese(item);
            if (doEnglish) wordsList += english;
            if (doEnglish && doJapanese) wordsList += "\t";
            if (doJapanese) wordsList += japanese;
            if (index !== table.getActiveRows().length - 1) wordsList += "\n";
        });

        navigator.clipboard.writeText(wordsList).then(() => {
            table.highlightCopiedRows({ "english-word": doEnglish, "japanese-word": doJapanese });
        }, () => alert("Something went wrong!"));

        return false;
    };

    $(".language-button").each((i, button) => {
        $(button).on("click", () => {
            const $button = $(button);
            const targetLanguage = $button.hasClass("english") ? "japanese-mode" : "english-mode";
            $body.removeClass("japanese-mode english-mode").addClass(targetLanguage);
            localStorage.systan_language = targetLanguage;
            quizBuilder.buildNew();
            controls.onLanguageChange(targetLanguage === "english-mode" ? "english" : "japanese");
        });
    });
    $body.addClass(localStorage.systan_language ?? "english-mode");

    optionTextSwitcher.setLanguage(localStorage.systan_language === "japanese-mode" ? "japanese" : "english");

    table.buildTable();


    ///////////////////////////

    function showNumberActiveWords(n) {
        return $("#number-words-display").text(`(${n} words)`);
    }

}
