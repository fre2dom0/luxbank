const { Router, application } = require("express")
const usersData = require("../../database/schemas/users")
const userBalance = require("../../database/schemas/userBalance")
const cardApplications = require("../../database/schemas/cardApplications")
const userCards = require("../../database/schemas/cards")
const creditApplication = require("../../database/schemas/creditApplications")
const moneyHistory = require("../../database/schemas/moneyHistory")
const adminProcessHistory = require("../../database/schemas/adminProcessHistory")
const creditsDB = require("../../database/schemas/credits")
const carouselDB = require("../../database/schemas/carousel")
const router = Router()

router.post("/data", async (req, res) => {
    const user = await usersData.findById(req.session.user.id)
    const balance = await userBalance.findOne({userID: req.session.user.id})
    const data = {
        user,
        balance
    }
    // console.log(`[DATA TRANSFER SESSION] ${JSON.stringify(req.session.user)}`)
    // console.log(`[/DATA TRANSFER] ${JSON.stringify(data)}`)
    res.status(200).json(data)
})

router.post("/users", async (req, res) => {
    const users = await usersData.find({})
    const balances = await userBalance.find({})
    const cards = await userCards.find({})
    // users.forEach((item, i) => {
    //     console.log(`${i}. USER : ${item}`)
    // })
    // balances.forEach((item, i) => {
    //     console.log(`${i}. BALANCE : ${item}`)
    // })
    // cards.forEach((item, i) => {
    //     console.log(`${i}. CARDS : ${item}`)
    // })
    const datas = {
        users,
        balances,
        cards
    }
    res.status(200).json(datas)
})

router.post("/adminprocesshistory", async (req, res) => {
    const data = await adminProcessHistory.find({})
    res.status(200).json(data)
})

router.post("/adminapplicationslist", async (req, res) => {
    const cardApplicationData = await cardApplications.find({isAccepted: "waiting"});
    // console.log(`[WAITING CARD APPLICATIONS] ${cardApplicationData}`)
    const userIDs = cardApplicationData.map(item => item.userID);
    const users = await usersData.find({ _id: { $in: userIDs } });
    const balances = await userBalance.find({ userID: { $in: userIDs } });

    const data = {
        cardApplicationData,
        users,
        balances,
    }
    res.status(200).json(data)
})

router.post("/adminmoneyhistory", async (req, res) => {
    const data = await moneyHistory.find({})
    res.status(200).json(data)
})

router.post("/credits", async (req, res) => {
    const data = await creditsDB.find({})
    res.status(200).json(data)
})

router.post("/creditsactive", async (req, res) => {
    const data = await creditsDB.find({creditActive: true})
    res.status(200).json(data)
})

router.post("/creditapplications", async (req, res) => {
    const creditapplications = await creditApplication.find({isAccepted: "waiting"});
    const userIds = creditapplications.map(application => application.userID);
    const creditIds = creditapplications.map(application => application.creditID);
    
    const balances = await userBalance.find({ userID: { $in: userIds } });
    const users = await usersData.find({ _id: { $in: userIds } });
    const credit = await creditsDB.find({ _id: { $in: creditIds } });
    
    // console.log('[USERS]', users);
    // console.log('[CREDIT]', credit); 
    // console.log('[BALANCES]', balances);
    const data = {
        creditapplications,
        balances,
        users,
        credit,
    }
    // console.log(data)
    res.status(200).json(data)
})

router.post("/carouselsadmin", async (req, res) => {
    const carousel = await carouselDB.find({})
    res.status(200).json(carousel)
})
router.post("/carousels", async (req, res) => {
    const carousel = await carouselDB.find({active: true})
    res.status(200).json(carousel)
})



module.exports = router