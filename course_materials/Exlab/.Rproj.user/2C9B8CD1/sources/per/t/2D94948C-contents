#### import libraries ####
library(tidyverse)
library(brms)
# option for bayesian regression models
# use all avaliable cores for parallel computing
options(mc.cores = parallel::detectCores())

library(HDInterval)
library(faintr)
# set random seed in order to make sure one can reproduce same results
set.seed(1702)

#### import data ####
politedata = read.csv("https://tinyurl.com/polite-data")
#### explaore main data ####
po_gen_sum <- politedata %>% group_by(gender) %>% summarise(mean_p = mean(pitch), sd_RT = sd(pitch))
po_pi_sum <- politedata %>% group_by(context) %>% summarise(mean_p = mean(pitch), sd_RT = sd(pitch))

## modelling data##
formula_FE = pitch ~ gender * context
model_EF = brm(
  formula = formula_FE,
  data = politedata,
  seed = 1702
)

#### check the significance ####
post_samples_EF = posterior_samples(model_EF)
head(post_samples_EF)
mean(post_samples_EF$b_genderM < 0)
mean(post_samples_EF$b_contextpol < 0)
mean(post_samples_EF$`b_genderM:contextpol`>0)
mean(post_samples_EF$b_genderM < post_samples_EF$b_contextpol)

#### take random effects into consideration ####
model_MAXRE = brm(
  formula = pitch ~ gender*context +
    (1 | sentence) + (1 | subject) +
    (0 + gender * context | sentence) +
    (0 + context | subject),
  data = politedata, control = list(adapt_delta = 0.99)
)

get_posterior_beliefs_about_hypotheses(model_MaxRE)











