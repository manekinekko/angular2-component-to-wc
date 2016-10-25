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
var indentation = 0;
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
var patchClassOpenBlock = false;
var className = '';
var isConstructor = false;
function recognize(node) {
    switch (syntaxKindToName(node.kind)) {
        case 'FirstLiteralToken':
        case 'Identifier':
            gen(node.text);
            if (patchClassOpenBlock) {
                gen(' extends HTMLElement {');
                className = node.text;
                patchClassOpenBlock = false;
            }
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
            gen('\n');
            gen('export');
            gen(' ');
            break;
        case 'ClassKeyword':
            gen('class');
            gen(' ');
            patchClassOpenBlock = true;
            break;
        case 'ThisKeyword':
            gen('this');
            break;
        case 'ConstructorKeyword':
            gen('constructor');
            isConstructor = true;
            break;
        case 'FalseKeyword':
            gen('false');
            break;
        case 'TrueKeyword':
            gen('true');
            break;
        case 'NullKeyword':
            gen('null');
            break;
        case 'AtToken':
            gen('let Component = o => o;');
            gen('\n');
            gen('let metadata = ');
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
            if (isConstructor) {
                gen('super();');
                gen('\n');
                isConstructor = false;
                break;
            }
            break;
        case 'CloseBraceToken':
            gen('}');
            break;
        case 'CloseParenToken':
            gen(')');
            break;
        case 'OpenBracketToken':
            gen('[');
            break;
        case 'CloseBracketToken':
            gen(']');
            break;
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
            gen(' ');
            break;
        case 'PrivateKeyword':
            gen('private');
            gen(' ');
            break;
        case 'PublicKeyword':
            gen('public');
            gen(' ');
            break;
        default:
            break;
    }
}
function gen(token) {
    code.push(token);
}
function transform(code) {
    return code;
}
function indent() {
    indentation = Math.max(indentation, 0);
    var space = '';
    //for (let i=0;i<indentation; i++) space += ' ';
    //const space = Array(indentation).fill('++').map((_, i) => ' ').join(',');
    return space;
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
    var program = ts.createProgram(files, {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015
    });
    var sourceCode = fs.readFileSync(commander.file);
    var sourceFile = ts.createSourceFile('foo.ts', sourceCode.toString(), ts.ScriptTarget.ES2015, true);
    printAllChildren(sourceFile);
    gen('\n');
    gen("document.registerElement(metadata.selector, " + className + ");");
    if (!printAST) {
        console.log(transform(code).join(''));
    }
    process.exit();
}
run();
