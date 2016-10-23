import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as ts from 'typescript';

let printAST = false;
let files = [];
let d = (node) => {
  console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};
let code = [];
let indentation = 0;

function syntaxKindToName(kind: ts.SyntaxKind) {
    return (<any>ts).SyntaxKind[kind];
}
function printAllChildren(node: ts.Node, depth = 0) {
    
    if (printAST && depth > 0) {
      console.log(
        new Array(depth + 1).join('----'), 
        syntaxKindToName(node.kind), 
        node.text ? `[${node.text}]` : ''
      );
    }
    gen(recognize(node));
    depth++;
    node.getChildren().forEach(c=> printAllChildren(c, depth));
}
let patchClassOpenBlock = false;
let className = '';
let isConstructor = false;
function recognize(node: ts.Node) {
  
  switch(syntaxKindToName(node.kind)) {
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
  let space = '';
  //for (let i=0;i<indentation; i++) space += ' ';
  //const space = Array(indentation).fill('++').map((_, i) => ' ').join(',');
  return space;
}

commander
.option('-f, --file [file]', 'Entry *.ts file')
.parse(process.argv);

function run() {
  if(
    !fs.existsSync(commander.file) ||
    !fs.existsSync(path.join(process.cwd(), commander.file))
  ) {
    console.log('err');
    process.exit(1);
  }

  let program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.ES2015
  });

  let sourceCode = fs.readFileSync(commander.file);
  let sourceFile = ts.createSourceFile('foo.ts', sourceCode.toString(), ts.ScriptTarget.ES2015, true);
  printAllChildren(sourceFile);
  gen('\n');
  gen(`document.registerElement(metadata.selector, ${className});`);
  
  if (!printAST) {
    console.log(transform(code).join(''));
  }

  process.exit();
}


run();
