########## 1. Import libraries ##########
library(tidyverse)
library(zoo)
library(lmtest)
options(mc.cores = parallel::detectCores())
library(HDInterval)
install_github(
  repo = "michael-franke/bayes_mixed_regression_tutorial",
  subdir = "faintr",
  force = TRUE)
library(faintr)
library(usethis)
library(devtools)
library(Matrix)
library(lme4)
library(reshape)
library(data.table)
library(afex)
set.seed(1702)

########## 2. Import data & Adjust data table & calculate demopraphic characteristics ##########
### import data
data_raw <- read.csv("D:/Master/SS20/EPLab/data/02_main/01_raw_data.csv")
view(data_raw)

# data_rV is a table containing only relevant variables
data_rV <- data_raw %>% 
  select(submission_id, age, gender, education, languages, condition,  
         correctness, filler, reactionTimes_continuation, 
         reactionTimes_trigger, sentence_continuation, 
         sentence_knowledge, sentence_trigger)

### adjust the table for calculating the correctness of answering the comprehension questions
## exclude participants whose english level is below B1
data_filter_el <- data_rV %>% filter(languages %in% c('C1', 'B1', 'B2', 'B2/C1', 'B2 or C1', 'c2'))
## calculate correctness
data_correctness <- data_filter_el %>% select(submission_id, correctness) %>% 
  group_by(submission_id) %>% table() %>% as.data.frame.matrix()
setDT(data_correctness, keep.rownames = 'submission_id')

### demographic characteristics of participants
## average age
data_age <- mean(data_filter_el$age)
data_age_sd <- sd(data_filter_el$age)
# data_age = 31.80, sd = 16.54  

## Educational backgroud
data_edu <- data_filter_el %>% distinct(submission_id, education) %>%
  group_by(education) %>% count(education) 
data_edu <- data_edu %>% mutate(percentage = n/sum(data_edu[2]))
data_edu

## gender
data_gender <- data_filter_el %>% distinct(submission_id, gender) %>%
  group_by(gender) %>% count(gender) 
data_gender <- data_gender %>% mutate(percentage = n/sum(data_gender[2]))
data_gender

## language level
data_language <- data_filter_el %>% distinct(submission_id, languages) %>%
  group_by(languages) %>% count(languages)
data_language <- data_language %>% mutate(percentage = n/sum(data_language[2]))
data_language

########## 3. Clean data ##########
### 3.1 calculate respond accuracy per participant
## add pecentage of correctness of each participant to the new data frame
correctness <- c()
len <- length(data_correctness$correct)
for(i in 1:len){
  correctness[i] <- 
    data_correctness$correct[i]/(data_correctness$correct[i] + 
                                   data_correctness$incorrect[i])
} 
data_correctness_percentage <- cbind(data_correctness, correctness)
data_correctness_percentage %>% 
  ggplot(aes(x = submission_id, y=correctness)) + geom_point() + ylim(0,1) +
  theme(
    panel.background = element_rect(fill = "transparent"), 
    plot.background = element_rect(fill = "transparent", color = NA),
    panel.grid.major = element_blank(),
    panel.grid.minor = element_blank(),
    legend.background = element_rect(fill = "transparent"), 
    legend.box.background = element_rect(fill = "transparent") 
  )

data_filter_co <- data_correctness_percentage #!!!!!!!!!!!!!!!!!!!!!!

"## find participant_ids whose correctness of comprehension questions equals to and beyond 80%
data_filter_co <- data_correctness_percentage %>% select(submission_id, correctness) %>% 
  filter(correctness>=0.8)" #£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡£¡

### 3.2 calculate avarage respond accuracy
average_accuracy <- mean(data_correctness_percentage$correctness)
average_accuracy
# average accuracy = 0.84

### 3.3 "exclude data points when respond accuracy below 80%" !!!!!!!!!!!!!!!!! 
### and select relevant variables for the main analyse and exclude concelation condition
data_clean <- data_rV %>% filter(submission_id %in% data_filter_co$submission_id) %>% 
  filter(filler == "FALSE") %>% 
  select(submission_id, condition, reactionTimes_continuation, 
         reactionTimes_trigger, sentence_continuation, 
         sentence_knowledge, sentence_trigger) %>% 
  filter(condition %in% c('anaphor_strong', 'anaphor_weak', 'literal_strong', 'literal_weak'))

write.csv(data_clean, file = "D:/Master/SS20/EPLab/data/02_main/02_clean_data.csv")

### 3.5 adjust the data structure for the main analysis
# convert reaction times from pipe seperated cells to a list
data_extractRT <- data_clean %>% rowwise() %>% 
  mutate(rt_trigger=as.character(reactionTimes_trigger)) %>% 
  mutate(rt_continuation=as.character(reactionTimes_continuation))

lenRt <- length(data_clean$reactionTimes_continuation)

for (i in 1:lenRt){
  data_extractRT$rt_continuation[i] <- 
    as.character(data_clean$reactionTimes_continuation[i]) %>% 
    strsplit(split='|',fixed=TRUE)
  data_extractRT$rt_trigger[i] <- 
    as.character(data_clean$reactionTimes_trigger[i]) %>% 
    strsplit(split='|',fixed=TRUE)
}

# add critical language regions
rt_trigger_critical <- c()
lenCritic <- length(data_extractRT$rt_trigger)
for (i in 1:lenCritic){
  if (data_extractRT$condition[i] == 'anaphor_strong' || 
      data_extractRT$condition[i] == 'anaphor_weak'){
    rt_trigger_critical[i] <- 
      as.numeric(data_extractRT$rt_trigger[[i]][1]) + 
      as.numeric(data_extractRT$rt_trigger[[i]][2])
  } else {
    rt_trigger_critical[i] <- 
      as.numeric(data_extractRT$rt_trigger[[i]][2]) + 
      as.numeric(data_extractRT$rt_trigger[[i]][3])
  }
}

data_rt_critical1 <- cbind(data_extractRT,rt_trigger_critical)

rt_continuation_critical <- c()
lenCritic2 <- length(data_extractRT$rt_continuation)
for (i in 1:lenCritic2) {
  if (data_extractRT$sentence_continuation[i] == 
      'The rest stayed at home and foolishly risked their lives.') {
    rt_continuation_critical[i] <- as.numeric(data_extractRT$rt_continuation[[i]][3])
  } 
  if (data_extractRT$sentence_continuation[i] == 
      'The others were relatively steady but my portfolio was still down for the year.' || 
      data_extractRT$sentence_continuation[i] == 
      "The others were not invited to attend because the teachers didn't want anyone to feel left out.") {
    rt_continuation_critical[i] <- 
      as.numeric(data_extractRT$rt_continuation[[i]][3]) + 
      as.numeric(data_extractRT$rt_continuation[[i]][4]) + 
      as.numeric(data_extractRT$rt_continuation[[i]][5])
  } 
  else {rt_continuation_critical[i] <- 
    as.numeric(data_extractRT$rt_continuation[[i]][3]) + 
    as.numeric(data_extractRT$rt_continuation[[i]][4])}
}

rt_critical <- cbind(data_rt_critical1, rt_continuation_critical)

# add factors knowledge and trigger as two columns
knowledge <- c()
trigger <- c()

lenFac <- length(rt_critical$condition)
for (i in 1:lenFac){
  if (rt_critical$condition[i] == 'anaphor_weak')
    {knowledge[i] <- "partial"
    trigger[i] <- "scalar"} 
  if (rt_critical$condition[i] == 'literal_weak')
    {knowledge[i] <- "partial"
    trigger[i] <- "focused"} 
  if (rt_critical$condition[i] == 'anaphor_strong')
    {knowledge[i] <- "full"
    trigger[i] <- "scalar"} 
  if (rt_critical$condition[i] == 'literal_strong')
    {knowledge[i] <- "full"
    trigger[i] <- "focused"}
}

rt_critical_factors <- rt_critical %>% cbind(knowledge, trigger) %>% 
  select(submission_id, sentence_trigger, sentence_continuation, condition, knowledge, trigger, rt_trigger_critical, 
         rt_continuation_critical)

# descriptive statistics for individual participant
indi_rt_trigger <- rt_critical_factors %>% group_by(submission_id) %>% 
  summarize(mean_trigger_RT = mean(rt_trigger_critical), 
            sd_trigger_RT = sd(rt_trigger_critical))

indi_rt_continu <- rt_critical_factors %>% group_by(submission_id) %>% 
  summarize(mean_continuation_RT = mean(rt_continuation_critical), 
            sd_continuation_RT = sd(rt_continuation_critical))

# descriptive statistics of RTs of critical language areas of both trigger- and continuation-sentences
rt_critical_factors %>% pull(rt_trigger_critical) %>% mean()
rt_critical_factors %>% pull(rt_trigger_critical) %>% summary()
rt_critical_factors %>% pull(rt_continuation_critical) %>% mean()
rt_critical_factors %>% pull(rt_continuation_critical) %>% summary()

rt_critical_factors %>% 
  ggplot(aes(x = as.factor(submission_id), y=rt_trigger_critical)) + geom_point() + 
  scale_y_continuous(breaks = seq(0, 3000, 200))
rt_critical_factors %>% 
  ggplot(aes(x = as.factor(submission_id), y=rt_trigger_critical)) + geom_boxplot()
  
rt_critical_factors %>% 
  ggplot(aes(x = as.factor(submission_id), y=rt_continuation_critical)) + geom_point() +
  scale_y_continuous(breaks = seq(0, 3000, 200))
rt_critical_factors %>% 
  ggplot(aes(x = as.factor(submission_id), y=rt_continuation_critical)) + geom_boxplot()

# exclude extreme individual reaction times > 2000, < 100 in both trigger and continuation sentences
rt_critical_factors <- rt_critical_factors %>%  
  mutate(outlier = case_when(rt_trigger_critical < 100 ~ TRUE,                                               
                             rt_trigger_critical > 2000 ~ TRUE,                                             
                             rt_continuation_critical < 100 ~ TRUE,
                             rt_continuation_critical > 2000 ~ TRUE,                                           
                             TRUE ~ FALSE))
outlier_percentage <- rt_critical_factors %>% group_by(outlier) %>% count()
outlier_percentage <- outlier_percentage$n[2]/sum(outlier_percentage$n) # outlier percentage 2.5%  
rt_critical_factors <- rt_critical_factors %>% filter(outlier == FALSE)


########## 4. exploring main data ##########
###4.1 summarize RTs of critical regions of both trigger and continuation sentences
rt_critical_factors_sum <- rt_critical_factors %>% group_by(trigger, knowledge) %>%
  summarise(mean_trigger = mean(rt_trigger_critical), 
            mean_continu = mean(rt_continuation_critical),
            sd_trigger = sd(rt_trigger_critical),
            sd_continu = mean(rt_continuation_critical))

### 4.2 plot RTs of critical regions under experimental conditions
# plot Rts of critical regions in trigger sentences
rt_critical_factors$knowtrig <- interaction(rt_critical_factors$knowledge, 
                                            rt_critical_factors$trigger)
ggplot(aes(y = rt_trigger_critical, x = knowtrig), 
       data = rt_critical_factors) + geom_boxplot() +
  theme(
    panel.background = element_rect(fill = "transparent"), 
    plot.background = element_rect(fill = "transparent", color = NA), 
    panel.grid.major = element_blank(), 
    panel.grid.minor = element_blank(), 
    legend.background = element_rect(fill = "transparent"), 
    legend.box.background = element_rect(fill = "transparent") 
  )

# plot Rts of critical regions in complement sentences
rt_critical_factors$knowtrig <- interaction(rt_critical_factors$knowledge, 
                                            rt_critical_factors$trigger)
ggplot(aes(y = rt_continuation_critical, x = knowtrig), 
       data = rt_critical_factors) + geom_boxplot() +
  theme(
    panel.background = element_rect(fill = "transparent"), 
    plot.background = element_rect(fill = "transparent", color = NA),
    panel.grid.major = element_blank(),
    panel.grid.minor = element_blank(),
    legend.background = element_rect(fill = "transparent"), 
    legend.box.background = element_rect(fill = "transparent") 
  )

rt_critical_factors %>% 
  ggplot(aes(x = rt_trigger_critical)) + 
  geom_jitter(aes(y = 0.0005), alpha = 0.1, height = 0.0005) + # add individual data points
  geom_density(fill = "gray", alpha = 0.5)+  # add a denity plot
  geom_vline(data = rt_critical_factors_sum, mapping = aes(xintercept = mean_trigger), color = "firebrick") +
  facet_grid(vars(knowledge), vars(trigger))

rt_critical_factors %>% 
  ggplot(aes(x = rt_continuation_critical)) + 
  geom_jitter(aes(y = 0.0005), alpha = 0.1, height = 0.0005) + # add individual data points
  geom_density(fill = "gray", alpha = 0.5)+  # add a denity plot
  geom_vline(data = rt_critical_factors_sum, mapping = aes(xintercept = mean_continu), color = "firebrick") +
  facet_grid(vars(knowledge), vars(trigger))

### 4.3 log-transform RTs
rt_critical_factors <- rt_critical_factors %>% 
  mutate(log_rt_trigger = log(rt_trigger_critical)) %>% 
  mutate(log_rt_continuation = log(rt_continuation_critical))


### 4.2 model data with lmr 
###(linear mixed-effect regression analyses, participants and items as crossed random factors, IVs as fixed effects)
## 4.2.1 sum coding speaker knowledge, trigger-type
contrasts(rt_critical_factors$knowledge) = contr.sum(2)
contrasts(rt_critical_factors$trigger) = contr.sum(2)

## 4.2.2 analyse effects across two factors on trigger- and continuation sentences
model_trigger <- lmer(log_rt_trigger ~ knowledge * trigger + 
                        (1|submission_id) + (1|sentence_trigger), 
                      data = rt_critical_factors)
summary(model_trigger)

model_continuation <- lmer(log_rt_continuation ~ knowledge * trigger + 
                             (1|submission_id) + (1|sentence_continuation), 
                           data = rt_critical_factors)
summary(model_continuation)

## 4.2.3 analyse effects of knowledge under trigger_scalar and trigger_focused conditions seperatedly
# analyse effects of knowledge under trigger_scalar for trigger sentences
rt_scalar <- rt_critical_factors %>% filter(trigger == 'scalar')
model_trigger_scalar <- lmer(log_rt_trigger ~ knowledge + 
                        (1|submission_id) + (1|sentence_trigger), 
                      data = rt_scalar)
summary(model_trigger_scalar)

# analyse effects of knowledge under trigger_scalar for continuation sentences
model_continuation_scalar <- lmer(log_rt_continuation ~ knowledge + 
                               (1|submission_id) + (1|sentence_continuation), 
                             data = rt_scalar)
summary(model_continuation_scalar)

# analyse effects of knowledge under trigger_focused for trigger sentences
rt_focused <- rt_critical_factors %>% filter(trigger == 'focused')
model_trigger_focused <- lmer(log_rt_trigger ~ knowledge + 
                               (1|submission_id) + (1|sentence_trigger), 
                             data = rt_focused)
summary(model_trigger_focused)

# analyse effects of knowledge under trigger_focused for continuation sentences
model_continuation_focused <- lmer(log_rt_continuation ~ knowledge + 
                                    (1|submission_id) + (1|sentence_continuation), 
                                  data = rt_focused)
summary(model_continuation_focused)








