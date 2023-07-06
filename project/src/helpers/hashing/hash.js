const bcrypt = require("bcryptjs")

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(password, salt)
}

const comparePassword = (raw, hash) => {
    return bcrypt.compareSync(raw, hash)
}


module.exports = {
    hashPassword,
    comparePassword,
}