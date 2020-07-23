// In this file you can instantiate your views
// We here first instantiate wrapping views, then the trial views


/** Wrapping views below

* Obligatory properties

    * trials: int - the number of trials this view will appear
    * name: string

*Optional properties
    * buttonText: string - the text on the button (default: 'next')
    * text: string - the text to be displayed in this view
    * title: string - the title of this view

    * More about the properties and functions of the wrapping views - https://magpie-ea.github.io/magpie-docs/01_designing_experiments/01_template_views/#wrapping-views

*/

// Every experiment should start with an intro view. Here you can welcome your participants and tell them what the experiment is about
const intro = magpieViews.view_generator("intro", {
  trials: 1,
  name: 'intro',
  // If you use JavaScripts Template String `I am a Template String`, you can use HTML <></> and javascript ${} inside
  text: `Thank you for considering to take part in our experiment. The whole task will take approximately 30 minutes. 
  <br />
  <br />
  In order to ensure the quality of the data, we would like to kindly ask you to make sure you can work in a silent environment without the possibility of distractions. For example, switch your phone off and disable notifications on your computer.
  <br />
  <br />
  The data will be processed anonymously and be only used for our research purpose. 
  <br />
  <br />
  If you are ready, please press the button below to get to the instructions.`,
  buttonText: 'Go to Instructions'
});

// For most tasks, you need instructions views
const instructions = magpieViews.view_generator("instructions", {
  trials: 1,
  name: 'instructions',
  title: 'General Instructions',
  text: `In this experiment, you will be presented with blocks of sentences.
  <br />
  Each block will be followed by a related yes-or-no question.
  <br />
  So, you will in turn need to first read 2-4 sentences and then answer a question.
  <br />
  This is a self-paced reading task. In the beginning, you will only see dashes. 
  <br />
  You will need to press the spacebar to replace the dashes with the word it concealed. Please press the spacebar immediately after reading and understanding a word.
  This causes the previous word to disappear. 
  <br />
  Before you start officially, you will get some practice trials to make yourself familiar with the tasks. `,
  buttonText: 'Go to Trials'
});


// In the post test questionnaire you can ask your participants addtional questions
const post_test = magpieViews.view_generator("post_test", {
  trials: 1,
  name: 'post_test',
  title: 'Additional information',
  text: 'Answering the following questions is optional, but your answers will help us analyze our results.',


  buttonText: 'Go on',
  age_question: 'Age',
  gender_question: 'Gender',
  gender_male: 'male',
  gender_female: 'female',
  gender_other: 'diverse',
  edu_question: 'Education',
  edu_graduated_high_school: 'High School',
  edu_graduated_college: 'College',
  edu_higher_degree: 'University',
  languages_question: 'Level of English based on European Reference',
  languages_more: '(e.g. A1-C2, if you had no problems with the questions take at least B1)',
  comments_question: 'Further Comments'
});

// The 'thanks' view is crucial; never delete it; it submits the results!
const thanks = magpieViews.view_generator("thanks", {
  trials: 1,
  name: 'thanks',
  title: 'Thank you for taking part in this experiment!',
  prolificConfirmText: 'Press the button'
});

const practice_trials = magpieViews.view_generator("key_press", {
  trials: practice.length,
  name: 'practice',
  data: practice
},
{
  stimulus_container_generator: key_press_practice_sc,
  answer_container_generator: question,
  handle_response_function: key_press_practice_hrf,
})

/** trial (magpie's Trial Type Views) below

* Obligatory properties

    - trials: int - the number of trials this view will appear
    - name: string - the name of the view type as it shall be known to _magpie (e.g. for use with a progress bar)
            and the name of the trial as you want it to appear in the submitted data
    - data: array - an array of trial objects

* Optional properties

    - pause: number (in ms) - blank screen before the fixation point or stimulus show
    - fix_duration: number (in ms) - blank screen with fixation point in the middle
    - stim_duration: number (in ms) - for how long to have the stimulus on the screen
      More about trial life cycle - https://magpie-ea.github.io/magpie-docs/01_designing_experiments/04_lifecycles_hooks/

    - hook: object - option to hook and add custom functions to the view
      More about hooks - https://magpie-ea.github.io/magpie-docs/01_designing_experiments/04_lifecycles_hooks/

* All about the properties of trial views
* https://magpie-ea.github.io/magpie-docs/01_designing_experiments/01_template_views/#trial-views
*/
const group = _.sample([0, 1, 2, 3, 4, 5]);
const trials = key_press_trials[group];

const experiment_data = {
  trials: trials.length,
  name: `key_press_trials[${group}]`,
  data: trials,

}

// Here, we initialize a normal forced_choice view
const main_experiment = magpieViews.view_generator("key_press", experiment_data,
{
  stimulus_container_generator: key_press_sc,
  answer_container_generator: question,
  handle_response_function: key_press_hrf,
});

// There are many more templates available:
// forced_choice, slider_rating, dropdown_choice, testbox_input, rating_scale, image_selection, sentence_choice,
// key_press, self_paced_reading and self_paced_reading_rating_scale
