import {encode} from 'gpt-3-encoder';

export const countTokens = (question: string) => encode(question).length