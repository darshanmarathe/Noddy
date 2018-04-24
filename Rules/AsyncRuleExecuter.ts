import {IRule} from './IRule';
import {IRuleEngine} from './IEngine';
const _ = require("lodash");

export class AsyncRuleExecuter implements IRuleEngine {
    constructor(private rules : Array < IRule >, public BreakOnFail = false) {}

    async ExecuteAsync() : Promise < Array < IRule >> {
        let arrReturn: Array < IRule > = [];
        let depth = 0;

        depth = _.maxBy(this.rules, (x : IRule) => x.ExcetutionLevel).ExcetutionLevel;
        for (let index = 0; index <= depth; index++) {
            let batch = this
                .rules
                .filter(item => {
                    return item.ExcetutionLevel == index;

                });
            console.log("batch with no " + index);
            try {
                let arr = await this.ExectueBatch(batch);
                console.log("batch with no " + index + " is processed.");
                arrReturn = arrReturn.concat(arr);

            } catch (error) {
                arrReturn = arrReturn.concat(batch);
                return arrReturn;
            }

        };
        return arrReturn;
    }

    async ExectueBatch(batchRules : Array < IRule >) : Promise < Array < IRule >> {
        return new Promise < Array < IRule >> ((resolve, reject) => {
            if (batchRules.length == 0) {
                resolve(batchRules);
            }
            let Promises : any = []
            batchRules.forEach(async rule => {
                Promises.push(rule.Execute());
            });
            Promise
                .all(Promises)
                .then((results) => {
                    if (this.BreakOnFail) {
                        var failed = results
                            .filter(x => x == false)
                            .length > 0
                        if(failed)
                            reject("Batch failed")
                    }
                    resolve(batchRules);
                })
                .catch(ex => {
                    console.log(ex);
                    resolve(batchRules);
                })

        });
    }
}