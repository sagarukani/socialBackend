import {Request} from "express";

const Validator = require('validatorjs');

const validatorUtil = (body: any, rules: any, customMessages: any, callback: Function) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors.errors, false));
};

Validator.register('minmax_player', (value: any) => value >= 2 && value <= 9,
    'noOfPlayers is not valid.!')

Validator.registerAsync('maxLen', function (status: any, attribute: any, req: Request, passes: any) {
    if (status.toString().length <= 50) {
        passes();
    } else {
        passes(false, '50 characters max.');
    }
});

export default {
    validatorUtil
}