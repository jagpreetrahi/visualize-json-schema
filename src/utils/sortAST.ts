import type { AST } from "@hyperjump/json-schema/experimental";

export const sortAST = (ast: AST) => {
    const DEF_KEY = "https://json-schema.org/keyword/definitions";

    const sortedAst: AST = {} as AST;

    for (const key of Object.keys(ast)) {
        const value = ast[key];

        if (Array.isArray(value)) {
            sortedAst[key] = [...value].sort((a, b) => {
                const aIsDefs = a[0] === DEF_KEY;
                const bIsDefs = b[0] === DEF_KEY;

                if (aIsDefs && !bIsDefs) return -1;
                if (!aIsDefs && bIsDefs) return 1;
                return 0;
            });
        } else {
            // boolean or meta sections (metaData, plugins)
            sortedAst[key] = value;
        }
    }
    return sortedAst;
}