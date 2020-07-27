# Homework for week 5 of XPLab-2020

- follow the instructions on the _magpie site to instantiate your own experiment based on the "departure point"
- change the "departure point" template as follows to work towards a realization of the "mental rotation" experiment (as described in the PDF):
  - replace the 2-alternative forced choice task with a key-press task 
    - for this, you need to use another template view type
    - more on this here: https://magpie-ea.github.io/magpie-site/experiments/05views.html
    - in particular, you need the 'key-press' template view which is documented here: https://magpie-ea.github.io/magpie-docs/01_designing_experiments/01_template_views/#key-press
  - key presses should be recorded as "same" and "different" (i.e., they should show up as one of these strings in the final table output)
  - code the key press choices as "correct" or "incorrect" based on the picture shown
  - pick pictures from the 60 mental rotation pictures (no matter which)
  - add appropriate trial information (in `03_trials.js`) for these five pictures (so that this is shown in the final output; because we might need it for analysis):
    - number of picture shown
    - degree of rotation
    - whether the picture's objects are indeed "same" or "different"
    
- optionally:
  - randomize the five trials using the command `_.shuffle()` from the [lodash library](https://lodash.com) which is (super useful (!) and) loaded automatically with _babe
  

