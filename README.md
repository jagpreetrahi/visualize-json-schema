![JSON Schema logo - Build more, break less, empower others.](public/logo.png)

# 👋 Welcome to the JSON Schema Visualization Tool

**Tool**,that let's you to visualize json schema (i.e. nested schema, large complex and many more...) in graphical representation with all supports dialects. Currently, this tool mainly focus for latest dialect as 2020-12, but in later all others dialects supports also provides.

This repository contains the source code of the JSON Schema Visualization Tool:

* Powered by React with TypeScript,
* It Uses -
    * React Flow Library - For Visualize the JSON Schema in graphical representation.
    * Hyperjump JSON Schema - For validating the JSON Schema correctly.
    * Monaco Editor - For view and edit the JSON Schema in real-time.

## Project structure

This repository has the following structure:

<!-- If you make any changes in the project structure, remember to update it. -->

```text
  ├── .github                     # Definitions of GitHub workflows
  ├── src                         # Starting folder for project
  |   ├── components                  # Various main components such as "GraphView", "MonacoEditor", etc.
  |   ├── data                        # Default JSON Schema data
  |   ├── context                     # Contains the  context for theme and visualization.
  |   ├── styles                      # Various CSS files
  |   ├── utils                       #  Helper funtions for Schema.
  ├── public                       # Data for site metadata and static assets such as images.
  ├── Dockerfile                   # Contains the steps for building a docker image.
  ├── tsconfig.json                # typescript configuration.
 
```    
    

## Future Enhancements

Our Commitment

We are dedicated to making this tool more accessible and intuitive—bridging the gaps and helping users understand JSON Schema effortlessly. With that vision, we are planning several future enhancements, including:

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






