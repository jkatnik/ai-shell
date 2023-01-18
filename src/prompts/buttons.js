'use strict';

const color = require('kleur');
const { cursor } = require('sisteransi');
const Prompt = require('prompts/lib/elements/prompt');
const SelectPrompt = require('prompts/lib/elements/select')
const {style, clear, entriesToDisplay} = require('prompts/lib/util');

class ButtonsPrompt extends SelectPrompt {
  constructor(opts={}) {
    super(opts);
  }

  up() { }

  down() { }

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

    let { startIndex, endIndex } = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage);

    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.done ? this.selection.title : this.selection.disabled
          ? color.yellow(this.warn) : color.gray(this.hint)
    ].join(' ');

    // Print choices
    if (!this.done) {
      this.outputText += '\n';
      let description = false;
      for (let i = startIndex; i < endIndex; i++) {
        let title, desc = '', v = this.choices[i];

        const buttonLabel = ` ${v.title} `
        const focusedBtn = v.disabled ? color.bgWhite().grey                  : color.bgWhite().red
        const blurredBtn = v.disabled ? color.bgWhite().black().strikethrough : color.bgBlue().white

        title = this.cursor === i ? focusedBtn(buttonLabel) : blurredBtn(buttonLabel);
        if (v.description && this.cursor === i) {
          description = v.description;
        }

        this.outputText += ` ${title}${color.gray(desc)} `;
      }
      if (description) {
        this.outputText += `\n ${description}`;
      }
    }

    this.out.write(this.outputText);
  }
}

module.exports = ButtonsPrompt;
