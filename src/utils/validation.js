const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    if (!firstName || !emailId || !password) {
        throw new Error('First name, email, and password are required');
    }

    if (firstName.length < 3 || firstName.length > 30) {
        throw new Error('First name must be between 3 and 30 characters');
    }

    /* Done at Schema Level, so not required here. */
    /*
    if (!validator.isEmail(emailId)) {
        throw new Error('Invalid email address');
    }
    */

    if (age < 18) {
        throw new Error('Age must be at least 18');
    }

    /* Done at Schema Level, so not required here. */
    /*
       if (gender && !['male', 'female', 'other'].includes(gender)) {
            throw new Error('Gender must be either male, female, or other');
        }
    */

    return true;
};

module.exports = {
    validateSignupData
};