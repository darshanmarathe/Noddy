

import * as rules from './Rules';
import { AsyncRuleExecuter } from './AsyncRuleExecuter';
import { IRule } from './IRule';

let message =  {
    username :"darshanmarathe@gmail.com",
    password : "snake@3454",
    FirstName : "Darshan",
    LastName : "Darshan"
}

var rule1 = new rules.UniqueEmailRule(1, true)  ; rule1.Message = message;
var rule2 = new rules.PasswordNotUsedPreviouslyRule(2, true)  ; rule2.Message = message;
var rule3 = new rules.PasswordCompilenceRule(2, true)  ; rule3.Message = message;
var rule4 = new rules.UserFirstAndLastNameShouldNotMatchRule(3, true)  ; rule4.Message = message;



var executer = new AsyncRuleExecuter([rule1 , rule2 , rule3 , rule4] , false);
(async() => {
    var output:Array<IRule> =  await executer.Execute();
    let passedRules = output.filter((x) => x.RulePassed == true).length;
    let failededRules = output.filter((x) => x.RulePassed == false)
    failededRules.forEach(r => console.log(r.FailureMessage));

    console.log(`passed rules ${passedRules}`);
    console.log(`failed rules ${failededRules.length}`);
})();