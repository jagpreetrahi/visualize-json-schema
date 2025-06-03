![JSON Schema logo - Build more, break less, empower others.](https://raw.githubusercontent.com/json-schema-org/.github/main/assets/json-schema-banner.png)

# 👋 Welcome to the JSON Schema Visualization Tool

This is a tool which helps to visualize json schema in graphical representation with all supports dialects. Currently, this tool mainly focus for latest dialect as 2020-12, but in later all others dialects supports also provides.

This repository contains the source code of the JSON Schema Visualization Tool:

* Powered by React with TypeScript,
* It Uses -
    * CytoScape.js Library - For Visualize the JSON Schema in graphical representation.
    * Hyperjump JSON Schema - For validating the JSON Schema correctly.
    * Monaco Editor - For view and edit the JSON Schema in real-time.

## Setting up Project    

### Requirements

Use the following tools to set up the project

Node.js v20+

### Cloning the Repository

* Clone this template from github and open it in your likely text editor.



* Go inside the folder path and execute the following command:

```
 npm install
``` 

##  Run this project without docker 

```
npm run dev
```

## 🐳 Run this Project with Docker

```
docker build -t json .
docker run -p 5173:5173 json
```






