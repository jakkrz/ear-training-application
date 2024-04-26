# Ear Training Application

This is a prototype of an application that contains various exercises/games to train your ear. It can be connected to a midi or acoustic instrument in order to be able to use the instrument directly to solve various exercises within the app. The exercises also teach sight reading and reading chord names. It was created for a competition.

## What's going to happen with this

A lot of people asked me if I will continue this project, so here's the deal. 

I am going to take a break from working on this, just to decide on what exactly I want to do with it. I may create a mailing list/newsletter soon for people who are interested. If I continue developing this, there is a chance I will make it closed-source (but then everyone I met will of course get a free lifetime edition so don't worry). Or I might stop working on it completely. 

In any case, you are free to download the current version of the app and run it. If you would like to be added to the mailing list, please send me a message to jkranz.business@gmail.com (my alternative "public" email)

## Installation instructions

### Prerequesites

- Git: https://git-scm.com/
- Node.js: https://nodejs.org/en with NPM added to PATH

### Steps

1. Open Command Prompt/Terminal
2. Use the following command to download the repo:
```
git clone https://github.com/jakkrz/ear-training-application
```
Now the code should be saved in a folder named `ear-training-application`.

3. Go into the folder:
```
cd ear-training-application
```
4. Install relevant packages:
```cmd
npm install
```
5. Execute the code:
```
npm run tauri dev
```
If working correctly, this should open a new window with the application running. If there are any issues with this, feel free to open a GitHub issue.
