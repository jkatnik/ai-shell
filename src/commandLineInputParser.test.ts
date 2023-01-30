import { Mode, parseCommandLineInput } from './commandLineInputParser';

describe('when parsing command line input', () => {
  describe('positive cases', () => {
    const testCases = [
      {
        input: 'say hello',
        expected: {
          originalInput: 'say hello', mode: Mode.COMMAND, newContext: false, userQuery: 'say hello',
        },
      },
      {
        input: '-n say hello',
        expected: {
          originalInput: '-n say hello', mode: Mode.COMMAND, newContext: true, userQuery: 'say hello',
        },
      },
      {
        input: '-q What is AI',
        expected: {
          originalInput: '-q What is AI', mode: Mode.QUESTION, newContext: false, userQuery: 'What is AI',
        },
      },
      {
        input: '-q -n What is AI',
        expected: {
          originalInput: '-q -n What is AI', mode: Mode.QUESTION, newContext: true, userQuery: 'What is AI',
        },
      },
      {
        input: '-qn What is AI',
        expected: {
          originalInput: '-qn What is AI', mode: Mode.QUESTION, newContext: true, userQuery: 'What is AI',
        },
      },
      {
        input: '-nq What is AI',
        expected: {
          originalInput: '-nq What is AI', mode: Mode.QUESTION, newContext: true, userQuery: 'What is AI',
        },
      },
      {
        input: '-g foo bar',
        expected: {
          originalInput: '-g foo bar', mode: Mode.SEARCH_IN_GOOGLE, newContext: false, userQuery: 'foo bar',
        },
      },
      {
        input: '-g',
        expected: {
          originalInput: '-g', mode: Mode.SEARCH_IN_GOOGLE, newContext: false, userQuery: '',
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} for input ${input}`, () => {
        expect(parseCommandLineInput(input)).toEqual(expected);
      });
    });
  });

  describe('negative cases', () => {
    const invalidTestCases = ['-x', '-q -g', '-q -h', '-g -h'];
    invalidTestCases.forEach((input) => {
      it(`should exit with error for invalid input ${input}`, () => {
        // given
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => ({} as never));
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => ({} as never));

        // when
        parseCommandLineInput(input);

        // then
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ERROR:'));

        consoleSpy.mockRestore();
        exitSpy.mockRestore();
      });
    });
  });
});
