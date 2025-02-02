const validateSignupData = (req) => {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
        throw new error("name is not valid");
    }
}

module.exports = {
    validateSignupData
}