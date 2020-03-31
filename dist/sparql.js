"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sparqljs_1 = require("sparqljs");
const paths_1 = require("./paths");
const term_1 = require("./term");
const toParseResult = (sppStr, prefixes) => {
    const parser = new sparqljs_1.Parser();
    const prefixStr = Object.entries(prefixes)
        .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
        .join("\n");
    const parsedQuery = parser.parse(`${prefixStr}
        SELECT * { ?s ${sppStr} ?o. }`);
    return parsedQuery.where[0].triples[0].predicate;
};
const itemIsNamedNode = (item) => "termType" in item && item.termType === "NamedNode";
const toPathObj = (parseResult) => {
    if (itemIsNamedNode(parseResult)) {
        return new term_1.NamedNode(parseResult.value);
    }
    switch (parseResult.pathType) {
        case "|":
            return new paths_1.PathAlt(parseResult.items.map((i) => (itemIsNamedNode(i) ? new term_1.NamedNode(i.value) : toPathObj(i))));
        case "/":
            return new paths_1.PathSeq(parseResult.items.map((i) => (itemIsNamedNode(i) ? new term_1.NamedNode(i.value) : toPathObj(i))));
        default:
            console.log(parseResult);
            throw new Error("PathType not implemented");
    }
};
exports.parseSPP = (str, prefix) => toPathObj(toParseResult(str, prefix));
