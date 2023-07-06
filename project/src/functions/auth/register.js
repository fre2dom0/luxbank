const userData = require("../../database/schemas/users")
const balanceData = require("../../database/schemas/userBalance")
const path = require("node:path")
const srcPath = require("../../helpers/srcPath")
const {hashPassword} = require("../../helpers/hashing/hash")
const ibanProducer = require("../../helpers/producers/iban.js")

const register = async ( name, surname, email, password, tel, birthDate, gender, identityNumber, street, district, city, country) => {
    try{
        const userDB = await userData.findOne({$or : [{email}, {tel}, {identityNumber}]})
        if(userDB){
            if(userDB.identityNumber == identityNumber) console.log("[---[---[THERE IS A USER AT THIS ID]---]---]")
            else if(userDB.tel == tel) console.log("[---[---[THERE IS A USER AT THIS TEL NUMBER]---]---]")
            else if(userDB.email == email) console.log("[---[---[THERE IS A USER AT THIS TEL EMAIL]---]---]")
            return false
        } else {
            //CALCULATING AGE
            const [year, month, day] = birthDate.split("-")
            const currentDate = new Date()
            const birth = new Date(year, month, day);
            let ageCalculate = currentDate.getFullYear() - birth.getFullYear();
            
            // console.log(`[CURRENT DATE YEAR] ${currentDate.getFullYear()} - [BIRTH DATE year] ${birth.getFullYear()}`)
            // console.log(`[CURRENT DATE MONTH] ${currentDate.getMonth() + 1} - [BIRTH DATE MONTH] ${birth.getMonth()}`)
            // console.log(`[CURRENT DATE DAY] ${currentDate.getDate()} - [BIRTH DATE DAY] ${birth.getDate()}`)
            // console.log(`[AGE CALCULATE] ${ageCalculate}`)   
    
            // CHECKING BIRTH MONTH AND DAY LOWER THAN CURRENT MONTH AND DAY
            if (currentDate.getMonth() + 1 < birth.getMonth() || (currentDate.getMonth() + 1 == birth.getMonth() && currentDate.getDate() < birth.getDate())) {
                ageCalculate--
                // console.log(`[NEW AGE] ${ageCalculate}`)
            }
            const age = ageCalculate

            //Hashing
            const hashedPassword = hashPassword(password)
            const ibans = await balanceData.find({}, { iban: 1 })
            const iban = ibanProducer(ibans)
            const newUser = await userData.create({name, surname, email, password : hashedPassword, tel, birthDate, age, gender, identityNumber, address: {
                street,
                district,
                city,
                country,
            }})
            console.log(`[NEW USER] ${newUser}`)
            const newUserBalance = await balanceData.create({userID: newUser._id, iban})
            console.log(`[NEW USER BALANCE] ${newUserBalance}`)
            await newUser.save()
            await newUserBalance.save()
            console.log(`[---[---[NEW USER SAVED]---]---]`)
            return true
    
        }
    }
    catch(err){
        throw new Error(`register ${err}`)
    }

}





module.exports = register