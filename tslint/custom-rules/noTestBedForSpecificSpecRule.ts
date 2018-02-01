import * as ts from 'typescript';
import * as Lint from 'tslint';
import { IOptions } from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'This kind of unit test must be isolated and doesn\'t use TestBed';
  public static TEST_BED_REGEX: RegExp = /^TestBed.configureTestingModule/;

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new IsolatedUnitTestForBeanWalker(sourceFile, this.getOptions()));
  }
}

class IsolatedUnitTestForBeanWalker extends Lint.RuleWalker {
  private concernedSpecPatterns: RegExp[];

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    this.concernedSpecPatterns = options.ruleArguments.map(regexStr => new RegExp(`${regexStr}`));
  }

  protected visitSourceFile(node: ts.SourceFile) {
    if (this.isConcernedFiles(node)) {
      super.visitSourceFile(node);
    }
  }

  private isConcernedFiles(node: ts.SourceFile): boolean {
    return this.concernedSpecPatterns.some(concernedSpecPattern => concernedSpecPattern.test(node.fileName));
  }

  public visitCallExpression(node: ts.CallExpression) {
    if (Rule.TEST_BED_REGEX.test(node.getText())) {
      this.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
    super.visitCallExpression(node);
  }
}
