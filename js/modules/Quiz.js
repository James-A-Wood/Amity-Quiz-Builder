
import { shuffle, whittle, highlightCopied, ModalWindow, optionTextSwitcher } from "./modules.js";
import { Misspeller } from "../Misspeller.js";
import { Confetti } from "./Confetti.js";
import "../libraries/jquery.js";

const log = console.log;

function QuizBuilder(table, settingsSaver, settings = {}) {

    const $quizTypeSelect = $("#quiz-type-select");
    const $choiceNumTypeSelect = $("#choice-number-type-select");
    const $numChoicesSelect = $("#num-choices-select");
    const $choicesOnSelector = $("#choices-on-select");
    const $copyButton = $("#copy-quiz-button");
    const $textarea = $("#quiz-holder");
    const $problemSpacingSelect = $("#problem-spacing-select");
    const $allQuizSelects = $("#quiz-stuff select");
    const $numProblemsInput = $("#num-problems-input");
    const $kaitouRanSelect = $("#kaitou-ran-select");
    const $includeNameSpaceCheckbox = $("#include-name-space");
    const $includeTitleCheckbox = $("#include-quiz-title");
    const $includeTabWarning = $("#include-tab-warning");
    const $useNoneOfTheAboveCheckbox = $("#use-none-of-the-above-checkbox");
    const $doShowFirstLetter = $("#do-show-first-letter");
    const $removeParenthesesFromProblem = $("#remove-parantheses-from-problem-checkbox");

    const that = this;
    const copyButtonOriginalContent = $copyButton.html();

    const misspeller = new Misspeller();
    const confetti = new Confetti();

    const getNumberProblems = () => parseInt($numProblemsInput.val());
    const quizType = () => $quizTypeSelect.val();
    const doUseNoneOfTheAbove = () => $useNoneOfTheAboveCheckbox.is(":checked");
    const doShowFirstLetter = () => quizType() === "writing_j_to_e" && $doShowFirstLetter.is(":checked");
    const isWriting = () => ["writing_e_to_j", "writing_j_to_e"].includes(quizType());

    const tabWarning = (() => {

        const englishContent = "*\tAll of the spacing is done using tabs, so be sure to adjust the tabs \n*\tto your liking after pasting into Word, etc.\n";
        const japaneseContent = "*\tすべてのスペーシングはタブを使っています。Word などに\n*\t貼り付けてから、タブを調整してください。\n";

        return () => {
            let string = "";
            string += "**********************************************************************************\n";
            string += this.getLanguage() === "japanese" ? japaneseContent : englishContent;
            string += "**********************************************************************************\n\n\n";
            return string;
        };
    })();

    let currentNumberProblems = 0;

    this.buildNew = () => undefined;
    this.onNumberProblemsChange = () => undefined;
    this.onNumberCandidatesChanged = () => undefined;
    this.minNumberQuizProblems = 3;
    this.getLanguage = () => undefined;
    this.onlanguageChange = language => optionTextSwitcher.setLanguage(language);
    this.isWriting = isWriting;
    this.getGakunen = () => log("OK?");

    this.setNumProblems = num => {
        $numProblemsInput.prop("max", num);
        if ($numProblemsInput.val() > num) $numProblemsInput.val();
    };

    this.generateQuiz = () => {

        $textarea.val("").removeClass("copied").empty();

        if (getNumberProblems() < this.minNumberQuizProblems) return $textarea.val(`Choose at least ${this.minNumberQuizProblems} problems!`);
        $doShowFirstLetter.parent().toggle(quizType() === "writing_j_to_e");
        if (currentNumberProblems !== table.getActiveRows().length) numberProblemsHasChanged();

        const getMisspelledFor = word => misspeller.getAllFor(word);

        const doIncludeName = settingsSaver.getValue($includeNameSpaceCheckbox);
        const doIncludeTitle = settingsSaver.getValue($includeTitleCheckbox);
        const doIncludeTabWarning = settingsSaver.getValue($includeTabWarning);
        const removeParens = str => str.replace(/[\(（〔].*[\)）〕]/g, "");

        const rows = shuffle(table.getActiveRows());

        const questionLanguage = ["eiwa", "writing_e_to_j"].includes(quizType()) ? settings.englishWordClass : settings.japaneseWordClass;
        const choiceLanguage = ["eiwa", "writing_e_to_j"].includes(quizType()) ? settings.japaneseWordClass : settings.englishWordClass;
        const numChoices = isWriting() ? 0 : $numChoicesSelect.val();
        const problemSpacing = ($problemSpacingSelect.val());
        const answerHeadingText = this.getLanguage() === "japanese" ? "答え:" : "Answers:";
        const answerBreak = settings.answerBreak ?? `\n\n===================\n\n${answerHeadingText}\n\n`;

        let string = "";
        if (doIncludeTabWarning) string += tabWarning();

        let answers = "";

        if (!rows.length) return () => $textarea.val("No items are selected...")();

        const language = this.getLanguage();
        if (doIncludeName) string += `${nameStuff[language].name}\t${nameStuff[language].nenKumiBan}\t${nameStuff[language].score} / ${getNumberProblems()}`.replace("__GAKUNEN__", this.getGakunen() + "　");

        whittle(rows, getNumberProblems());

        string += "\n\n";

        if (doIncludeTitle) string += generateTitle(table);

        rows.forEach((row, index) => string += getNewQuizRow(row, index));

        function processRow(row, index, choiceLanguage) {

            const correctAnswer = table.getWordByLanguage(row, choiceLanguage);
            const dummyAnswers = isWriting() ? [] : getDummyAnswers(correctAnswer);
            const english = table.getWordByLanguage(row, "english-word");
            return {
                correctAnswer,
                dummyAnswers,
                english,
                japanese: table.getWordByLanguage(row, "japanese-word"),
                lineSpacing: ($choicesOnSelector.val() === "newline") ? "\n" : "\t",
                problemNumber: (index + 1) + ".",
                question: table.getWordByLanguage(row, questionLanguage),
                sentakushi: isWriting() ? [] : shuffle([correctAnswer, ...dummyAnswers]),
                sentakushiNumbers: choiceNumTypes[$choiceNumTypeSelect.val()].quiz_symbol,
                separateLines: ($choicesOnSelector.val() === "newline") ? true : false,
                kaitouRan: (function () {
                    if (isWriting() && doShowFirstLetter()) return english.charAt(0) + kaitouRanText[quizType()];
                    if (isWriting()) return kaitouRanText[quizType()];
                    if ($kaitouRanSelect.val()) return kaitouRanText[$kaitouRanSelect.val()];
                    return "";
                }()),
            };
        }

        function addSentakushi(r, i) {
            const sentakushiKigou = r.sentakushiNumbers[i] + " ";
            const sentakushiText = (doUseNoneOfTheAbove() && i === numChoices - 1) ? "この中に正解はない" : r.sentakushi[i];
            return `\t${sentakushiKigou}${sentakushiText}${r.lineSpacing}`;
        }

        function getNewQuizRow(row, index) {

            const r = processRow(row, index, choiceLanguage);
            const kaitouRan = r.kaitouRan ?? "";
            const kaitouRanSpacing = r.separateLines ? "\t" : "　";

            if ($removeParenthesesFromProblem.is(":checked")) r.question = removeParens(r.question);

            let string = `${r.problemNumber}\t${r.question}${kaitouRanSpacing}${kaitouRan}\n`;

            answers += `${r.problemNumber}\t${getAnswerSymbolFor(r.sentakushi, r.correctAnswer)}\n`;

            for (let i = 0; i < numChoices; i++) string += addSentakushi(r, i);

            if (!r.separateLines) string += "\n"; // KLUGE because there's an extra line break when we're doing separate lines
            string = string.replace(/\t{2,}/g, "\t"); // KLUGE removing double tabs which are in here for some reason

            for (let i = 0; i < problemSpacing; i++) string += "\n";

            return string;
        }

        function generateTitle(table) {
            let string = "";
            const range = table.getRange();
            string += `\n\nOne World ${that.getGakunen()} Vocabulary Quiz (p. ${range.pagesString})`;
            string += "\n\n\n\n";
            return string;
        }

        function getAnswerSymbolFor(sentakushi, correctAnswer) {
            if (isWriting()) return correctAnswer;
            const type = $choiceNumTypeSelect.val()
            const index = sentakushi.indexOf(correctAnswer);
            return choiceNumTypes[type].answer_sheet_symbol[index];
        }

        function getDummyAnswers(correctAnswer) {

            const allAnswers = quizType() === "spelling" ? getMisspelledFor(correctAnswer) : table.getAllWords(choiceLanguage);
            const array = [];

            // for spelling quizzes, only a few answers are OK, you see...
            if (quizType() === "spelling" && allAnswers.length < that.minNumberQuizProblems) return [];

            let safetyCounter = 0;
            while (array.length < numChoices - 1 && safetyCounter++ < 1000) { // leaving one space for the correct answer
                const rand = Math.floor(Math.random() * allAnswers.length);
                if (allAnswers[rand] === correctAnswer) continue;
                array.push(allAnswers[rand]);
                allAnswers.splice(rand, 1);
            }

            return array;
        }

        $textarea.val(string + answerBreak + answers);
    };

    $allQuizSelects.each($input => $input.on("change", () => this.generateQuiz()));

    [
        $quizTypeSelect,
        $choiceNumTypeSelect,
        $numChoicesSelect,
        $choicesOnSelector,
        $problemSpacingSelect,
        $kaitouRanSelect,
        $numProblemsInput,
        $includeNameSpaceCheckbox,
        $includeTitleCheckbox,
        $includeTabWarning,
        $useNoneOfTheAboveCheckbox,
        $doShowFirstLetter,
        $removeParenthesesFromProblem,
    ].forEach($elem => {
        settingsSaver.registerInput($elem);
        settingsSaver.onchange($elem, () => this.generateQuiz());
        $elem.on("change", () => {
            $(".mc").toggle(!this.isWriting());
            $useNoneOfTheAboveCheckbox.parent().toggle(!this.isWriting());
        });
        $elem.trigger("change");
    });

    optionTextSwitcher.addNew($quizTypeSelect, ["英 → 和", "和 → 英", "スペル", "筆記(英→和)", "筆記(和→英)"]);
    optionTextSwitcher.addNew($problemSpacingSelect, ["０行", "１行", "２行"]);
    optionTextSwitcher.addNew($choicesOnSelector, ["横に並べる", "縦に並べる"])

    const choiceNumTypes = {
        abc: {
            quiz_symbol: ["A)", "B)", "C)", "D)"],
            answer_sheet_symbol: ["A", "B", "C", "D"],
        },
        numbers: {
            quiz_symbol: ["1)", "2)", "3)", "4)"],
            answer_sheet_symbol: [1, 2, 3, 4],
        },
        katakana: {
            quiz_symbol: ["ア)", "イ)", "ウ)", "エ)"],
            answer_sheet_symbol: ["ア", "イ", "ウ", "エ"],
        },
        squares: {
            quiz_symbol: ["□", "□", "□", "□"],
            answer_sheet_symbol: [1, 2, 3, 4],
        },
    };

    const kaitouRanText = {
        parentheses: "(　　　　　)", // using 全角 spacing here
        brackets: "[　　　　　]",
        line: "________",
        parentheses_with_line: "( _____ )",
        brackets_with_line: "[ _____ ]",
        brackets_with_line: "[ _____ ]",
        writing_e_to_j: "_________________________",
        writing_j_to_e: "_________________________",
    };

    $copyButton.on("click", () => {

        if (!$textarea.val()) return alert("Build a quiz first!");

        navigator.clipboard.writeText($textarea.val() + "\n\n\n").then(() => {

            $copyButton.removeClass("btn-primary");
            $copyButton.addClass("btn-success");
            $copyButton.text("Copied!");

            const restoreCopyButton = () => {
                $copyButton.removeClass("btn-success");
                $copyButton.addClass("btn-primary");
                $copyButton.html(copyButtonOriginalContent);
            };

            $(window).off("keydown mousemove", restoreCopyButton).on("keydown mousemove", restoreCopyButton);

            highlightCopied({ elem: $textarea, });

            const $quizHolder = $("#holder");
            const $genie = $("<div id='genie'>").appendTo($("body")).css({
                position: "absolute",
                width: $quizHolder.width(),
                height: $quizHolder.height(),
                left: $quizHolder.offset().left,
                top: $quizHolder.offset().top,
            }).on("animationend", () => {
                confetti.makeNew({
                    parent: $copyButton[0],
                    duration: 0.8,
                });
            });
        });
    });

    const numberProblemsHasChanged = () => {
        const newNumber = table.getActiveRows().length;
        this.onNumberProblemsChange(newNumber);
        currentNumberProblems = newNumber;
    };

    const nameStuff = {
        english: {
            name: "Name _________________________",
            nenKumiBan: `Year __GAKUNEN__ Class____ Number ____`,
            score: "______",
        },
        japanese: {
            name: "氏名 _________________________",
            nenKumiBan: `__GAKUNEN__年  _____組  _____番`,
            score: "______",
        },
    };

    const displayWindow = new ModalWindow({
        modalWindow: $("#quiz-holder-frame"),
        toggleButtons: $(".quiz-toggle-button"),
        displayClass: "showing",
        onToggle: () => $("#quiz-holder").removeClass("copied"),
        failOn: () => getNumberProblems() < this.minNumberQuizProblems,
    });
}


export { QuizBuilder };
