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
commander
    .option('-f, --file [file]', 'Entry *.ts file')
    .parse(process.argv);
function run() {
    if (!fs.existsSync(commander.file) ||
        !fs.existsSync(path.join(process.cwd(), commander.file))) {
        console.log('err');
        process.exit(1);
    }
    else {
        files = [commander.file];
    }
    var template = fs.readFileSync(commander.file);
    var extractImports = , s =  * ({ s:  * (), w:  | , : function () { }, s:  *  }), s =  * from, s =  * ('|")(@|\w|/|\.)*("|'), s =  * ;
    ;
    var extractConstructor = /constructor\([\s\w\W]+?}/;
    var extractMethods = /constructor\([\s\w\W]+?}/;
    console.log(template.toString());
    var program = ts.createProgram(files, {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015
    });
    var sourceFiles = program.getSourceFiles() || [];
    var __codeGen_extends = new Map();
    var __codeGen_members = new Map();
    sourceFiles.map(function (file) {
        ts.forEachChild(file, function (node) {
            (node.decorators || []).filter(function (decorator) {
                return decorator.expression.expression.text === 'Component';
            })
                .map(function (n) { return node; })
                .forEach(function (node) {
                d(node);
            });
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
