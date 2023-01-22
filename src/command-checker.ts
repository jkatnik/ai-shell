import * as color from 'kleur';
const checkCommand = (command: string): string => {
  const dangerousInputs: string[] = [
    'rm',
    'rmdir',
    'sudo',
  ];

  dangerousInputs.forEach((input) => {
    const regex = new RegExp(input, "g");
    command = command.replace(regex, color.red(input));
  });
  return command;
}
export default checkCommand;
