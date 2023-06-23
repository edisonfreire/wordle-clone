// creates array of letters
const letters = document.querySelectorAll(".letter");
const loadingDiv = document.querySelector(".loading");

const ANSWER_LENGTH = 5;
const ROUNDS = 6; // current guess starts at 0


function isLetter(letter) {
    // regex to check letter
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading (isLoading) {
    // show the spinning spiral when its loading
    loadingDiv.classList.toggle("show", isLoading)
}

// keeps track of letter frequency in word
function makeMap (array) {
    const obj = {};
    for (let i=0; i<array.length; i++){
        const letter = array[i];
        // if it exists will return true if not false
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

async function init() {
    let currentGuess = "";
    let currentRow = 0;
    let isLoading = true;
    const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const processedResponse = await response.json()
    const word = processedResponse.word.toUpperCase();
    const wordArray = word.split("");
    let done = false;

    setLoading(false);
    isLoading = false;

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            // add letter to guess
            currentGuess += letter;
        } else {
            // replaces the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter; 
        }
        // 5 letters each row times row number to get correct starting position for word and currentGuess.length-1 to get position of word at the typed letter
        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing if guess is not 5 char long
            return;
        }

        isLoading = true;
        setLoading(true);
        const response = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({"word": currentGuess})
        });
        const processedResponse = await response.json();
        const validWord = processedResponse.validWord;

        setLoading(false);
        isLoading = false;
        // if word is not valid
        if (!validWord) {
            markInvalidWord();
            return;
        }

        // validate word
        const guessArray = currentGuess.split("");
        const map = makeMap(wordArray);

        // checks if its correct
        for (let i=0; i < ANSWER_LENGTH; i++) {
            if (guessArray[i] === wordArray[i]) {
                letters[currentRow*ANSWER_LENGTH+i].classList.add("correct");
                // removes letter from frequency if they are correct
                map[guessArray[i]]--;
            }
        }



        // checks if incorrect or close
        for (let i=0; i < ANSWER_LENGTH; i++) {
            if (guessArray[i] === wordArray[i]) {
                // do nothing, already did
            } else if (wordArray.includes(guessArray[i]) && map[guessArray[i]] > 0) {
                // if wordArray includes it and if hasnt been selected already
                letters[currentRow*ANSWER_LENGTH+i].classList.add("close");
                map[guessArray[i]]--;
            } else {
                letters[currentRow*ANSWER_LENGTH+i].classList.add("wrong");
            }
        }
        
        currentRow++;
        // Win and lose condition
        if (currentGuess === word) {
            document.querySelector('.brand').classList.add("rainbow");
            done = true;
        } else if (currentRow === ROUNDS) {
            alert(`You lose, the word was ${word}`);
            done = true;
        }

        currentGuess = "";
    }
    

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        for (let i=0; i<ANSWER_LENGTH; i++ ){
            letters[currentRow*ANSWER_LENGTH+i].classList.remove("invalid");

            setTimeout(function () {
                letters[currentRow*ANSWER_LENGTH+i].classList.add("invalid");
            }, 10);
        }
    }

    document.addEventListener("keydown", function handleKeyPress(event) {
        const action = event.key;

        if (done || isLoading) {
            // do nothing
        } else if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
             addLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });
}

init();