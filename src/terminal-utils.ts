const clearLastLine = () => {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
};

export default clearLastLine;
