export class Validation {

    static EMAIL_REGEX = "^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$";
    static NAME_REGEX = "^[a-zA-Z ']+$";

    static validate(data, rules) {
        let errors: any = {};

        for (let prop in rules) {
            let r = rules[prop];

            let displayName = typeof r['displayName'] != 'undefined' ? r['displayName'] : prop;

            if (r['required']) {
                if (!data[prop]) {
                    //errors.push({ field: prop, error: displayName + ' is required.' });
                    errors[prop] = { field: prop, error: displayName + ' is required.' };
                    continue;
                }
            } else {
                // if not required, but doesn't exist, skip
                if (!data[prop]) {
                    continue;
                }
            }

            let propVal = data[prop];

            if (r['regex']) {
                let regex = new RegExp(r['regex']);
                if (!regex.test(propVal)) {
                    //errors.push({ field: prop, error: displayName + ' is invalid' });
                    errors[prop] = { field: prop, error: displayName + ' is invalid' };
                    continue;
                }
            }

            if (r['type']) {
                switch (r['type']) {
                    case 'string':
                        if (typeof propVal != 'string') {
                            //errors.push({ field: prop, error: displayName + ' must be a string' });
                            errors[prop] = { field: prop, error: displayName + ' must be a string' };
                            continue;
                        }
                        break;

                    case 'number':
                        if (typeof propVal != 'number') {
                            //errors.push({ field: prop, error: displayName + ' must be a number' });
                            errors[prop] = { field: prop, error: displayName + ' must be a number' };
                            continue;
                        }
                        break;

                    case 'any':
                        continue;

                    default:
                        //errors.push({ field: prop, error: displayName + ' has unknown type "' + r['type'] + '"' });
                        errors[prop] = { field: prop, error: displayName + ' has unknown type "' + r['type'] + '"' };
                        continue;
                }
            }

            if (r['minLength']) {
                if (propVal.length < r['minLength']) {
                    //errors.push({ field: prop, error: displayName + ' must be at least ' + r['minLength'] + ' characters.' });
                    errors[prop] = { field: prop, error: displayName + ' must be at least ' + r['minLength'] + ' characters.' };
                    continue;
                }
            }

            if (r['maxLength']) {
                if (propVal.length > r['maxLength']) {
                    //errors.push({ field: prop, error: displayName + ' must be no more than ' + r['maxLength'] + ' characters.' });
                    errors[prop] = { field: prop, error: displayName + ' must be no more than ' + r['maxLength'] + ' characters.' };
                    continue;
                }
            }

            if (r['mustMatch']) {
                if (propVal != data[r['mustMatch']]) {
                    //errors.push({ field: prop, error: displayName + ' must be the same as ' + r['mustMatch'] + '.' });
                    errors[prop] = { field: prop, error: displayName + ' must be the same as ' + r['mustMatch'] + '.' };
                    continue;
                }
            }
        }

        return (Object.keys(errors).length) > 0 ? errors : true;
    }

    static formatErrors(errors, separator) {
        let base = '', sep = '';
        Object.keys(errors).forEach(k => {
            let e = errors[k];
            base += sep + e.error;
            sep = separator;
        });

        // errors.forEach(e => {
        //     base += sep + e.error;
        //     sep = separator;
        // });
        return base;
    }

}

export const ValidationUtils = {

    isValidEmail(str: string) {
        return str ? /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(str) : false;
    },

    isValidUsername(str: string) {
        return (str && str.length >= 2) ? /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(str) : false;
    },

    isValidPassword: (str: string) => {
        return str ? /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(str) : false;
        ///^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(str) : false;
    }

}


export const assertParams = (body, params: Array<string>, optionalParams?: Array<string>): any => {
    let missingParams = [];
    let paramVals = {};

    for (const p of params) {
        if (!body[p] && typeof body[p] == 'undefined') missingParams.push(p);
        else paramVals[p] = body[p];
    }

    if (missingParams.length) {
        throw new Error('Missing required parameters: ' + missingParams.join(', '));
    }

    if (optionalParams) {
        for (const p of optionalParams) {
            if (typeof body[p] != 'undefined') paramVals[p] = body[p];
        }
    }

    return paramVals;
}

/* USAGE:
   const data = {
        firstname: this.inputFirstname.value,
        lastname: this.inputLastname.value,
        email: this.inputEmail.value,
        password: this.inputPassword.value,
        confirmPassword: this.inputPasswordConfirm.value
    };

    const rules = {
        firstname: { required: true, type: 'string', minLength: 2, maxLegth: 40, regex: Validation.NAME_REGEX, displayName: "First name" },
        lastname: { required: true, type: 'string', minLength: 2, maxLegth: 40, regex: Validation.NAME_REGEX, displayName: "Last name" },
        email: { required: true, type: 'string', minLength: 6, maxLegth: 40, regex: Validation.EMAIL_REGEX, displayName: "Email" },
        password: { required: true, type: 'string', minLength: 8, maxLegth: 20, displayName: "Password" },
        confirmPassword: { required: true, type: 'string', minLength: 8, maxLegth: 20, displayName: "Password confirmation" }

    }

    let vr = Validation.validate(data, rules);
    if (vr !== true) {
        return this.setState({ formErrors: vr });
    }
*/