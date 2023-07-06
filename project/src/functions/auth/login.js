const userData = require("../../database/schemas/users")
const balanceData = require("../../database/schemas/userBalance")
const {comparePassword} = require("../../helpers/hashing/hash")

const login = async (identityNumber, password) => {
    try{
        console.log(`[SEARCHING FOR USER]`)
        const userDB = await userData.findOne({ identityNumber });
        console.log(userDB)
        if(!userDB) throw new Error(`$USER-HAS-NOT-FOUND`)
        const isValid = comparePassword(password, userDB.password)
        if(!isValid)  throw new Error(`$PASSWORD-IS-NOT-CORRECT`)
        let userBalance  = await balanceData.findOne({userID: userDB._id})
        if(!userBalance){
            const newUserBalance = await balanceData.create({userID: newUser._id})
            await newUserBalance.save()
            userBalance = await userData.findOne({userID: userDB._id})
        }
        const respond = {
            id: userDB._id,
            name: userDB.name,
            surname: userDB.surname,
            email: userDB.email,
            tel: userDB.tel,
            birthDate: userDB.birthDate,
            age: userDB.age,
            gender: userDB.gender,
            identityNumber: userDB.identityNumber,
            authorization: userDB.authorization,
            address: userDB.address,
            money: userBalance.balance,
            debt: userBalance.debts,
            iban: userBalance.iban,
            createdAt: userDB.createdAt,
            isLogged: true,
        }
        // console.log(`[RESPOND] ${respond}`)
        return respond
    }
    catch(err){
        console.log(`[AN ERROR OCCURRED ON LOGIN] ${err}`)
        const respond = {
            id: null,
            name: null,
            surname: null,
            email: null,
            tel: null,
            birthDate: null,
            age: null,
            gender: null,
            identityNumber: null,
            authorization: null,
            money: null,
            debt: null,
            createdAt: null,
            isLogged: false
        }
        return respond
    }
}





module.exports = login