

const log = console.log;

import { shuffle } from "./modules/modules.js";


function Misspeller(words_list) {

    const isCapital = char => char.toUpperCase() === char;
    const getRandomIndex = array => Math.floor(Math.random() * array.length);
    const whittle = (array, number) => {
        while (array.length > number) array.splice(getRandomIndex(array), 1);
    };

    const pickOneFrom = (array, options = {}) => {
        const rand = getRandomIndex(array);
        const element = array[rand];
        if (options.deleteChoice) array.splice(rand, 1);
        return element;
    };

    const expertPatterns = [

        //
        //
        // word start
        //
        //
        [/\boc([^aeiou])/, "ac$1"], // octopus --> actopus
        [/\b([^aeiou])l([aeiou])/g, "$1r$2"], // climate --> crimate
        [/\b([^aeiou])o([^aeiou])([^e])/, "$1a$2$3"], // color --> calor
        [/\bint/, "ent"], // integer --> enteger
        [/\bgua/, "ga"],
        [/\bgua/, "ge"],
        [/\bg([ei])([^aeiou])([aeiou])/, "j$1$2$3"], // genuine --> jenuine
        [/\bpsy/, "sai"], // psychich --> psaichic
        [/\bpsy/, "sai"], // psychich --> saichic
        [/\bpsy/, "psi"], // psychich --> psichich
        [/\bpsy/, "psai"], // psychology --> psaichology
        [/\bin([^aeiou])/, "en$1"], // incident --> encident
        [/\bin([^aeiou])/, "im$1"], // interior --> imterior
        [/\ben([^aeiou])/, "in$1"], // encounter --> incounter
        [/\bgen/, "jen"], // gentle --> jentle
        [/\bim([^aeiou])/, "in$1"], // impossible --> inpossible
        [/\bim([^aeiou])/, "em$1"], // impossible --> empossible
        [/\bun([^aeiou])/, "um$1"], // impossible --> unpossible
        [/\bsce/, "si"], // scenery --> scinery
        [/\bsce/, "se"], // senery --> scinery
        [/\bc([uao])/, "k$1"], // current --> kurrent (hard "c" to "k")
        [/\bc([ei])/, "s$1"], // center --> senter
        [/\bwho/, "ho"], // whose --> hose
        [/\b[^aeiou]ire/, "aire"], // direct --> dairect
        [/\bkn([aeiou])/, "n$1"], // know --> now
        //
        //
        //
        //
        // word middle
        //
        [/wr/, "r"], // write --> rite
        [/v([aeiou])/g, "b$1"], // vest --> best
        [/([^aeiou])yth/, "$1ith"], // myth --> mith
        [/gui/, "gi"], // guilty --> gilty
        [/([^s])c([ei])/, "$1s$2"], // civil --> sivil (soft "c" to "s") // NEW TEST removed opening \b
        [/ct/, "kt"], // octopus -> oktopus
        [/opt/, "apt"], // option --> aption
        [/([aeiou])b([aeiou])/, "$1v$2"], // lobe --> love
        [/([dfhjnrv])ive\b/g, "$1aiv"], // strive --> straiv, where the i is long (avoiding words with a short i)
        [/([aeiou])fu/, "$1hu"], // snafu --> snahu
        [/graph/, "gruph"], // graphite --> gruphite
        [/graph/, "greph"], // graphite --> grephite
        [/phy/g, "phi"], // biography --> biographi, physical --> phisical
        [/([^aeiou])oubl/, "$1ubl"], // double --> duble
        [/([bdfglmnhprst])\1+/, "$1"], // middle --> midle, accent --> acent
        [/([aeiou])l([aeiou])/i, "$1r$2"], // role --> rore
        [/([aeiou])r([aeiou])/, "$1l$2"], // role --> lole
        [/ee/, "ea"], // meet --> meat
        [/ea([klmnprtv])/, "ee$1"], // meat --> meet
        [/ck/, "k"], // bucket --> buket
        [/ck/, "kk"], // bucket --> bukket
        [/ie/, "ei"], // movies --> moveis
        [/ie/, "i"], // believe --> belive
        [/ay/, "ey"], // Taylor --> Teylor
        [/([aeiou])([bdfglmnprst])([aiou])\B/, "$1$2$2$3"], // celebrate --> cellebrate (doubling consonants between two vowels)
        [/([aeiou])(ck|k)/, "$1c"], // bucket --> bucet, bucket --> buccet
        [/ck/, "cc"], // bucket --> buccet
        [/ck/, "k"], // bucket --> buccet
        [/sh([aeiou])/, "sy$1"], // shut --> syut, shout --> syout
        [/ch([aeiou])/, "cy$1"], // cherry --> cyerry
        [/([aeiou])l([aeiou])/, "$1r$2"], // eloquent --> eroquent
        [/([^aeiou])er([^aeiou])/, "$1ur$2"], // alert --> alurt
        [/([^aeioj])er([^aeiou])/, "$1ar$2"], // nerd --> nard
        [/sch/g, "sk"], // school --> skool
        [/Sch/, "Sk"], // School --> Skool
        [/qu/g, "kw"], // Queen --> Kween, queen --> kween
        [/Qu/g, "Kw"], // Queen --> Kween, queen --> kween
        [/ph/i, text => isCapital(text) ? "F" : "f"], // philosophy -> filosophy (NOT global, so only first instance)
        [/([^f]|\b)f([^f]|\b)/, "$1ph$2"], // file --> phile
        [/ff/, "f"], // coffee --> cofee
        [/([^aeiou])ight/, "$1ite"], // fight --> fite
        [/([^aeiou])ight/, "$1ait"], // fight --> fite
        [/eight/, "ate"], // freight --> frate
        [/eight/, "eit"], // freight --> freit
        [/([^aeiou])ie([^aeiou]) /, "$1ei$2"], // believe --> beleive
        [/([^aeiou])ei([^aeiou]) /, "$1ie$2"], // recieve --> receive
        [/ght/, "gt"], // freight --> freigt
        [/([^aeiou])er([^aeiou])/, "$1ur$2"], // pattern --> patturn
        [/([^aeiou])ur([^aeiou])/, "$1er$2"], // turn --> tern
        [/sh([aeiou])/, "th$1"], // shift --> thift
        [/th([aeiou])/, "z$1"], // this --> zis
        [/ch/, "sh"], // cherry --> sherry
        [/oy/, "oi"], // boy --> boi
        [/oi/, "oy"], // doily --> doyly
        [/scien/, "saen"], // science --> saence
        [/scien/, "sayen"], // science --> saence
        [/rhy([^aeiou])([aeiou])/, "rai$1$2"], // rhyme --> raime
        [/rhy([^aeiou])([^aeiou])/, "ri$1$2"], // rhythm --> rithm
        [/x([^c])/, "ks$1"], // box --> boks
        [/x([^c])/, "cs$1"], // box --> bocs
        [/([aeiou])x([aeiou]|\b)/, "$1ks"], // box --> boks
        [/([aeiou])g([aeiou])/, "$1j$2"], // agent --> ajent
        [/([^aeiou])e\b/, "$1"], // horse --> hors
        [/([^aeiou])ai/, "$1ei"], // rain --> rein
        [/([^aeiou])ai/, "$1ey"], // rain --> reyn
        [/([^aeiou])[ou]([^aeiou])([^e])/, "$1a$2$3"], // robot --> robat, grunt --> grant
        [/([^aeiou]ase)/, "$1eis"], // basement --> beisment
        [/([^aeiou])ase/, "$1eys"],
        [/([aeiou])c([ei])/, "$1s$2"], // facility --> fasility
        [/([aeiou])c([aou])/, "$1k$2"], // medical --> medikal
        [/ssion/, "shun"], // mission --> mishun
        [/nc([ei])/, "ns$1"], // science --> sciense
        [/([^aeiou])([^aeiou])o([^aeiou])([^aeiou])/, "$1$2a$3$4"], // propserity --> prasperity
        [/([aeiou])cu/, "$1ku"], // executive --> exekutive
        [/prio/, "prayo"], // priority --> prayority
        [/c([^aeiouyh])/, "k$1"], // close --> klose, strict --> strikt
        [/sc([aou])/, "sk$1"], // scope --> skope
        [/([^aeiou])eut([^aeiou])/, "$1oot$2"], // neutral --> nootral
        [/tion/, "shun"], // civilization --> civilizashun
        [/tion/, "sion"], // civilization --> civilizasion
        [/tion/, "ton"], // civilization --> civilizashun
        [/([^aeious])t([ml])/, "$1$2"], // Christmas --> Chrismas
        [/wh([aei])/, "w$1"], // where --> were, which --> wich
        [/who/, "hu"], // whose --> huse
        [/ou([^aeiou])e/, "ow$1e"], // house --> howse
        [/cqu/, "qu"], // acquit --> aquit
        [/sce/, "se"], // abscense --> absense
        [/([aeiou])dge/, "$1ge"], // acknowledge --> acknowlege
        [/([aeiou])ge/, "$1dge"], // privelege --> priveledge
        [/([^aeiou])ian/, "$1an"], // allegiance --> alegance
        [/tious/, "cious"], // conscientious --> consciencious
        [/iar/, "er"], // plagiarize --> plagerize
        [/mn/, "m"], // column --> colum
        [/([^aeiou])ond/, "$1and"], //
        [/aur/, "or"], // restaurant --> restorant
        [/aur/, "ar"], // restaurant --> restarant
        [/chn/, "kn"], // technical --> teknical
        [/for/, "four"], // foreigner --> foureigner
        [/than/, "then"], // than --> then
        [/then/, "than"], // then --> than
        [/cr/, "kr"], // democracy --> demokracy
        [/([^f])ew(e?)/, "$1oo"], // jewel --> jool
        [/itu/, "ichu"], // expenditure --> expendichure
        [/[^aeiou]ite/, "ait"], // polite --> polait
        [/([aeiou])nge/, "$1nje"], // binge --> binje
        [/([^aeiou])gine/, "$1jine"], // engine --> enjine
        [/([^qk])uit(\b|[^e])/, "$1oot$2"], // suits --> soots, fruit --> froot
        [/([^qk])uit(\b|[^e])/, "$1ute$2"], // suits --> sutes, fruit --> frute
        [/([^aeiou])ough\b/, "$1off"], //
        [/([dglmnpr])ge/, "je"], // large --> larje
        [/([^aeioud])u([^aeiou])([aiouy])/, "$1oo$2$3"], // truly -->trooly
        [/([aeiou])cc([ei])/, "$1ks$2"], // accident --> aksident
        [/([aeiou])cc([ei])/, "$1cs$2"], // accident --> acsident
        [/ous([^aeiou]|\b)/, "as$1"], // obvious --> obvias
        [/ous([^aeiou]|\b)/, "us$1"], // obvious --> obvius
        [/tch/, "ch"], // itchy --> ichy
        [/\bk([^n])/, "c$1"], // kitchen --> citchen
        [/\bc([^eih])/, "k$1"], // color --> kolor
        [/ould/, "ood"], // would --> wood, could --> cood
        [/([^aeiouyw])se/, "$1ce"], // consensus --> concensus
        [/par([aeiouy])/, "per$1"], // separate --> seperate
        [/([^aeiouy])ese/, "$1ees"], // Japanese --> Japanees
        [/([^aeiouy])ese/, "$1eze"], // Japanese --> Japaneze
        [/([aeiou])([aeiou])/, "$2$1"], // reversing any two consecutive vowels
        [/al([^aeioul])/, "all$1"], // almost --> allmost
        [/x([hc])/, "x"], // exhale --> exale, excellent --> exellent
        [/ltur/, "lchur"], // cultural --> culchural
        [/([aeiou])du/, "$1ju"], // individual --> indivijual
        [/aze/, "ayze"], // gaze --> gayze
        [/aze/, "ayz"], // gaze --> gayz
        [/([^aeiou])ose\b/, "$1owse"], // hose --> howse
        [/([^aeiou])ok/, "$1ork"], //　world -->
        [/([aeiou])sd/, "$1zd"], //
        [/ime/, "aim"], // time --> taim
        [/wr/, "r"], // playwrite --> playrite
        [/([aeiou])cy/, "$1sy"], // prophecy --> prophesy
        [/fth/, "th"], // fifth --> fith
        [/([^aeiou])oar/, "$1ore"], // boar --> bore
        [/use/, "uce"], // use --> uce
        [/([^c])ture/, "$1chure"], // mature --> machure, lecture --> lecchure
        [/mpt/, "mt"], // symptom --> symtom
        [/f([aeiou])/, "h$1"], // knife --> knihu
        // [/ /, ""], //
        // [/ /, ""], //
        // [/ /, ""], //
        // [/ /, ""], //
        //
        //
        //
        //
        //
        // endings
        //
        [/([aeiou])sm\b/, "$1zm"], // tourism --> tourizm
        [/pt\b/, "t"], // tempt --> temt
        [/([aeiou])b\b/, "$1vu"], // cab --> cavu
        [/([^aeiou])ies\b/g, "$1yes"], // bodies --> bodyes
        [/([^aeiou])ies\b/g, "$1ys"], // bodies --> bodys
        [/([^aeiou])ies\b /, "$1eys"], // babies --> babeys
        [/([^aeiou])ar\b/, "$1er"], // grammar --> grammer
        [/([^aeiou])ize\b/g, "$1aiz"], // prize --> praiz
        [/([^aeiou])ize\b/g, "$1ise"], // prize --> praiz
        [/ise\b/g, "ize"], // prize --> praiz
        [/ies\b/, "ys"], // bodies => bodys
        // [/t\b/, "to"], // best --> besto
        [/st\b/, "suto"], // best --> besuto
        [/st\b/, "sto"], // best --> besuto
        [/sk\b/, "suku"], // best --> besuto
        [/([^aeiou])ire\b/, "$1air"], // entire --> entair
        [/([^aeiou])ire\b/g, "$1yre"], // entire --> entyre
        [/cal\b/, "kul"], // clinical --> clinikul
        [/cal\b/, "cle"], // clinical --> clinicle
        [/le\b/i, "el"], // little --> littel
        [/ful\b/, "full"], // joyful --> joyfull
        [/ade\b/, "eid"], // lemonade --> lemoneid
        [/([^aeiou])ate\b/g, "$1eit"], // hate --> heit
        [/ate\b/, "ayt"], // candidate --> candidayt
        [/ate\b/, "ait"], // candidate --> candidait
        [/ate\b/, "eit"], // candidate --> candideit
        [/tial\b/, "shal"], // initial --> inishal
        [/tial\b/, "shul"], // initial --> inishul
        [/([^aeiou])are\b/, "$1air"], // welfare --> welfair
        [/([aeiou])([^aeiou])e\b/, "$1$2"], // quite --> quit (remove "e" at end of word after VC)
        [/([^aeiou])ent\b/, "$1ant"], // silent --> silant
        [/([^aeiou])ant\b/, "$1ent"], // vigilant --> vigilent
        [/([^aeiou])ite\b/, "$1ait"], // spite --> spait
        [/([^g])(ue|oe)\b/, "$1oo"], // blue --> bloo, shoe -> shoo
        [/([^aeiouh])ey\b/, "$1y"], // monkey --> monky
        [/nce\b/, "nse"], // science --> sciense
        [/([^\b])oo/, "$1u"], // school --> skul
        [/der\b/, "dur"], // murder --> murdur
        [/([^aeiou])el\b/, "$1le"], // baggel --> baggle
        [/([^aeiou])or\b/, "$1ur"], // color --> colur
        [/([^aeiou])or\b/, "$1our"], // color --> colour
        [/([^aeiou])our\b/, "$1ur"], // color --> colour
        [/([^aeiou])ain\b/, "$1ane"], // maintain --> maintane
        [/([^aeiou])ain\b/, "$1en"], // certain --> certen
        [/quer\b/, "ker"], // conquer --> conker
        [/acy\b/, "asy"], // democracy --> democrasy
        [/asm\b/, "azm"], // orgasm --> orgazm
        [/ice\b/, "is"], // police --> polis
        [/([^aeiou])eme\b/, "eem"],
        [/ute\b/, "oot"], // flute
        [/ete\b/, "eet"], // compete --> compeet
        [/mb\b/, "m"], // climb --> clim
        [/([^aeiou])y\b/, "$1ee"], // daily --> dailee
        [/([^l])ow\b/, "$1ou"], // cow --> cou
        [/([^aeiou])use\b/, "$1yuse"], // refuse --> refyuse
        [/ment\b/, "mint"], // department --> departmint
        [/ment\b/, "mant"], // department --> departmant
        [/([^aeiou])er\b/, "$1ur"], // refer --> refur
        [/([^aeiou])([^aeioug])ine\b/, "$1$2ain"], // deadline --> deadlain (NOTE *NOT* engine)
        [/([aeiou])([^aeiou])ine\b/, "$1$2een"], // trampoline --> trampoleen
        [/([aeiou])([^aeiou])ies\b/, "$1$2ys"], // babies --> babys
        [/([aeiou])([^aeiou])ies\b/, "$1$2yes"], // babies --> babyes
        [/([^aeiou])al\b/, "$1ol"], // capital --> capitol
        [/([^aeiou])ol\b/, "$1al"], // capitol --> capital
        [/ary\b/, "ery"], // salary --> salery
        [/([^aeiou])ery\b/, "$1ary"], // celery --> celary
        [/ede\b/, "eed"], // concede --> conceed
        [/([aeiou])([^aeiou])o\b/, "$1$2oe"], // potato --> potatoe
        [/ence\b/, "ance"], // permanence --> permanance
        [/ance\b/, "ence"], // perseverance --> perseverence
        [/([aeiou])sion/, "$1tion"], // tension --> tention
        [/([^aeiou])ere\b/, "$1eir"], // there --> their
        [/([^aeiou])eir\b/, "$1ere"], // their --> there
        [/([^aeiou])aste\b/, "$1aist"], // paste --> paist
        [/([^aeiou])aste\b/, "$1eist"], // paste --> peist
        [/([aeiou])sing\b/, "$1zing"], // rising --> rizing
        [/([^aeiou][^aeiou])er\b/, "$1r"], // lumber --> lumbr
        [/ool\b/, "oul"], // cool --> coul
        [/([aeiou])c\b/, "$1k"], // traffic --> traffik
        [/([aeiou])c\b/, "$1ck"], // traffic --> traffick
        [/([^aeiou])on\b/, "$1an"], // person --> persan
        [/ise(d?)\b/, "ize$1"], // despise --> despize
        [/ise(d?)\b/, "aiz$1"], // despised --> despized
        [/ought(s?)/, "awt$1"], // thought --> thawt
        [/gh/, "g"], // eight --> eigt
        [/gh/, "h"], // eight --> eiht
        [/gho/, "go"], // ghost --> gost
        [/([^aeiou])eir\b/, "$1air"], // their --> thair
        [/([^aeiou])ible\b/, "$1able"], // impossible --> impossable
        [/([^aeiou])able\b/, "$1ible"], // probable --> probible
        [/cly\b/, "cally"], // publicly --> publically
        [/ally\b/, "ly"], // incidentally --> incidently
        [/([iu])l\b/, "$1ll"], // until --> untill
        [/([aeiou][^aeiouyw])\b/, "$1e"], // color --> colore
        [/age\b/, "ege"], // village --> villege
        [/([^aeiou])ed\b/, "$1d"], // learned --> learnd
        [/air\b/, "er"], // chair --> cher
        [/row\b/, "roe"], // arrow --> arroe
        [/([^aeiou]|\b)ice\b/, "$1ais"], // nice --> nais
        [/([^aiu]|\b)ice\b/, "$1ise"], // nice --> nise, voice --> voise, neice --> neise
        [/([^aeiou])ery\b/, "$1ary"], // boundary --> boundery
        [/ary\b/, "ery"], // dictionary --> dictionery
        [/mb\b/, "m"], // climb -->clim, bomb --> bom
        // [/ /, ""], //
        // [/ /, ""], //
        // [/ /, ""], //
        // [/ /, ""], //
        // [/ /, ""], //
    ];


    /*
    Catch-all replacements, used for words where few other changes work
    These are pretty obvious changes, to be used as a last resort
    */

    const beginnersPatterns = [
        [/r/, "l"], // simply repacing (the first) r with l
        [/R/, "L"], // simply repacing (the first) R with L
        [/l/, "r"], // simply repacing (the first) l with r
        [/L/, "R"], // simply repacing (the first) R with L
        [/b/, "d"],
        [/b/, "p"],
        [/n/, "m"],
        [/N/, "M"],
        [/a/g, "o"],
        [/a/g, "u"],
        [/e/g, "i"],
        [/i/g, "e"],
        [/i/g, "ii"],
        [/o/g, "a"],
        [/u/g, "a"],
        [/^\w{0,4}$/, word => word.split("").reverse().join("")], // cat --> tac, book --> koob
        [/f/, "v"], // knife --> knive
        [/v/, "f"], // knives --> knife
        // [//, "l"], //
        // [//, "l"], //
        // [//, "l"], //
        // [//, "l"], //
    ];


    this.getAllFor = (word, obj = {}) => {

        const minNumber = obj.minNumber ?? 3;

        let misspellingsArray = [];

        // first trying the expertPatterns
        generateMisspellings(word, expertPatterns, misspellingsArray);

        // second, filling in extras from the beginnersPatterns
        if (misspellingsArray.length < minNumber) {
            const numToGet = minNumber - misspellingsArray.length;
            generateMisspellings(word, beginnersPatterns, misspellingsArray, numToGet);
        }

        while (misspellingsArray.length < minNumber) misspellingsArray.push(pickOneFrom(["banana", "Hyuga", "verynice"], true));

        return shuffle(misspellingsArray);
    }


    // private
    function generateMisspellings(word, patternsArray, targetArray, numToGet = 999) {

        // console.clear();

        let counter = 0;

        shuffle(patternsArray).forEach(pattern => {

            const regExp = pattern[0];
            const replaceWith = pattern[1];
            const misspelledWord = word.replace(regExp, replaceWith);

            if (counter >= numToGet) return;

            if (isProperlyMisspelled(misspelledWord, word, targetArray)) {
                targetArray.push(misspelledWord);
                // console.log(`${word} -> ${regExp} -> ${replaceWith} -> ${misspelledWord} ${numToGet, counter}`);
                counter++;
            }
        });

        function isProperlyMisspelled(misspelledWord, word, targetArray) {
            return misspelledWord !== word && !targetArray.includes(misspelledWord);　// && !words_list[misspelledWord];
        }
    }

    // log(this.getAllFor("know"));

    this.getOneFor = word => this.getAllFor(word)[0];

    this.getNumberOfMisspellings = (obj = {}) => whittle(getAllFor(obj.word, obj.other), obj.number);
}


export { Misspeller };
