import * as repl from 'repl';

declare module 'repl' {
    interface REPLServer{
        context: any
    }
}
