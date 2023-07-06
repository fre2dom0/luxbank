const { Router } = require("express")
const cardApplicationsDB = require("../database/schemas/cardApplications")
const cardDB = require("../database/schemas/cards")
const srcPath = require("../helpers/srcPath")
const router = Router()

router.get("/", (req, res) => {
  if (req.session && req.session.user && req.session.user.isLogged) {
    if (req.session.user.isLogged == true) {
      res.sendFile(srcPath() + "/templates/cartPages/cardApplication.html")
    }
  }
  else {
    res.redirect("/auth/login")
  }
})

router.post("/application", async (req, res, next) => {
  if (!req.session.application) {
    // Oturumda başvuru verisi yoksa
    const currentTime = new Date().getTime();
    const expirationTime = currentTime + (10 * 1000); // 10 saniye
    // console.log(`[CURRENT TIME] ${currentTime}`);
    // console.log(`[EXPIRATION TIME] ${expirationTime}`);
    // Başvuru verisini oturuma ekle
    req.session.application = {
      expires: expirationTime
    };
    // console.log(`[APPLICATION SESSION] ${JSON.stringify(req.session.application)}`);
    const { type, limit, card } = req.body;
    // console.log(`[APPLICATION] ${type} ${limit} ${card}`);
    const data = {
      userID: req.session.user.id,
      cardInfos: {
        cardType: type,
        cardName: card,
        limit: limit,
      },
      isAccepted: "waiting"
    };
    try {
      // Veritabanına başvuruyu kaydet
      await (await cardApplicationsDB.create(data)).save();
      // Başarılı mesajını gönder
      res.status(201).send(`<script>alert("You successfully applied. You can check the status of your application from your user profile.");location.href="/";</script>`);
      // res.status(201).send({msg : "success"})
    }
    catch (err) {
      console.log(`[AN ERROR OCCURRED ON CARD APPLICATION] ${err}`);
      // Hata durumunda hata mesajını gönder
      res.status(500).send(`<script>location.href="/";alert("An error occurred. Please try again later.");</script>`);
      // res.status(500).json({msg: "error"})
    }
  }
  else {
    // Oturumda başvuru verisi varsa
    const currentTime = new Date().getTime();
    // console.log(`[CONTROL CURRENT TIME] ${currentTime}`);
    // console.log(`[CONTROL EXPIRES TIME] ${req.session.application.expires}`);
    if (currentTime > req.session.application.expires) {
      // Başvuru süresi dolduğunda başvuru verisini sil
      // console.log(`[DELETING APPLICATION SESSION] ${JSON.stringify(req.session.application)}`);
      req.session.application = undefined;
      // console.log(`[DELETED APPLICATION SESSION] ${JSON.stringify(req.session.application)}`);
      // "/card/application" rotasına yönlendir
      res.redirect(307, "/card/application");
    }
    else {
      // Başvuru süresi dolmadıysa beklemesi gerektiğine dair mesaj gönder
      // console.log(`[TIMEOUT]`);
      res.status(200).send(`<script>location.href="/card";alert("You have to wait 10 seconds to do any process.");</script>`);
      // res.status(200).json({msg: "wait"})
    }
  }
  next();
});


router.get("/removecard", async (req, res) => {
  const {id} = req.query;
  try {
    // Kredi kartını id'ye göre bul ve sil
    const card = await cardDB.findByIdAndDelete(id);
    // if(!card) throw new Error("Card Has Not Found")
    // console.log(`[CARD HAS BEEN DELETED] ${card}`)
    // Başarı durumunda başarılı mesajını gönder
    res.status(200).send({msg: "success"});
  }
  catch(err) {
    console.log(`[AN ERROR OCCURRED ON REMOVING CARD] ${err}`);
    // Hata durumunda hata mesajını gönder
    res.status(400).send({msg: "failed"});
  }
});


router.get("/updatecardname", async (req, res) => {
  const {id, value} = req.query;
  try {
    // Kredi kartının adını id'ye göre güncelle
    const card = await cardDB.findByIdAndUpdate(id, { $set: { "cardInfos.cardName": value } });
    // console.log(`[CARD HAS BEEN UPDATED] ${card}`)
    // Başarı durumunda başarılı mesajını gönder
    res.status(200).send({msg: "success"});
  }
  catch(err) {
    console.log(`[AN ERROR OCCURRED ON UPDATING CARD NAME] ${err}`);
    // Hata durumunda hata mesajını gönder
    res.status(400).send({msg: "failed"});
  }
});


router.get("/updatecardlimit", async (req, res) => {
  const {id, value} = req.query;
  try {
    // Kredi kartının limitini id'ye göre güncelle
    const card = await cardDB.findByIdAndUpdate(id, { $set: { "cardInfos.limit": value } });
    // console.log(`[CARD HAS BEEN UPDATED] ${card}`)
    // Başarı durumunda başarılı mesajını gönder
    res.status(200).send({msg: "success"});
  }
  catch(err) {
    console.log(`[AN ERROR OCCURRED ON UPDATING CARD LIMIT] ${err}`);
    // Hata durumunda hata mesajını gönder
    res.status(400).send({msg: "failed"});
  }
});


router.post("/userapplications", async (req, res) => {
  try {
    // Kullanıcının başvurularını kullanıcı kimliğiyle birlikte bul
    const application = await cardApplicationsDB.find({ userID: req.session.user.id });
    if (!application) throw new Error("Application-Has-Not-Found");
    // console.log(`[CARD INFO] ${card}`)
    // Başvuruları başarı durumunda gönder
    res.status(200).json(application);
  }
  catch (err) {
    res.status(400).send({ msg: "no-application-found" });
    // console.log(`[AN ERROR OCCURRED ON CARD DATA] ${err}`);
  }
});

router.post("/card", async (req, res) => {
  try {
    // Kullanıcının kartlarını kullanıcı kimliğiyle birlikte bul
    const card = await cardDB.find({ userID: req.session.user.id });
    // console.log(`[CARD]`)
    if (card == "") throw new Error("Card-Has-Not-Found");
    // console.log(`[CARD INFO] ${card}`)
    // Kartları başarı durumunda gönder
    res.status(200).json(card);
  }
  catch (err) {
    res.status(400).send({ msg: "no-card-found" });
    // console.log(`[AN ERROR OCCURRED ON CARD DATA] ${err}`);
  }
});




module.exports = router
