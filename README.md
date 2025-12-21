<!-- TODO: update the logo -->
<!-- ![JSON Schema logo - Build more, break less, empower others.](https://raw.githubusercontent.com/json-schema-org/.github/main/assets/json-schema-banner.png) -->

# JSON Schema Visualizer

A visual, interactive graph-based tool to explore and understand complex JSON Schemas.

## Why?

JSON Schemas get hard to understand once they grow:
- deeply nested objects
- `$ref` everywhere
- circular references
- unclear relationships

This tool visualizes JSON Schema as an interactive graph so you can **see structure, references, and relationships instantly**.

## Features

- Graph-based visualization of JSON Schema
- `$ref` resolution and linking
- Circular reference handling
- Node & edge representation for schema entities

## Demo

JSON Schema
```json
{
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
    }
}
```
TODO: paste a screenshot of visualization here

## Usage (understading the visualization)
- Rendered nodes will have one of the following colors. Each color represents different JSON Schema type. 
_Note: - If the schema/subschema explicitely contains the 'type' keyowrd, then the color representation is 100% accurate. But if 'type' keyword is not present, then node color is inferred fron periferal keywords. In most cases, it will be correct, but if it failed to infer, then default color (soft gray) will be applied to node. - At the point, if a schema/subschema is defined for multiple instance types, then distinguishion for this case is not supported yet. In this specific case, if type is not defined, then node color will be follow this depending on the keyword presense: "object">"array">"string">"number"_ 

- keywords in a node represnts the kewords used to define the instance
- if any keywords value is subschema, then it is rendered as a new node (child) connect to parent via edge. The edge starts exactly left of the keyword for which its corresponding child node is created (there's a known issue source Handle (fron where edge originates) positioning -- mentioned in 'Limitations/known issues section')
- If the schema contains '$defs' (reusable) subschema, then a new node is created with title 'definitions' whose edge starts from the bottom of the parent schema/subschema. This node doesnt itself represents a subschema, but rather acts as a container to group the list of reusable subschemas. Those reusable subschemas originated fron this node instead of the parent node. This is done on purpose to differentiate the regular and reusable subschemas.
- Boolean schemas are represented a bit differently to make clear differentiation. Color of boolean schema node can be green or red depending on its value. Additionally, unlike objcet schemas (where colors apply only to title bg and borders), the color applied to the entire node instead of just title and borders. Borders of boolean schema nodes are also more rounded compared to object schema. (yes, this is not perfect design, the repesentation can be imporved... suggestions are welcome)
- Control buttons are provided at the bottom left of Visualization section.


## How It Works

1. The JSON Schema is parsed into an AST (Abstract Syntax Tree) using [Hyperjump](https://github.com/hyperjump-io/json-schema)
2. `$ref` (local & external) resolutions are handled by Hyperjump's library itself and are brought as a part of AST. 
3. The AST generated is used to generate nodes and edges.
4. These nodes and edges are rendered as interactive graph using [React Flow](https://reactflow.dev)


## Limitations / known issues
- Although 'search node' option is propvided, it is not implemented currently
- There is known bug in handle positioning. When editing schema in real time, the handle gets mispositioned. Once schema editing is complete, as a workaround, just refresh the page to bring handles to the correct position.
- The position of source/target handles gets swapped when a subschema in $defs refrences another $defs subschema which is defined after the referencing one. This also causes the title of the referenced subschema node to cut off.


## Contributing

-------------------------




## Future Enhancements / Roadmap

Our Commitment

We are dedicated to making this tool more accessible and intuitive—bridging the gaps and helping users understand JSON Schema effortlessly. With that vision, we are planning several future enhancements, including:

- Support for downloading the visualized graph as an image.
- Functionality to upload a JSON file directly for schema visualization.
- Development of a VS Code extension for in-editor schema visualization.
- Additional features focused on improving usability and the overall developer experience.

And much more to come.

We'd love to hear from you—feel free to reach out and share your thoughts or suggestions to help us make this tool even more powerful and helpful for the community.
