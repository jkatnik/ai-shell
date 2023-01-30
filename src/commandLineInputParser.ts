import * as color from 'kleur';

export enum Mode {
  COMMAND = 'COMMAND',
  QUESTION = 'QUESTION',
  SEARCH_IN_GOOGLE = 'GOOGLE',
  HELP = 'HELP'
}
export interface State {
  originalInput: string;
  mode: Mode;

  newContext: boolean;
  userQuery: string;
}

function checkInvalidOptions(options: Set<string>): void {
  if (options.has('h') && options.has('g')) {
    console.log(color.red('ERROR: Cannot combine option h (help) and g (google)!'));
    process.exit(1);
  }

  if (options.has('h') && options.has('q')) {
    console.log(color.red('ERROR: Cannot combine option h (help) and q (question)!'));
    process.exit(1);
  }

  if (options.has('g') && options.has('q')) {
    console.log(color.red('ERROR: Cannot combine option g (google) and q (question)!'));
    process.exit(1);
  }
}

export const parseCommandLineInput = (input: string): State => {
  const state = {
    originalInput: input,
    mode: Mode.COMMAND,
    newContext: false,
    userQuery: input,
  };

  const splitInput = input.split(' ');
  const options = new Set<string>();
  const acceptableOptions = ['n', 'q', 'g', 'h', 'qn', 'nq'];

  while (splitInput.length > 0 && splitInput[0].startsWith('-')) {
    const token = splitInput[0].replace(/^-+/, '');
    if (!acceptableOptions.includes(token)) {
      console.log(`ERROR: Unsupported option ${token}!`);
      process.exit(1);
    }

    options.add(token);
    splitInput.shift();
  }

  checkInvalidOptions(options);

  state.newContext = options.has('n') || options.has('nq') || options.has('qn');

  if (options.has('q') || options.has('qn') || options.has('nq')) {
    state.mode = Mode.QUESTION;
  }

  if (options.has('g')) {
    state.mode = Mode.SEARCH_IN_GOOGLE;
  }

  if (options.has('h')) {
    state.mode = Mode.HELP;
  }

  state.userQuery = splitInput.join(' ');

  return state;
};
