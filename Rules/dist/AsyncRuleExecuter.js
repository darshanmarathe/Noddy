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
const _ = require("lodash");
class AsyncRuleExecuter {
    constructor(rules, BreakOnFail = false) {
        this.rules = rules;
        this.BreakOnFail = BreakOnFail;
    }
    ExecuteAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            let arrReturn = [];
            let depth = 0;
            depth = _.maxBy(this.rules, (x) => x.ExcetutionLevel).ExcetutionLevel;
            for (let index = 0; index <= depth; index++) {
                let batch = this
                    .rules
                    .filter(item => {
                    return item.ExcetutionLevel == index;
                });
                console.log("batch with no " + index);
                try {
                    let arr = yield this.ExectueBatch(batch);
                    console.log("batch with no " + index + " is processed.");
                    arrReturn = arrReturn.concat(arr);
                }
                catch (error) {
                    arrReturn = arrReturn.concat(batch);
                    return arrReturn;
                }
            }
            ;
            return arrReturn;
        });
    }
    ExectueBatch(batchRules) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (batchRules.length == 0) {
                    resolve(batchRules);
                }
                let Promises = [];
                batchRules.forEach((rule) => __awaiter(this, void 0, void 0, function* () {
                    Promises.push(rule.Execute());
                }));
                Promise
                    .all(Promises)
                    .then((results) => {
                    if (this.BreakOnFail) {
                        var failed = results
                            .filter(x => x == false)
                            .length > 0;
                        if (failed)
                            reject("Batch failed");
                    }
                    resolve(batchRules);
                })
                    .catch(ex => {
                    console.log(ex);
                    resolve(batchRules);
                });
            });
        });
    }
}
exports.AsyncRuleExecuter = AsyncRuleExecuter;
//# sourceMappingURL=AsyncRuleExecuter.js.map