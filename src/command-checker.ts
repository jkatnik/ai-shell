import * as color from 'kleur';

const checkCommand = (command: string): string => {
  const dangerousInputs: string[] = [
    'rm',
    'rmdir',
    'sudo',
  ];

  let fixedCommand = command;

  dangerousInputs.forEach((input) => {
    const regex = new RegExp(`\\b${input}\\b`, 'g');
    fixedCommand = fixedCommand.replace(regex, color.red(input));
  });
  return fixedCommand;
};
export default checkCommand;
