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
var collections = ["users", "nodds"];
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var DBPATH = "mongodb://localhost:27017/noddydb";
var db = require("mongojs")(DBPATH, collections);
class UniqueEmailRule {
    constructor(ExcetutionLevel, IsRequired) {
        this.ExcetutionLevel = ExcetutionLevel;
        this.IsRequired = IsRequired;
        this.RulePassed = false;
    }
    Execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.Message.username == undefined || this.Message.username == null) {
                        this.FailureMessage = "UniqueEmailRule Filed : No email provided";
                        reject(new Error(this.FailureMessage));
                    }
                    return db
                        .users
                        .find({
                        'Email': this.Message.username
                    }, (err, docs) => {
                        if (docs.length > 0) {
                            this.FailureMessage = "UniqueEmailRule Filed : User Exist";
                            resolve(false);
                        }
                        this.RulePassed = true;
                        resolve(true);
                    });
                }, 2000);
            });
        });
    }
}
exports.UniqueEmailRule = UniqueEmailRule;
class PasswordCompilenceRule {
    constructor(ExcetutionLevel, IsRequired) {
        this.ExcetutionLevel = ExcetutionLevel;
        this.IsRequired = IsRequired;
        this.RulePassed = false;
    }
    Execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
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
        });
    }
}
exports.PasswordCompilenceRule = PasswordCompilenceRule;
class PasswordNotUsedPreviouslyRule {
    constructor(ExcetutionLevel, IsRequired) {
        this.ExcetutionLevel = ExcetutionLevel;
        this.IsRequired = IsRequired;
        this.RulePassed = false;
        this.pwdArr = ["daaae@123", "snake@3454", "2334884@===", "abcde@fgh", "@bc0efsmfm"];
    }
    Execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var find = this
                        .pwdArr
                        .findIndex((x) => x === this.Message.password);
                    if (find === -1) {
                        this.RulePassed = true;
                        resolve(true);
                    }
                    else {
                        this.FailureMessage = "PasswordNotUsedPreviouslyRule :: Password was already used";
                        resolve(false);
                    }
                }, 3000);
            });
        });
    }
}
exports.PasswordNotUsedPreviouslyRule = PasswordNotUsedPreviouslyRule;
class UserFirstAndLastNameShouldNotMatchRule {
    constructor(ExcetutionLevel, IsRequired) {
        this.ExcetutionLevel = ExcetutionLevel;
        this.IsRequired = IsRequired;
        this.RulePassed = false;
    }
    Execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.Message.FirstName != this.Message.LastName) {
                        this.RulePassed = true;
                        resolve(true);
                    }
                    else {
                        this.FailureMessage = "UserFirstAndLastNameShouldNotMatchRule :: Firstname and lastname are same";
                        resolve(false);
                    }
                }, 1000);
            });
        });
    }
}
exports.UserFirstAndLastNameShouldNotMatchRule = UserFirstAndLastNameShouldNotMatchRule;
//# sourceMappingURL=Rules.js.map