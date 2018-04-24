import {IRule} from './IRule';
var collections = ["users", "nodds"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var DBPATH = "mongodb://localhost:27017/noddydb";
var db = require("mongojs")(DBPATH, collections);

export class UniqueEmailRule implements IRule {
    Message : any;
    RulePassed : Boolean = false;

    constructor(public ExcetutionLevel : number, public IsRequired : Boolean) {}
    async Execute() : Promise < Boolean > {

        return new Promise < Boolean > ((resolve, reject) => {
            setTimeout(() => {

                if (this.Message.username == undefined || this.Message.username == null) {
                    this.FailureMessage = "UniqueEmailRule Filed : No email provided";
                    reject(new Error(this.FailureMessage));
                }

                return db
                    .users
                    .find({
                        'Email': this.Message.username
                    }, (err : Error, docs : any[]) => {
                        if (docs.length > 0) {
                            this.FailureMessage = "UniqueEmailRule Filed : User Exist";
                            resolve(false);
                        }
                        this.RulePassed = true;
                        resolve(true)
                    });

            }, 2000);
        });
    }
    FailureMessage : string;
}

export class PasswordCompilenceRule implements IRule {
    Message : any;
    RulePassed : Boolean = false;
    constructor(public ExcetutionLevel : number, public IsRequired : Boolean) {}
    async Execute() : Promise < Boolean > {

        return new Promise < Boolean > ((resolve, reject) => {

            setTimeout(() => {

                if (this.Message.password.length < 8) {
                    this.FailureMessage = "PasswordCompilenceRule :: Password too short";
                    resolve(false);
                }
                if (this.Message.password.indexOf('@') == 0) {
                    this.FailureMessage = "PasswordCompilenceRule :: Password should have magic charector";
                    resolve(false);
                }
                if (this.Message.password.toLowerCase() == "12345" || this.Message.password.toLowerCase() == "nimda" || this.Message.password.indexOf(this.Message.username) > 0) {
                    this.FailureMessage = "PasswordCompilenceRule :: Password Dose not match enterprize rules";
                    resolve(false);
                }

                this.RulePassed = true;
                resolve(true);
            }, 3000);
        });
    }
    FailureMessage : string;
}

export class PasswordNotUsedPreviouslyRule implements IRule {
    Message : any;
    RulePassed : Boolean = false;
    private pwdArr : string[] = ["daaae@123", "snake@3454", "2334884@===", "abcde@fgh", "@bc0efsmfm"];
    constructor(public ExcetutionLevel : number, public IsRequired : Boolean) {}
    async Execute() : Promise < Boolean > {

        return new Promise < Boolean > ((resolve, reject) => {
            setTimeout(() => {
                var find = this
                    .pwdArr
                    .findIndex((x) => x === this.Message.password)
                if (find === -1) {
                    this.RulePassed = true;
                    resolve(true);
                } else {
                    this.FailureMessage = "PasswordNotUsedPreviouslyRule :: Password was already used";
                    resolve(false);
                }
            }, 3000);
        });
    }
    FailureMessage : string;
}

export class UserFirstAndLastNameShouldNotMatchRule implements IRule {
    Message : any;
    RulePassed : Boolean = false;
    constructor(public ExcetutionLevel : number, public IsRequired : Boolean) {}
    async Execute() : Promise < Boolean > {

        return new Promise < Boolean > ((resolve, reject) => {
            setTimeout(() => {
                if (this.Message.FirstName != this.Message.LastName) {
                    this.RulePassed = true;
                    resolve(true);
                } else {
                    this.FailureMessage = "UserFirstAndLastNameShouldNotMatchRule :: Firstname and lastname are same";
                    resolve(false);                }
            }, 1000);
        });
    }
    FailureMessage : string;
}