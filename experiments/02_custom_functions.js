// Here, you can define all custom functions, you want to use and initialize some variables

/* Variables
*
*
*/
 // You can determine global (random) parameters here
// Declare your variables here



/* Helper functions
*
*
*/


/* For generating random participant IDs */
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// dec2hex :: Integer -> String
const dec2hex = function(dec) {
    return ("0" + dec.toString(16)).substr(-2);
};
// generateId :: Integer -> String
const generateID = function(len) {
    let arr = new Uint8Array((len || 40) /2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, this.dec2hex).join("");
};
// Declare your helper functions here

const key_press_sc = function(config, CT) {
    return `<div class="magpie-view">
                <h1 class='magpie-view-title'>${config.title}</h1>
                <p class='magpie-view-question magpie-view-qud'>${config.data[CT].QUD}</p>
                <p class='magpie-response-keypress-header hidden'>
                <strong>${config.data[CT].key1}</strong> = ${config.data[CT][config.data[CT].key1]},
                <strong>${config.data[CT].key2}</strong> = ${config.data[CT][config.data[CT].key2]}</p>
                <div class='question-container'>
                    <div class='magpie-view-stimulus magpie-nodisplay'></div>
                </div>
                <p class='sentence_container'></p>
                <p class='magpie-response-keypress-header'></p>
            </div>`;
}

const question = function(config, CT) {
    return `<div class='magpie-view-answer-container'>
                    <p class='magpie-view-question'>${config.data[CT].question}</p>`;
}

const createWordList = function(wordList, counter, sentence) {
    // creates the sentence
    sentence.map((word) => {
        $(".sentence_container").append(
            `<span class='word hidden'>${word}</span>`,
            `<span id='line${counter}'>___</span>`
        );
        counter++;
    });
 
    // creates an array of spr word elements
    return wordList = $(".word").toArray();
}

const key_press_hrf = function (config, CT, magpie, answer_container_generator, startingTime) {
    const sentence1 = config.data[CT].sentence_knowledge.trim().split(" ");
    const sentence2 = config.data[CT].sentence_trigger.trim().split(" ");
    const sentence3 = config.data[CT].sentence_continuation.trim().split(" ");
    let spaceCounter = 0;
    let wordList = [];
    let readingTimes_knowledge = [];
    let readingTimes_trigger = [];
    let readingTimes_continuation = [];
    let counter = 0;
    let bool_knowledge = false;
    let bool_trigger = false;
    let bool_continuation = false;
    let bool_show_sentence = false;
    let bool_question = false;
    // wordPos "next" or "same", if "next" words appear next to each other, if "same" all words appear at the same place
    // default: "next"
    let wordPos = config.data[CT].wordPos === undefined ? "next" : config.data[CT].wordPos;
    let showNeighbor = wordPos === "next";

    let sentence = sentence1;
    if (showNeighbor && wordList.length === 0 && bool_knowledge === false) {
        wordList = createWordList(wordList, counter, sentence);
    }
    document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
    bool_show_sentence = true;

    const handleKeyPress = function(e) {
        if (e.which === 32 && bool_knowledge === false) {


            if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_knowledge.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_knowledge = true;
                    bool_show_sentence = false;
                    $(".sentence_container").html("");
                } else {
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger === false) {

            let sentence = sentence2;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_trigger.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_trigger = true;
                    bool_show_sentence = false;
                    $(".sentence_container").html("");
                } else {
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger && bool_continuation === false && sentence3.length !== 0) {

            let sentence = sentence3;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger && bool_continuation === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_continuation.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    // spaceCounter = 0;
                    bool_continuation = true;
                    bool_show_sentence = false;
                } else {
                    $(".sentence_container").html("");
                }
            }

            if (e.which === 32 && spaceCounter === sentence3.length && bool_knowledge && bool_trigger && bool_continuation) {
                $(".question-container").append(answer_container_generator(config, CT));
                $(".magpie-response-keypress-header").removeClass("hidden");
                bool_question = true;
            }
        } else if(e.which === 78 && bool_question || e.which === 89 && bool_question) {
            const keyPressed = String.fromCharCode(
                e.which
            ).toUpperCase();

            if (keyPressed === config.data[CT].key1 || keyPressed === config.data[CT].key2) {
                let correctness;
                const RT = Date.now() - startingTime; // measure RT before anything else

                if (
                    config.data[CT].expected ===
                    config.data[CT][keyPressed.toUpperCase()]
                ) {
                    correctness = "correct";
                } else {
                    correctness = "incorrect";
                }

                let reactionTimes_knowledge = readingTimes_knowledge
                    .reduce((result, current, idx) => {
                        return result.concat(
                            readingTimes_knowledge[idx + 1] - readingTimes_knowledge[idx]
                        );
                    }, [])
                    .filter((item) => isNaN(item) === false);
                let reactionTimes_trigger = readingTimes_trigger
                    .reduce((result, current, idx) => {
                        return result.concat(
                            readingTimes_trigger[idx + 1] - readingTimes_trigger[idx]
                        );
                    }, [])
                    .filter((item) => isNaN(item) === false);
                let reactionTimes_continuation = readingTimes_continuation
                    .reduce((result, current, idx) => {
                        return result.concat(
                            readingTimes_continuation[idx + 1] - readingTimes_continuation[idx]
                        );
                    }, [])
                    .filter((item) => isNaN(item) === false);
                

                let trial_data = {
                    trial_name: config.name,
                    trial_number: CT + 1,
                    key_pressed: keyPressed,
                    correctness: correctness,
                    RT_keyPress: RT,
                    condition: config.data[CT].condition,
                    reactionTimes_knowledge: reactionTimes_knowledge,
                    reactionTimes_trigger: reactionTimes_trigger,
                    reactionTimes_continuation: reactionTimes_continuation
                };

                trial_data[config.data[CT].key1] =
                    config.data[CT][config.data[CT].key1];
                trial_data[config.data[CT].key2] =
                    config.data[CT][config.data[CT].key2];

                trial_data = magpieUtils.view.save_config_trial_data(config.data[CT], trial_data);
                bool_question = false;

                magpie.trial_data.push(trial_data);
                $("body").off("keydown", handleKeyPress);
                magpie.findNextView();
            }
        }
    };

    $("body").on("keydown", handleKeyPress);
}

const key_press_practice_sc = function(config, CT) {
    return `<div class="magpie-view">
                <h1 class='magpie-view-title'>${config.data[CT].title}</h1>
                <p class='magpie-view-question magpie-view-qud'>${config.data[CT].QUD}</p>
                <p class='description' > At first you will get some practice trials now. 
                After answering the comprehension question you will therefor get feedback. <br />
                <br />
                Press Space to begin.</p>
                <p class='magpie-response-keypress-header hidden'>
                <strong>${config.data[CT].key1}</strong> = ${config.data[CT][config.data[CT].key1]},
                <strong>${config.data[CT].key2}</strong> = ${config.data[CT][config.data[CT].key2]}</p>
                <div class='question-container'>
                    <div class='magpie-view-stimulus magpie-nodisplay'></div>
                </div>
                <p class='sentence_container'></p>
                <p class='magpie-response-keypress-header'></p>
            </div>`;
}

const key_press_practice_hrf = function (config, CT, magpie, answer_container_generator, startingTime) {
    const sentence1 = config.data[CT].sentence_knowledge.trim().split(" ");
    const sentence2 = config.data[CT].sentence_trigger.trim().split(" ");
    const sentence3 = config.data[CT].sentence_continuation.trim().split(" ");
    let spaceCounter = 0;
    let wordList = [];
    let readingTimes_knowledge = [];
    let readingTimes_trigger = [];
    let readingTimes_continuation = [];
    let counter = 0;
    let bool_knowledge = false;
    let bool_trigger = false;
    let bool_continuation = false;
    let bool_show_sentence = false;
    let bool_question = false;
    // wordPos "next" or "same", if "next" words appear next to each other, if "same" all words appear at the same place
    // default: "next"
    let wordPos = config.data[CT].wordPos === undefined ? "next" : config.data[CT].wordPos;
    let showNeighbor = wordPos === "next";

    let sentence = sentence1;
    if (showNeighbor && wordList.length === 0 && bool_knowledge === false) {
        wordList = createWordList(wordList, counter, sentence);
    }
    document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
    bool_show_sentence = true;

    const handleKeyPress = function(e) {
        $(".description").addClass("hidden");
        if (e.which === 32 && bool_knowledge === false) {


            if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_knowledge.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_knowledge = true;
                    bool_show_sentence = false;
                    $(".sentence_container").html("");
                } else {
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger === false) {

            let sentence = sentence2;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_trigger.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_trigger = true;
                    bool_show_sentence = false;
                    $(".sentence_container").html("");
                } else {
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger && bool_continuation === false && sentence3.length !== 0) {

            let sentence = sentence3;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger && bool_continuation === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
 
                readingTimes_continuation.push(Date.now());
                spaceCounter++;
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    // spaceCounter = 0;
                    bool_continuation = true;
                    bool_show_sentence = false;
                } else {
                    $(".sentence_container").html("");
                }
            }

            if (e.which === 32 && spaceCounter === sentence3.length && bool_knowledge && bool_trigger && bool_continuation) {
                $(".question-container").append(answer_container_generator(config, CT));
                $(".magpie-response-keypress-header").removeClass("hidden");
                bool_question = true;
            }
        } else if(e.which === 78 && bool_question || e.which === 89 && bool_question) {
            const keyPressed = String.fromCharCode(
                e.which
            ).toUpperCase();

            if (keyPressed === config.data[CT].key1 || keyPressed === config.data[CT].key2) {
                let correctness;
                const RT = Date.now() - startingTime; // measure RT before anything else

                if (
                    config.data[CT].expected ===
                    config.data[CT][keyPressed.toUpperCase()]
                ) {
                    correctness = "correct";
                } else {
                    correctness = "incorrect";
                }

                if (correctness === "correct") {
                    alert('Your answer is correct! Yey!');
                } else if (correctness === "incorrect"){
                    alert('Sorry, this answer is incorrect :( The correct answer was ' + config.data[CT].expected);
                }
                
                $("body").off("keydown", handleKeyPress);
                magpie.findNextView();
            }
        }
    };

    $("body").on("keydown", handleKeyPress);
}

/* Hooks  
*
*
*/

// Error feedback if participants exceeds the time for responding
const time_limit = function(data, next) {
    if (typeof window.timeout === 'undefined'){
        window.timeout = [];
    }
    // Add timeouts to the timeoutarray
    // Reminds the participant to respond after 5 seconds
    window.timeout.push(setTimeout(function(){
          $('#reminder').text('Please answer more quickly!');
    }, 5000));
    next();
};

// compares the chosen answer to the value of `option1`
check_response = function(data, next) {
    $('input[name=answer]').on('change', function(e) {
        if (e.target.value === data.correct) {
            alert('Your answer is correct! Yey!');
        } else {
            alert('Sorry, this answer is incorrect :( The correct answer was ' + data.correct);
        }
        next();
    })
}

// Declare your hooks here


/* Generators for custom view templates, answer container elements and enable response functions
*
*
*/
