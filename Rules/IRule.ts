export interface IRule{
    Message:object;
    Execute(): Promise<Boolean>;
    FailureMessage:string;
    ExcetutionLevel:number;
    IsRequired:Boolean;
    RulePassed:Boolean;
}

