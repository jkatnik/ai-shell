import { describe, expect, test } from '@jest/globals';
import checkCommand from './command-checker';

describe('when testing checkCommand2', () => {
  describe('with safe input', () => {
    test('should return the same command', () => {
      expect(checkCommand('ls -al')).toBe('ls -al');
    });
  });

  describe('with dangerous input', () => {
    const dangerousInputs = [
      'rm',
      'rmdir',
      'sudo',
    ];

    const RED = '\u001b[31m';
    const RESET = '\u001b[39m';

    dangerousInputs.forEach((input) => {
      test(`should return command with "${input}" displayed in red color`, () => {
        const highlightedInput = `${RED}${input}${RESET}`;
        expect(checkCommand(`foo ${input} bar ${input} roo`))
          .toBe(`foo ${highlightedInput} bar ${highlightedInput} roo`);
      });
    });
  });
});
