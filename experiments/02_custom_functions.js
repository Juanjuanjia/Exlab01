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

// The stimulus container for the main trials which includes things that are generally visible in the view and only occasionally hidden
const key_press_sc = function(config, CT) {
    return `<div class="magpie-view">
                <h1 class='magpie-view-title'>Main Experiment</h1>
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

// Answer container for the main trial which adds the question to the view
const question = function(config, CT) {
    return `<div class='magpie-view-answer-container'>
                    <p class='magpie-view-question'>${config.data[CT].question}</p>`;
}

// Function to create the wordList used to display the sentences word by word
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

// Handle Response Function for the main trials
const key_press_hrf = function (config, CT, magpie, answer_container_generator, startingTime) {
    // turns the sentences provided via the views file into arrays
    const sentence1 = config.data[CT].sentence_knowledge.trim().split(" ");
    const sentence2 = config.data[CT].sentence_trigger.trim().split(" ");
    const sentence3 = config.data[CT].sentence_continuation.trim().split(" ");
    //  Counts how much words were already displayed 
    let spaceCounter = 0;
    // later set via the createWordList function
    let wordList = [];
    let readingTimes_knowledge = [];
    let readingTimes_trigger = [];
    let readingTimes_continuation = [];
    //  counter used to determine the number of dashes in createWordList
    let counter = 0;
    //  booleans to determine which sentences were already shown
    let bool_knowledge = false;
    let bool_trigger = false;
    let bool_continuation = false;
    let bool_show_sentence = false;
    let bool_question = false;
    // wordPos "next" or "same", if "next" words appear next to each other, if "same" all words appear at the same place
    // default: "next"
    let wordPos = config.data[CT].wordPos === undefined ? "next" : config.data[CT].wordPos;
    let showNeighbor = wordPos === "next";

    // creates the first sentence and shows its dashes
    let sentence = sentence1;
    if (showNeighbor && wordList.length === 0 && bool_knowledge === false) {
        wordList = createWordList(wordList, counter, sentence);
    }
    document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
    bool_show_sentence = true;

    //  function dealing with the keypresses
    const handleKeyPress = function(e) {
        // if space is pressed and the knowledge sentence not yet shown completely
        if (e.which === 32 && bool_knowledge === false) {
            // if space was pressed and the spaceCounter is not at the end of the current sentence but the dashes of the sentence are shown
            if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                // save the readingtime for the current word and count to the next word
                readingTimes_knowledge.push(Date.now());
                spaceCounter++;
            // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    readingTimes_knowledge.push(Date.now());
                    wordList = [];
                    spaceCounter = 0;
                    bool_knowledge = true;
                    bool_show_sentence = false;
                    // lastly clear the sentence container
                    $(".sentence_container").html("");
                } else {
                 // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }
        // if knowledge sentence was shown but trigger not
        } else if (e.which === 32 && bool_knowledge && bool_trigger === false) {
            // creates the second sentence
            let sentence = sentence2;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
 	          // shows the dashes of the sentence
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            // if space was pressed and the spaceCounter is not at the end of the current sentence but the dashes of the sentence are shown 
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                // save the readingtime for the current word and count to the next word
                readingTimes_trigger.push(Date.now());
                spaceCounter++;
             // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    readingTimes_trigger.push(Date.now());
                    wordList = [];
                    spaceCounter = 0;
                    bool_trigger = true;
                    bool_show_sentence = false;
                    // lastly clear the sentence container
                    $(".sentence_container").html("");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }
         // if the knowledge and trigger sentence were shown, show the continuation sentence until it is completely shown
        } else if (e.which === 32 && bool_knowledge && bool_trigger && bool_continuation === false && sentence3.length !== 0) {
            // creates the third sentence
            let sentence = sentence3;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger && bool_continuation === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            // shows the dashes of the sentence
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                // save the readingtime for the current word and count to the next word
                readingTimes_continuation.push(Date.now());
                spaceCounter++;
             // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    readingTimes_continuation.push(Date.now());
                    wordList = [];
                    bool_continuation = true;
                    bool_show_sentence = false;
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }
            
            // when all sentences where displayed hidde the sentence section and show the yes-or-no comprehension question and its short explanation
            if (e.which === 32 && spaceCounter === sentence3.length && bool_knowledge && bool_trigger && bool_continuation) {
                $(".magpie-view-question").addClass("hidden");
                $(".question-container").append(answer_container_generator(config, CT));
                $(".magpie-response-keypress-header").removeClass("hidden");
                bool_question = true;
            }
        // if the question is displayed and Y or N is pressed      
        } else if(e.which === 78 && bool_question || e.which === 89 && bool_question) {
 	          // get info which key was pressed
            const keyPressed = String.fromCharCode(
                e.which
            ).toUpperCase();
            // look if the answer was correct and save the reaction time of the key press
            if (keyPressed === config.data[CT].key1 || keyPressed === config.data[CT].key2) {
                let correctness;
                const RT = Date.now() - startingTime; // measure RT before anything else

                if (
                    config.data[CT].expected ===
                    keyPressed
                ) {
                    correctness = "correct";
                } else {
                    correctness = "incorrect";
                }

                // adapt the dates that were saved for the word reaction times of the sentences to actual reaction times
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
                
                // decide what to save for the CSV
                let trial_data = {
                    trial_name: config.name,
                    trial_number: CT + 1,
                    key_pressed: keyPressed,
                    correctness: correctness,
                    RT_keyPress: RT,
                    condition: config.data[CT].condition,
                    reactionTimes_knowledge: reactionTimes_knowledge,
                    reactionTimes_trigger: reactionTimes_trigger,
                    reactionTimes_continuation: reactionTimes_continuation,
                    group: config.group
                };

                trial_data[config.data[CT].key1] =
                    config.data[CT][config.data[CT].key1];
                trial_data[config.data[CT].key2] =
                    config.data[CT][config.data[CT].key2];
             
                // save all the data from the experiment, reaction times, names, keyspressed, etc
                trial_data = magpieUtils.view.save_config_trial_data(config.data[CT], trial_data);
                bool_question = false;
             
                // push the trial data and go to the next view
                magpie.trial_data.push(trial_data);
                $("body").off("keydown", handleKeyPress);
                magpie.findNextView();
            }
        }
    };

    $("body").on("keydown", handleKeyPress);
}


// The stimulus container for the practice trials which includes things that are generally visible in the view and only occasionally hidden
const key_press_practice_sc = function(config, CT) {
    return `<div class="magpie-view">
                <h1 class='magpie-view-title'>${config.data[CT].title}</h1>
                <p class='magpie-view-question magpie-view-qud'>${config.data[CT].QUD}</p>
                <p class='description' > At first you will get some practice trials. 
                After answering the comprehension question you will get feedback. <br />
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

// Handle Response Function for the practice trials, which functions in the same way as the main trials handle response function but doesn't submit the data
const key_press_practice_hrf = function (config, CT, magpie, answer_container_generator, startingTime) {
    // turns the sentences provided via the views file into arrays
    const sentence1 = config.data[CT].sentence_knowledge.trim().split(" ");
    const sentence2 = config.data[CT].sentence_trigger.trim().split(" ");
    const sentence3 = config.data[CT].sentence_continuation.trim().split(" ");
    //  Counts how much words were already displayed 
    let spaceCounter = 0;
    let wordList = [];
    //  booleans to determine which sentences were already shown
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

    // creates the first sentence and shows its dashes
    let sentence = sentence1;
    if (showNeighbor && wordList.length === 0 && bool_knowledge === false) {
        wordList = createWordList(wordList, counter, sentence);
    }
    document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
    bool_show_sentence = true;
 
    //  function dealing with the keypresses
    const handleKeyPress = function(e) {
        $(".description").addClass("hidden");
        // if space is pressed and the knowledge sentence not yet shown completely
        if (e.which === 32 && bool_knowledge === false) {
           // if space was pressed and the spaceCounter is not at the end of the current sentence but the dashes of the sentence are shown
            if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                spaceCounter++;
             // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_knowledge = true;
                    bool_show_sentence = false;
                    // lastly clear the sentence container
                    $(".sentence_container").html("");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger === false) {
            // creates the second sentence
            let sentence = sentence2;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            // shows the dashes of the sentence
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
             // if space was pressed and the spaceCounter is not at the end of the current sentence but the dashes of the sentence are shown
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                spaceCounter++;
             // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    spaceCounter = 0;
                    bool_trigger = true;
                    bool_show_sentence = false;
                    // lastly clear the sentence container
                    $(".sentence_container").html("");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }
        } else if (e.which === 32 && bool_knowledge && bool_trigger && bool_continuation === false && sentence3.length !== 0) {
            // creates the third sentence
            let sentence = sentence3;
            if (showNeighbor && wordList.length === 0 && bool_knowledge && bool_trigger && bool_continuation === false) {
                wordList = createWordList(wordList, counter, sentence);
            }
            // shows the dashes of the sentence
            if (bool_show_sentence === false) {
                document.getElementById(`line${spaceCounter}`).classList.remove("hidden");
                bool_show_sentence = true;
             // if space was pressed and the spaceCounter is not at the end of the current sentence but the dashes of the sentence are shown
            } else if (e.which === 32 && spaceCounter < sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // show the next word
                    wordList[spaceCounter].classList.remove("hidden");
                    document.getElementById(`line${spaceCounter}`).classList.add("hidden");
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html(`<span class='word'>${sentence[spaceCounter]}</span>`);
                    if (not_underline){
                        $('.sentence_container .spr-word').addClass('no-line');
                    }
                }
                // if the first word was already shown removes it when showing the next
                if (spaceCounter > 0 && showNeighbor) {
                    wordList[spaceCounter - 1].classList.add("hidden");
                }
                
                spaceCounter++;
             // if space is pressed and we are at the end of the sentence
            } else if (e.which === 32 && spaceCounter === sentence.length && bool_show_sentence) {
                if (showNeighbor) {
                    // hide the last word, push the last reading time, empty wordList, set back spaceCounter and set bool that sentence was shown
                    wordList[spaceCounter - 1].classList.add("hidden");
                    wordList = [];
                    bool_continuation = true;
                    bool_show_sentence = false;
                } else {
                    // only used if sentences are included which shouldn't be presented word by word
                    $(".sentence_container").html("");
                }
            }

            // when all sentences where displayed hidde the sentence section and show the yes-or-no comprehension question and its short explanation
            if (e.which === 32 && spaceCounter === sentence3.length && bool_knowledge && bool_trigger && bool_continuation) {
                $(".magpie-view-question").addClass("hidden");
                $(".question-container").append(answer_container_generator(config, CT));
                $(".magpie-response-keypress-header").removeClass("hidden");
                bool_question = true;
            }
        // if the question is displayed and Y or N is pressed  
        } else if(e.which === 78 && bool_question || e.which === 89 && bool_question) {
            // get info which key was pressed
            const keyPressed = String.fromCharCode(
                e.which
            ).toUpperCase();

            // look for the correctness of the keypress and inform the participant about it
            if (keyPressed === config.data[CT].key1 || keyPressed === config.data[CT].key2) {
                let correctness;
                
                if (
                    config.data[CT].expected ===
                    keyPressed
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
                
                // attach the keypress function to the body of the html and get to the next view
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
