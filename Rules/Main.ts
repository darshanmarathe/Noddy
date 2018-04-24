

import * as rules from './Rules';
import { AsyncRuleExecuter } from './AsyncRuleExecuter';
import { IRule } from './IRule';
(async() => {


    let message =  {
        username :"darshanmarathe@gmail.com",
        password : "snake@3454",
        FirstName : "Darshan",
        LastName : "Darshan"
    }
    
    let rule1 = new rules.UniqueEmailRule(1, true)  ; rule1.Message = message;
    let rule2 = new rules.PasswordNotUsedPreviouslyRule(2, true)  ; rule2.Message = message;
    let rule3 = new rules.PasswordCompilenceRule(2, true)  ; rule3.Message = message;
    let rule4 = new rules.UserFirstAndLastNameShouldNotMatchRule(3, true)  ; rule4.Message = message;
    
    
    
    let executer = new AsyncRuleExecuter([rule1 , rule2 , rule3 , rule4] , true);
    
    var output:Array<IRule> =  await executer.ExecuteAsync();
    let passedRules = output.filter((x) => x.RulePassed == true).length;
    let failededRules = output.filter((x) => x.RulePassed == false)
    failededRules.forEach(r => console.log(r.FailureMessage));

    console.log(`passed rules ${passedRules}`);
    console.log(`failed rules ${failededRules.length}`);
})();