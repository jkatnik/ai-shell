export enum CmdLineOption {
  HELP, NEW_CONTEXT, SEARCH_IN_GOOGLE, COMMAND, QUESTION
}

export type UserAction = 'Execute' | 'Type' | 'Refine' | 'Cancel' | 'AskQuestion'
