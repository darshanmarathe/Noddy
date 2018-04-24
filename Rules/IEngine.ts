import { IRule } from "./IRule";

export interface IRuleEngine{
   
    ExecuteAsync(): Promise<Array<IRule>>;
    BreakOnFail:Boolean;
}