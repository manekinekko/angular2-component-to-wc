"use strict";
var commander = require('commander');
var fs = require('fs');
var path = require('path');
var util = require('util');
var ts = require('typescript');
var d = function (node) { return console.log(util.inspect(node, { showHidden: true, depth: 10 })); };
var w = function (f, text) { return fs.writeFileSync(f, text, { encoding: 'utf-8' }); };
var _log = [];
var log = function () {
    var text = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        text[_i - 0] = arguments[_i];
    }
    return _log.push(text.join(''));
};
var code = [];
var gen = (function () {
    var tmp = [];
    return function (token) {
        if (token === '\n') {
            code.push(tmp.join(''));
            tmp = [];
        }
        else {
            tmp.push(token);
        }
        return code;
    };
}());
var syntaxKindToName = function (kind) { return ts.SyntaxKind[kind]; };
function visitNode(node, depth) {
    if (depth === void 0) { depth = 0; }
    log(new Array(depth + 1).join('----'), syntaxKindToName(node.kind), node.text ? "[" + node.text + "]" : '');
    recognize(node);
    depth++;
    node.getChildren().forEach(function (c) { return visitNode(c, depth); });
}
var patchClassOpenBlock = false;
var className = '';
var isConstructor = false;
var isDecorator = false;
function recognize(node) {
    switch (node.kind) {
        case ts.SyntaxKind.FirstLiteralToken:
        case ts.SyntaxKind.Identifier:
            gen(node.text);
            if (patchClassOpenBlock) {
                gen(' extends HTMLElement {');
                className = node.text;
                patchClassOpenBlock = false;
            }
            break;
        case ts.SyntaxKind.StringLiteral:
            gen('\'');
            gen(node.text);
            gen('\'');
            break;
        case ts.SyntaxKind.ImportKeyword:
            gen('import');
            gen(' ');
            break;
        case ts.SyntaxKind.FromKeyword:
            gen('from');
            gen(' ');
            break;
        case ts.SyntaxKind.ExportKeyword:
            if (isDecorator) {
                gen(';');
                isDecorator = false;
            }
            gen('\n');
            gen('export');
            gen(' ');
            break;
        case ts.SyntaxKind.ClassKeyword:
            gen('class');
            gen(' ');
            patchClassOpenBlock = true;
            break;
        case ts.SyntaxKind.ThisKeyword:
            gen('this');
            break;
        case ts.SyntaxKind.ConstructorKeyword:
            gen('constructor');
            isConstructor = true;
            break;
        case ts.SyntaxKind.FalseKeyword:
            gen('false');
            break;
        case ts.SyntaxKind.TrueKeyword:
            gen('true');
            break;
        case ts.SyntaxKind.NullKeyword:
            gen('null');
            break;
        case ts.SyntaxKind.AtToken:
            gen('let Component = o => o;');
            gen('\n');
            gen('let metadata = ');
            break;
        case ts.SyntaxKind.PlusToken:
            gen('+');
            break;
        case ts.SyntaxKind.EqualsGreaterThanToken:
            gen(' => ');
            break;
        case ts.SyntaxKind.OpenParenToken:
            gen('(');
            break;
        case ts.SyntaxKind.ImportClause:
        case ts.SyntaxKind.ObjectLiteralExpression:
            gen('{');
            gen(' ');
            break;
        case ts.SyntaxKind.Block:
            gen('{');
            gen('\n');
            if (isConstructor) {
                gen('super();');
                gen('\n');
                isConstructor = false;
                break;
            }
            break;
        case ts.SyntaxKind.CloseBraceToken:
            gen('}');
            break;
        case ts.SyntaxKind.CloseParenToken:
            gen(')');
            break;
        case ts.SyntaxKind.OpenBracketToken:
            gen('[');
            break;
        case ts.SyntaxKind.CloseBracketToken:
            gen(']');
            break;
        case ts.SyntaxKind.SemicolonToken:
            gen(';');
            gen('\n');
            break;
        case ts.SyntaxKind.CommaToken:
            gen(',');
            gen(' ');
            break;
        case ts.SyntaxKind.ColonToken:
            gen(' ');
            gen(':');
            gen(' ');
            break;
        case ts.SyntaxKind.DotToken:
            gen('.');
            break;
        case ts.SyntaxKind.DoStatement:
            console.log(node.statement.kind);
            break;
        case ts.SyntaxKind.Decorator:
            isDecorator = true;
            break;
        case ts.SyntaxKind.FirstAssignment:
            gen(' = ');
            break;
        case ts.SyntaxKind.FirstPunctuation:
            gen(' ');
            break;
        case ts.SyntaxKind.PrivateKeyword:
            gen('private');
            gen(' ');
            break;
        case ts.SyntaxKind.PublicKeyword:
            gen('public');
            gen(' ');
            break;
        default:
            break;
    }
}
function transform(code) {
    code.push('\n');
    code.push("(<any>document).registerElement(metadata.selector, " + className + ");");
    return code
        .join('\n');
}
commander
    .option('-f, --file [file]', '*.ts file')
    .parse(process.argv);
(function run() {
    if (!fs.existsSync(commander.file) ||
        !fs.existsSync(path.join(process.cwd(), commander.file))) {
        console.log('err');
        process.exit(1);
    }
    var sourceCode = fs.readFileSync(commander.file);
    var sourceFile = ts.createSourceFile(commander.file, sourceCode.toString(), ts.ScriptTarget.ES2015, true);
    visitNode(sourceFile);
    function getRuleProvider(options) {
        // Share this between multiple formatters using the same options.
        // This represents the bulk of the space the formatter uses.
        var ruleProvider = new ts.formatting.RulesProvider();
        ruleProvider.ensureUpToDate(options);
        return ruleProvider;
    }
    function applyEdits(text, edits) {
        // Apply edits in reverse on the existing text
        var result = text;
        for (var i = edits.length - 1; i >= 0; i--) {
            var change = edits[i];
            console.log(change);
            var head = result.slice(0, change.span.start);
            var tail = result.slice(change.span.start + change.span.length);
            result = head + change.newText + tail;
        }
        return result;
    }
    var options = {
        IndentSize: 4,
        TabSize: 4,
        NewLineCharacter: '\r\n',
        ConvertTabsToSpaces: true,
        InsertSpaceAfterCommaDelimiter: true,
        InsertSpaceAfterSemicolonInForStatements: true,
        InsertSpaceBeforeAndAfterBinaryOperators: true,
        InsertSpaceAfterKeywordsInControlFlowStatements: true,
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        PlaceOpenBraceOnNewLineForFunctions: false,
        PlaceOpenBraceOnNewLineForControlBlocks: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false
    };
    var edits = ts.formatting.formatDocument(sourceFile, getRuleProvider(options), options);
    var generatedCode = transform(code);
    var formatedCode = applyEdits(generatedCode, edits);
    w(commander.file.replace('.ts', '.gen.ts'), generatedCode);
    w(commander.file.replace('.ts', '.gen.fmt.ts'), formatedCode);
    // processString('', generatedCode, {tsconfig: true} as Options).then( formatedCode => {
    //   fs.writeFileSync(commander.file.replace('.ts', '.gen.ts'), formatedCode.dest, {
    //     encoding: 'utf-8'
    //   });
    // });
    w('test/ast.txt', _log.join('\n'));
}());
