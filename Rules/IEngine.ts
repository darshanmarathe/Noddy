import { IRule } from "./IRule";

export interface IRuleEngine{
   
    Execute(): Promise<Array<IRule>>;
    BreakOnFail:Boolean;
}