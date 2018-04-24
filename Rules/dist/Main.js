"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rules = require("./Rules");
const AsyncRuleExecuter_1 = require("./AsyncRuleExecuter");
(() => __awaiter(this, void 0, void 0, function* () {
    let message = {
        username: "darshanmarathe@gmail.com",
        password: "snake@3454",
        FirstName: "Darshan",
        LastName: "Darshan"
    };
    let rule1 = new rules.UniqueEmailRule(1, true);
    rule1.Message = message;
    let rule2 = new rules.PasswordNotUsedPreviouslyRule(2, true);
    rule2.Message = message;
    let rule3 = new rules.PasswordCompilenceRule(2, true);
    rule3.Message = message;
    let rule4 = new rules.UserFirstAndLastNameShouldNotMatchRule(3, true);
    rule4.Message = message;
    let executer = new AsyncRuleExecuter_1.AsyncRuleExecuter([rule1, rule2, rule3, rule4], true);
    var output = yield executer.ExecuteAsync();
    let passedRules = output.filter((x) => x.RulePassed == true).length;
    let failededRules = output.filter((x) => x.RulePassed == false);
    failededRules.forEach(r => console.log(r.FailureMessage));
    console.log(`passed rules ${passedRules}`);
    console.log(`failed rules ${failededRules.length}`);
}))();
//# sourceMappingURL=Main.js.map