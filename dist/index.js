"use strict";
var commander = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var ts = require('typescript');
var files = [];
var d = function (node) {
    console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};
function syntaxKindToName(kind) {
    return ts.SyntaxKind[kind];
}
function printAllChildren(node, depth) {
    if (depth === void 0) { depth = 0; }
    console.log(new Array(depth + 1).join('----'), syntaxKindToName(node.kind), node.text ? "[" + node.text + "]" : '', node.name ? "[" + node.name.text + "]" : '', node.expression ? "[" + node.expression.text + "]" : '');
    depth++;
    node.getChildren().forEach(function (c) { return printAllChildren(c, depth); });
}
commander
    .option('-f, --file [file]', 'Entry *.ts file')
    .parse(process.argv);
function run() {
    if (!fs.existsSync(commander.file) ||
        !fs.existsSync(path.join(process.cwd(), commander.file))) {
        console.log('err');
        process.exit(1);
    }
    // const template = fs.readFileSync(commander.file);
    // const extractImports = /import\s*({\s*(\w|,)*\s*}\s*from)?\s*('|")(@|\w|\/|\.)*("|')\s*\;?/gmi;
    // const exractComponentMeta = /@Component\(\s*([\s{}\w:"'\-,./\[\]]*)/gmi;
    // const extractClassBody = /export\s*?class\s*(\w)+\s*{\s*([\w\W]+)?}/gmi;
    // const extractMethods = /(\w)+\s*\((\w)*\)\s*{[\w\s.=;+\(\)=\{\}>]*}/gmi;
    // console.log(template.toString());
    // let imports = template.toString().match(extractImports);
    // let methods = template.toString().match(extractMethods);
    // console.log(methods)
    // fs.writeFileSync('./test/res.ts', imports.join('\n'));
    // fs.writeFileSync('./test/res.ts', methods.join('\n'));
    // console.log(fs.readFileSync('./test/res.ts')+'');
    // process.exit(0);
    var program = ts.createProgram(files, {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015
    });
    var sourceCode = fs.readFileSync(commander.file);
    var sourceFile = ts.createSourceFile('foo.ts', sourceCode.toString(), ts.ScriptTarget.ES2015, true);
    printAllChildren(sourceFile);
    process.exit();
    var sourceFiles = program.getSourceFiles() || [];
    var __codeGen_extends = new Map();
    var __codeGen_members = new Map();
    sourceFiles.map(function (file) {
        ts.forEachChild(file, function (node) {
            var nn = (node.decorators || []).filter(function (decorator) {
                return decorator.expression.expression.text === 'Component';
            })
                .map(function (n) { return node; });
            var mm = nn.filter(function (n) { return n.members && n.members.length > 0; });
            d(mm);
            if (node.name && node.name.text === 'WcElement') {
                if (node.heritageClauses) {
                    node.heritageClauses.forEach(function (hcNode) {
                        node.heritageClauses.forEach(function (typeNode) {
                            typeNode.types.forEach(function (parentClass) {
                                d(parentClass.expression.text);
                                __codeGen_extends.set(parentClass.expression.text, parentClass);
                            });
                        });
                    });
                }
                if (node.members) {
                }
                d(node);
            }
        });
    });
}
run();
