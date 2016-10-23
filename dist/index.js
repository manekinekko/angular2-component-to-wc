"use strict";
var commander = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var ts = require('typescript');
var printAST = false;
var files = [];
var d = function (node) {
    console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};
var code = [];
var depth = 0;
function syntaxKindToName(kind) {
    return ts.SyntaxKind[kind];
}
function printAllChildren(node, depth) {
    if (depth === void 0) { depth = 0; }
    if (printAST && depth > 0) {
        console.log(new Array(depth + 1).join('----'), syntaxKindToName(node.kind), node.text ? "[" + node.text + "]" : '');
    }
    gen(recognize(node));
    depth++;
    node.getChildren().forEach(function (c) { return printAllChildren(c, depth); });
}
function recognize(node) {
    switch (syntaxKindToName(node.kind)) {
        case 'FirstLiteralToken':
        case 'Identifier':
            gen(node.text);
            break;
        case 'StringLiteral':
            gen('\'');
            gen(node.text);
            gen('\'');
            break;
        case 'ImportKeyword':
            gen('import');
            gen(' ');
            break;
        case 'FromKeyword':
            gen('from');
            gen(' ');
            break;
        case 'ExportKeyword':
            gen('export');
            gen(' ');
            break;
        case 'ClassKeyword':
            gen('class');
            gen(' ');
            break;
        case 'ThisKeyword':
            gen('this');
            break;
        case 'ConstructorKeyword':
            gen('constructor');
            break;
        case 'FalseKeyword':
            gen('false');
            break;
        case 'TrueKeyword':
            gen('true');
            break;
        case 'AtToken':
            gen('@');
            break;
        case 'PlusToken':
            gen('+');
            break;
        case 'EqualsGreaterThanToken':
            gen(' => ');
            break;
        case 'OpenParenToken':
            gen('(');
            break;
        case 'ImportClause':
        case 'ObjectLiteralExpression':
            gen('{');
            gen(' ');
            break;
        case 'Block':
            gen('{');
            gen('\n');
            depth++;
            break;
        case 'CloseBraceToken':
            gen('}');
            gen('\n');
            depth--;
            break;
        case 'CloseParenToken':
            gen(')');
            break;
        case 'OpenBracketToken':
            gen('[');
            break;
        case 'CloseBracketToken':
            gen(']');
        case 'SemicolonToken':
            gen(';');
            gen('\n');
            break;
        case 'CommaToken':
            gen(',');
            gen(' ');
            break;
        case 'ColonToken':
            gen(' ');
            gen(':');
            gen(' ');
            break;
        case 'DotToken':
            gen('.');
            break;
        case 'FirstAssignment':
            gen(' = ');
            break;
        case 'FirstPunctuation':
            gen('');
            break;
        case 'PrivateKeyword':
            gen('private');
            break;
        case 'PublicKeyword':
            gen('public');
            break;
    }
}
function gen(token) {
    code.push(indent(depth) + token);
}
function indent(depth) {
    if (depth === void 0) { depth = 0; }
    return Array(depth + 1).fill().map(function (_, i) { return ' '; });
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
    if (!printAST) {
        console.log(code.join(''));
    }
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
