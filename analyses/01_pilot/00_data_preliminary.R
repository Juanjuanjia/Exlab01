########## 1. Import Libraries ##########
library(tidyverse)
# load lmtest for likelihood ratio test
library(zoo)
library(lmtest)
# option for bayesian regression models
# use all avaliable cores for parallel computing
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
# set random seed in order to make sure one can reproduce same results
set.seed(1702)

########## 2. Import data & Adjust data table ##########

########## 3. Summarize & Clean data ##########
### 3.1 calculate respond accuracy per participant

### 3.2 calculate avarage respond accuracy

### 3.3 exclude data points when respond accuracy below 80% 

### 3.4 trimm extreme individual RTs (> 1500 ms, or < 100 ms) and calculate the percentage

### 3.5 plot RTs of regions under experimental conditions (rf. Figures 1, 2, and 3 in original paper)

########## 4. Conduct major analyses ##########
### 4.1 log-transform RTs

### 4.2 model data with lmr (linear mixed-effect regression analyses, participants and items as crossed random factors, IVs as fixed effects)
## 4.2.1 sum coding speaker knowledge, trigger-type and their interaction
#code: contrasts(dataName$codingFactorName) = contr.sum(numberOfNumber) (#assigning the deviation contrasts to codingFactorName)

## 4.2.3 conduct lmr 
#code: lmer(dv ~iv1+iv2+(1|randomeffect1)+(1|randomeffect2), data=dataName)

## 4.2.4 conduct likelihood ratio test interatively
#code: lrtest(modelName1, modelName2)


### 4.3 conduct correlational analysis




