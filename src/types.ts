export enum CmdLineOption {
  HELP = 'HELP',
  NEW_CONTEXT = 'NEW_CONTEXT',
  SEARCH_IN_GOOGLE = 'SEARCH_IN_GOOGLE',
  COMMAND = 'COMMAND',
  QUESTION = 'QUESTION',
}

export type UserAction = 'Execute' | 'Type' | 'Refine' | 'Cancel' | 'AskQuestion'