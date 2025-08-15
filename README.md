![JSON Schema logo - Build more, break less, empower others.](https://raw.githubusercontent.com/json-schema-org/.github/main/assets/json-schema-banner.png)

# 👋 Welcome to the JSON Schema Visualization Tool

**Tool**,that let's you to visualize json schema (i.e. nested schema, large complex and many more...) in graphical representation with all supports dialects. Currently, this tool mainly focus for latest dialect as 2020-12, but in later all others dialects supports also provides.

This repository contains the source code of the JSON Schema Visualization Tool:

* Powered by React with TypeScript,
* It Uses -
    * CytoScape.js Library - For Visualize the JSON Schema in graphical representation.
    * Hyperjump JSON Schema - For validating the JSON Schema correctly.
    * Monaco Editor - For view and edit the JSON Schema in real-time.
    * CytoScape.js plugin - For visualize the nodes in html elements

## Future Enhancements

Our Commitment

We are dedicated to making this tool more accessible and intuitive—bridging the gaps and helping users understand JSON Schema effortlessly. With that vision, we are planning several future enhancements, including:

- Support for downloading the visualized graph as an image.
- Functionality to upload a JSON file directly for schema visualization.
- Development of a VS Code extension for in-editor schema visualization.
- Additional features focused on improving usability and the overall developer experience.

And much more to come.

We'd love to hear from you—feel free to reach out and share your thoughts or suggestions to help us make this tool even more powerful and helpful for the community.

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






