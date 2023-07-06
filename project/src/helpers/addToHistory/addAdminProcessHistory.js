const adminProcessDB = require("../../database/schemas/adminProcessHistory")

const addAdminProcess = async (type, admin, nameInfo, surnameInfo, idInfo, authorizationInfo, updateData, creditname) => {
    // console.log(admin)
    // console.log(`
    // [TYPE] ${type} |
    // [ADMIN INFOS] ${admin.id} - ${admin.name} - ${admin.surname} - ${admin.authorization} |
    // [USER INFOS] ${nameInfo} ${surnameInfo} ${idInfo} |
    // `
    // )
    let data = {}
    if (type == "deleting") {
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization has been deleted by ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }
    }
    else if (type == "adding") {
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization has been added by ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }
    }
    else if (type == "updating") {
        const keys = updateData[0]
        const values = updateData[1]
        let params = {}
        console.log(`[KEYS] ${keys}`)
        console.log(`[VALUES] ${values}`)
        keys.map((item, index) => {
            params = {
                ...Object.fromEntries(
                    keys.map((item, index) => [item, values[index]])
                )
            }
        })
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization has been updated by ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization}.`,
            updatedInformations: params
        }

        // for(let i = 0; i < keys.length; i++){
        //     console.log(`[FOR]`)
        //     console.log(`${keys[i]}: ${values[i]}`)
        // }
    }
    else if (type == "card-application-accepted") {
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization's card application has been accepted ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }
    }
    else if (type == "card-application-cancelled") {
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization's card application has been cancelled ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }
    }
    else if (type == "credit-application-accepted") {
        console.log(`[CREDIT NAMEEEE] ${creditname}`)

        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization's ${creditname} credit application has been accepted ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }
    }
    else if (type == "credit-application-cancelled") {
        console.log(`[CREDIT NAMEEEE] ${creditname}`)
        data = {
            processType: type,
            user: {
                id: idInfo,
                name: nameInfo,
                surname: surnameInfo,
                authorization: authorizationInfo,
            },
            admin: {
                id: admin.id,
                name: admin.name,
                surname: admin.surname,
                authorization: admin.authorization,
            },
            process: `user named ${nameInfo} ${surnameInfo} with id ${idInfo} with ${authorizationInfo} authorization's ${creditname} credit application has been cancelled ${admin.name} ${admin.surname} with id ${admin.id} with auth ${admin.authorization} `
        }    
    }

    await (await adminProcessDB.create(data)).save()
}


module.exports = addAdminProcess