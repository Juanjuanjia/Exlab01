####import library####
library(tidyverse)
library(brms)
# option for bayesian regression models
# use all avaliable cores for parallel computing
options(mc.cores = parallel::detectCores())
library(devtools)
library(usethis)
#install_github(
#repo = "michael-franke/bayes_mixed_regression_tutorial",
#subdir = "faintr")
library(faintr)


library(HDInterval)
# set random seed in order to make sure one can reproduce same results
set.seed(1702)

###import data###
data_raw <- read_csv("03_Simon_data_anonym.csv")
#gain an impression of the raw data
glimpse(data_raw) 
data_raw %>% pull(timeSpent)%>%mean() 
data_raw %>% pull(timeSpent)%>%summary()
data_raw %>%
  ggplot(aes(x = timeSpent)) + geom_histogram()

###summarizing & cleaning the data
#individual error rate and reaction times
data_indi_summary <- data_raw %>% filter(trial_type == 'main') %>%
  group_by(submission_id) %>% summarize(mean_RT = mean(RT),
                                        error_rate = mean(correctness == "incorrect")) 
head(data_indi_summary)

data_indi_summary %>% 
  ggplot(aes(x = mean_RT, y=error_rate)) + geom_point()

data_indi_summary <- data_indi_summary %>% # use mutate to add new columns
  mutate(outlier = case_when(mean_RT < 350 ~ TRUE,
                             mean_RT > 750 ~ TRUE,
                             error_rate > 0.5 ~ TRUE,
                             TRUE ~ FALSE))
head(data_indi_summary)

data_indi_summary %>% 
  ggplot(aes(x=mean_RT, y=error_rate)) + geom_point() + geom_point(
    data=filter(data_indi_summary, outlier==TRUE),
    color = "firebrick", shape = "square", size = 5
  ) #output outlier seperately

data_raw <- full_join(data_raw, data_indi_summary, by = "submission_id")
data_cleaned <- filter(data_raw, outlier==FALSE)
head(data_cleaned)
message(
  "We excluded ", sum(data_indi_summary$outlier),
  " participants for suspecious mean RTs and higher error rates."
)

data_cleaned %>% ggplot(aes(x=log(RT))) + geom_histogram() + 
  geom_jitter(aes(x = log(RT), y = 1), alpha = 0.3, height = 300)

data_cleaned <- filter(data_cleaned, RT > 100 & RT < 1000) # cleaning the data on a trial level
data_cleaned %>% ggplot(aes(x = RT)) + geom_histogram() + geom_jitter(
  aes(x = RT, y = 1), alpha = 0.3, height = 300
)

####exploring main Data####
date_cleaned_sum <- data_cleaned %>% filter(correctness == "correct") %>% group_by(condition) %>%
  summarize(mean_RT = mean(RT), sd_RT = sd(RT))
#plotting the reaction time
data_cleaned %>% 
  filter(correctness == "correct") %>% 
  ggplot(aes(x = RT)) + 
  geom_jitter(aes(y = 0.0005), alpha = 0.1, height = 0.0005) + # add individual data points
  geom_density(fill = "gray", alpha = 0.5)+  # add a denity plot
  geom_vline(data = date_cleaned_sum, mapping = aes(xintercept = mean_RT), color = "firebrick") +
  facet_grid(condition ~ .) #producing facets for each condition

#### baysian statistic ####
RT_model <- brm(
  formula = RT ~ condition * target_object * target_position,
  data = data_cleaned
)

compare_groups(
  model = RT_model,
  higher = list("condition" = "incongruent"),
  lower = list("condition" = "congruent")
)

compare_groups(
  model = RT_model,
  higher = list("target_position" = "left"),
  lower = list("target_position" = "right")
)


compare_groups(
  model = RT_model, 
  higher = list("target_object" = "circle"), 
  lower = list("target_object"  = "square")
)




