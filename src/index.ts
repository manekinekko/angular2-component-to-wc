import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as ts from 'typescript';

let files = [];
let d = (node) => {
  console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};

function syntaxKindToName(kind: ts.SyntaxKind) {
    return (<any>ts).SyntaxKind[kind];
}
function printAllChildren(node: ts.Node, depth = 0) {
    console.log(
      new Array(depth + 1).join('----'), 
      syntaxKindToName(node.kind), 
      node.text ? `[${node.text}]` : '',
      node.name ? `[${node.name.text}]` : '',
      node.expression ? `[${node.expression.text}]` : ''
    );
    depth++;
    node.getChildren().forEach(c=> printAllChildren(c, depth));
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

  let program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.ES2015
  });

  let sourceCode = fs.readFileSync(commander.file);
  let sourceFile = ts.createSourceFile('foo.ts', sourceCode.toString(), ts.ScriptTarget.ES2015, true);
  printAllChildren(sourceFile);
  process.exit();

  let sourceFiles = program.getSourceFiles() || [];
  let __codeGen_extends = new Map();
  let __codeGen_members = new Map();

  sourceFiles.map((file) => {

    ts.forEachChild(file, (node: any) => {
      const nn = (node.decorators || []).filter( decorator => {
        return decorator.expression.expression.text === 'Component';
      })
      .map(n => node);

      const mm = nn.filter(n => n.members && n.members.length > 0);
      d(mm);
      

      if ( node.name && node.name.text === 'WcElement' ) {
        if ( node.heritageClauses ) {


          node.heritageClauses.forEach( hcNode => {
            node.heritageClauses.forEach( typeNode => {
              typeNode.types.forEach( parentClass => {
                d(parentClass.expression.text);
                __codeGen_extends.set(parentClass.expression.text, parentClass);
              });
            })
          });

        }

        if ( node.members ) {

        }

        d(node);


      }
    });


  });

}


run();
