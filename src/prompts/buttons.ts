import * as color from 'kleur';
import { cursor } from 'sisteransi';
import { clear, entriesToDisplay, style } from 'prompts/lib/util';

const Prompt = require('prompts/lib/elements/prompt');
const SelectPrompt = require('prompts/lib/elements/select');

export class ButtonsPrompt extends SelectPrompt {
  constructor(opts: { hint?: string } = {
  }) {
    super(opts);
    this.hint = opts.hint || '- Use arrow-keys. Enter to submit.';
    this.up = () => { };
    this.down = () => { };
  }

  left() {
    if (this.cursor === 0) {
      this.moveCursor(this.choices.length - 1);
    } else {
      this.moveCursor(this.cursor - 1);
    }
    this.render();
  }

  right() {
    if (this.cursor === this.choices.length - 1) {
      this.moveCursor(0);
    } else {
      this.moveCursor(this.cursor + 1);
    }
    this.render();
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) {
      this.out.write(cursor.hide);
    } else {
      this.out.write(clear(this.outputText, this.out.columns));
    }
    Prompt.prototype.render.call(this);

    const { startIndex, endIndex } = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage);

    // Print prompt: ? What to do? > use arrow key
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.getPromptSuffix(),
    ].join(' ');

    // Print choices
    if (!this.done) {
      this.outputText += '\n';
      let description = '';
      for (let i = startIndex; i < endIndex; i += 1) {
        const desc = '';
        const v = this.choices[i];

        const buttonLabel = this.cursor === i ? `⟫ ${v.title} ⟪` : `  ${v.title} `;
        const focusedBtn = v.disabled ? color.grey().strikethrough : color.cyan;
        const blurredBtn = v.disabled ? color.grey().strikethrough : color.reset;

        const title = this.cursor === i ? focusedBtn(buttonLabel) : blurredBtn(buttonLabel);
        if (v.description && this.cursor === i) {
          description = v.description;
        }

        this.outputText += ` ${title}${color.gray(desc)} `;
      }
      if (description) {
        this.outputText += `\n ${color.grey(description)}`;
      }
    }

    this.out.write(this.outputText);
  }

  private getPromptSuffix(): string {
    if (this.done) {
      return this.selection.title;
    }
    return this.selection.disabled ? color.yellow(this.warn) : color.gray(this.hint);
  }
}

const noop = (v) => v;

export const toPrompt = (type, args) => new Promise((res, rej) => {
  const p = new ButtonsPrompt(args);
  const onAbort = noop;
  const onSubmit = noop;
  const onExit = noop;
  p.on('state', args.onState || noop);
  p.on('submit', (x) => res(onSubmit(x)));
  p.on('exit', (x) => res(onExit(x)));
  p.on('abort', (x) => rej(onAbort(x)));
});
