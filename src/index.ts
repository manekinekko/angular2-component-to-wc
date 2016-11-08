import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as ts from 'typescript';
import { processString, Options } from 'typescript-formatter';

let d = (node: Node) => console.log(util.inspect(node, { showHidden: true, depth: 10 }));
let w = (f, text) => fs.writeFileSync(f, text, { encoding: 'utf-8' });
let _log: string[] = [];
let log = (...text) => _log.push(text.join(''));
let code: string[] = [];
let gen = (function() {
  let tmp: typeof code = [];

  return (token) => {
    if (token === '\n') {
      code.push(tmp.join(''));
      tmp = [];
    }
    else {
      tmp.push(token);
    }
    return code;
  }
}());
let syntaxKindToName = (kind: ts.SyntaxKind) => (<any>ts).SyntaxKind[kind];
function visitNode(node:any, depth = 0) {    
  log(
    new Array(depth + 1).join('----'), 
    syntaxKindToName(node.kind), 
    node.text ? `[${node.text}]` : ''
  );

  recognize(node);
  depth++;
  node.getChildren().forEach(c=> visitNode(c, depth));
}
let patchClassOpenBlock = false;
let className = '';
let isConstructor = false;
let isDecorator = false;

function recognize(node: any) {
  
  switch(node.kind) {
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
      console.log( (<ts.IterationStatement>node).statement.kind);
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
function transform(code: string[]) {
  code.push('\n');
  code.push(`(<any>document).registerElement(metadata.selector, ${className});`);
  return code
    //.filter((stm: string) => stm.indexOf('@angular') === -1)
    .join('\n');
}

commander
  .option('-f, --file [file]', '*.ts file')
  .parse(process.argv);

(function run() {

  if(
    !fs.existsSync(commander.file) ||
    !fs.existsSync(path.join(process.cwd(), commander.file))
  ) {
    console.log('err');
    process.exit(1);
  }

  let sourceCode = fs.readFileSync(commander.file);
  let sourceFile = ts.createSourceFile(commander.file, sourceCode.toString(), ts.ScriptTarget.ES2015, true);
  visitNode(sourceFile);

  function getRuleProvider(options: ts.FormatCodeOptions) {
      // Share this between multiple formatters using the same options.
      // This represents the bulk of the space the formatter uses.
      var ruleProvider = new (<any>ts).formatting.RulesProvider();
      ruleProvider.ensureUpToDate(options);
      return ruleProvider;
  }
  function applyEdits(text: string, edits: ts.TextChange[]): string {
      // Apply edits in reverse on the existing text
      var result = text;
      for (var i = edits.length - 1; i >= 0; i--) {
          var change = edits[i];
          console.log(change)
          var head = result.slice(0, (<any>change).span.start);
          var tail = result.slice((<any>change).span.start + (<any>change).span.length )
          result = head + (<any>change).newText + tail;
      }
      return result;
  }

  let options: any = {
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

  let edits = (<any>ts).formatting.formatDocument(sourceFile, getRuleProvider(options), options);
  
  
  let generatedCode: string = transform(code);
  let formatedCode = applyEdits(generatedCode, edits);

  w(commander.file.replace('.ts', '.gen.ts'), generatedCode);
  w(commander.file.replace('.ts', '.gen.fmt.ts'), formatedCode);


  // processString('', generatedCode, {tsconfig: true} as Options).then( formatedCode => {

  //   fs.writeFileSync(commander.file.replace('.ts', '.gen.ts'), formatedCode.dest, {
  //     encoding: 'utf-8'
  //   });
  // });

  w('test/ast.txt', _log.join('\n'));

}());