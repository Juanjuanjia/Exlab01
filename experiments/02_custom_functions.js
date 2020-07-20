// Here, you can define all custom functions, you want to use and initialize some variables

/* Variables
*
*
*/
const group = _.sample(["1", "2", "3", "4", "5", "6"]); // You can determine global (random) parameters here
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

const question = function(config, CT) {
    return `<div class='magpie-view-answer-container'>
                    <p class='magpie-view-question'>${config.data[CT].question}</p>`;
}

const self_paced_reading_sc = function(config, CT) {
    const helpText = config.data[CT].help_text !== undefined ?
        config.data[CT].help_text : "Press the SPACE bar to reveal the words.";
    return `<div class='magpie-view'>
                <h1 class='magpie-view-title'>${config.title}</h1>
                <p class='magpie-view-question magpie-view-qud'>${config.data[CT].QUD}</p>
                <div class='magpie-view-stimulus-container'>
                    <div class='magpie-view-stimulus magpie-nodisplay'></div>
                </div>
                <p class='magpie-response-keypress-header'></p>
                <p class='magpie-help-text magpie-nodisplay'>${helpText}</p>
                <p class='magpie-spr-sentence'></p>
            </div>`;
}

// const key_press_sc = function(config, CT) {
//     return `<div class="magpie-view">
//                 <h1 class='magpie-view-title'>${config.title}</h1>
//                 <p class='magpie-response-keypress-header'>
//                 <strong>${config.data[CT].key1}</strong> = ${config.data[CT][config.data[CT].key1]},
//                 <strong>${config.data[CT].key2}</strong> = ${config.data[CT][config.data[CT].key2]}</p>
//                 <div class='magpie-view-stimulus-container'>
//                     <div class='magpie-view-stimulus magpie-nodisplay'></div>
//                 </div>
//             </div>`;
// }


const createWordList = function(sentenceCounter, wordList, counter, sentenceList) {
    // creates the sentence
    sentenceList[sentenceCounter].map((word) => {
        $(".magpie-spr-sentence").append(
            `<span class='spr-word hidden'>${word}</span>`,
            `<span class='underline' id='line${counter}'></span>`
        );
        counter++;
    });

    // creates an array of spr word elements
    return wordList = $(".spr-word").toArray();
}
const self_paced_reading_hrf = function(config, CT, magpie, answer_container_generator, startingTime){

    const sentence1 = config.data[CT].sentence_knowledge.trim().split(" ");
    const sentence2 = config.data[CT].sentence_trigger.trim().split(" ");
    const sentence3 = config.data[CT].sentence_continuation.trim().split(" ");
    const sentenceList = [sentence1, sentence2, sentence3];
    let spaceCounter = 0;
    let wordList = [];
    let readingTimes = [];
    let counter = 0;
    let sentenceCounter = 0;
    // wordPos "next" or "same", if "next" words appear next to each other, if "same" all words appear at the same place
    // default: "next"
    let wordPos = config.data[CT].wordPos === undefined ? "next" : config.data[CT].wordPos;
    let showNeighbor = wordPos === "next";
    // underline "words", "sentence" or "none", if "words" every word gets underlined, if "sentence" the sentence gets
    // underlined, if "none" there is no underline
    // default: "words"
    let underline = config.data[CT].underline === undefined ? "words" : config.data[CT].underline;
    let not_underline = underline === "none";
    let one_line = underline === "sentence";

    // shows the sentence word by word on SPACE press
    const handle_key_press = function(e) {

        let sentence = sentenceList[sentenceCounter];
        
        if (showNeighbor && wordList.length === 0 && sentenceCounter < 3) {
            wordList = createWordList(sentenceCounter, wordList, counter, sentenceList);
        }

        if (not_underline){
            $('.spr-word').addClass('no-line');
        } 

        if (e.which === 32 && spaceCounter < sentence.length) {
            if (showNeighbor) {
                wordList[spaceCounter].classList.remove("hidden");
               document.getElementById(`line${spaceCounter}`).classList.add("hidden");
            } else {
                $(".magpie-spr-sentence").html(`<span class='spr-word'>${sentence[spaceCounter]}</span>`);
                if (not_underline){
                    $('.magpie-spr-sentence .spr-word').addClass('no-line');
                }
            }

            if (spaceCounter === 0) {
                $(".magpie-help-text").addClass("magpie-invisible");
            }

            if (spaceCounter > 0 && showNeighbor) {
                wordList[spaceCounter - 1].classList.add("spr-word-hidden");
            }

            readingTimes.push(Date.now());
            spaceCounter++;
        } else if (e.which === 32 && spaceCounter === sentence.length) {
            if (showNeighbor) {
                wordList[spaceCounter - 1].classList.add("spr-word-hidden");
                sentenceCounter++;
                wordList = [];
                spaceCounter = 0;
                console.log(wordList);
            } else {
                $(".magpie-spr-sentence").html("");
            }

            $(".magpie-view").append(answer_container_generator(config, CT));

        
            const keyPressed = String.fromCharCode(
                e.which
            ).toLowerCase();
        
            if (keyPressed === config.data[CT].key1 || keyPressed === config.data[CT].key2) {
                let correctness;
                const RT = Date.now() - startingTime; // measure RT before anything else
        
                if (
                    config.data[CT].expected ===
                    config.data[CT][keyPressed.toLowerCase()]
                ) {
                    correctness = "correct";
                } else {
                    correctness = "incorrect";
                }
        
                let trial_data = {
                    trial_name: config.name,
                    trial_number: CT + 1,
                    key_pressed: keyPressed,
                    correctness: correctness,
                    RT: RT
                };
        
                trial_data[config.data[CT].key1] =
                    config.data[CT][config.data[CT].key1];
                trial_data[config.data[CT].key2] =
                    config.data[CT][config.data[CT].key2];
        
                trial_data = magpieUtils.view.save_config_trial_data(config.data[CT], trial_data);
        
                magpie.trial_data.push(trial_data);
                $("body").off("keydown", handleKeyPress);
                magpie.findNextView();
            }

            $("input[name=answer]").on("change", function() {
                const RT = Date.now() - startingTime;
                let reactionTimes = readingTimes
                .reduce((result, current, idx) => {
                    return result.concat(
                        readingTimes[idx + 1] - readingTimes[idx]
                    );
                }, [])
                .filter((item) => isNaN(item) === false);
                let trial_data = {
                    trial_name: config.name,
                    trial_number: CT + 1,
                    response: $("input[name=answer]:checked").val(),
                    reaction_times: reactionTimes,
                    time_spent: RT
                };

                trial_data = magpieUtils.view.save_config_trial_data(config.data[CT], trial_data);

                magpie.trial_data.push(trial_data);
                magpie.findNextView();
            });
            readingTimes.push(Date.now());
            spaceCounter++;
        }
    };
    // shows the help text
    $(".magpie-help-text").removeClass("magpie-nodisplay");

    if (not_underline){
        $('.magpie-spr-sentence .spr-word').addClass('no-line');
    }
    if (one_line){
        $('.magpie-spr-sentence .spr-word').addClass('one-line');
    }

    // attaches an eventListener to the body for space
    $("body").on("keydown", handle_key_press);

};




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
