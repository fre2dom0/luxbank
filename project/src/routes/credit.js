const { Router } = require("express")
const srcPath = require("../helpers/srcPath")
const creditApplicationsDB = require("../database/schemas/creditApplications")
const creditsDB = require("../database/schemas/credits")
const balancesDB = require("../database/schemas/userBalance")
const Decimal128 = require('mongodb').Decimal128;
const moment = require('moment');

const router = Router()

router.get("/", (req, res) => {
  if (req.session && req.session.user && req.session.user.isLogged) {
    if (req.session.user.isLogged == true) {
      res.sendFile(srcPath() + "/templates/creditPages/credit.html")
    }
  }
  else {
    res.redirect("/auth/login")
  }
})

router.get("/creditapply", async (req, res, next) => {
  // Oturumun başvuruyu içermesi durumunda
  if (!req.session.application) {
    // Şu anki zamanı al
    const currentTime = new Date().getTime();
    // Başvurunun sona erme süresini hesapla (10 saniye)
    const expirationTime = currentTime + (10 * 1000);
    // Başvuruyu oturum içerisine ekle
    req.session.application = {
      expires: expirationTime
    }
    try {
      // İstenen kredi kimliğini al
      const { creditID } = req.query;
      // Kullanıcının kimliğini al
      const userID = req.session.user.id;
      // Kullanıcının bakiyesini veritabanından bul
      const balance = await balancesDB.findOne({ userID });
      // console.log(`[CREDIT ID] ${creditID}`);
      // console.log(`[USER ID] ${userID}`);
      // console.log(`[DEBTS] ${JSON.stringify(balance.debts)}`);
      // Kullanıcının zaten başvuruda bulunduğu bir kredisi var mı kontrol et
      const found = balance.debts.find(item => item._id == creditID);
      // console.log(`[FOUND] ${found}`);
      // Eğer zaten krediye sahipse hata fırlat
      if (found) throw new Error("Already-Has");
      else {
        // Kullanıcının aynı kredi için bekleyen bir başvurusu var mı kontrol et
        const apply = await creditApplicationsDB.findOne({ $and: [{ userID }, { creditID }, { isAccepted: "waiting" }] });
        if (apply) throw new Error("Application-Found");
        // Başvuru verilerini oluştur ve veritabanına kaydet
        const data = {
          creditID,
          userID
        }
        await (await creditApplicationsDB.create(data)).save();
        res.status(201).send({ msg: "success" });
      }
    } catch (err) {
      // Başvuru bulunduğunda veya kullanıcı hatalı olduğunda ilgili hataları işle
      if (err.message === "Application-Found") {
        res.status(400).send({ msg: "found" });
      } else if (err.message === "User-Not-Found") {
        res.status(400).send({ msg: "not-found" });
      } else if (err.message === "Already-Has") {
        res.status(400).send({ msg: "already-has" });
      } else {
        res.status(500).send({ msg: "failed" });
      }
      console.log(`[AN ERROR OCCURRED ON CREDIT APPLICATION] ${err.message}`);
    }
  }
  // Başvuru oturumu zaten varsa
  else {
    const { creditID } = req.query;
    const currentTime = new Date().getTime();
    // Başvurunun süresi dolmuşsa
    if (currentTime > req.session.application.expires) {
      // Başvuruyu oturumdan kaldır ve yeniden yönlendir
      req.session.application = undefined;
      res.redirect(307, `/credit/creditapply?creditID=${creditID}`);
    } else {
      // console.log(`[WAIT APPLICATION]`);
      // console.log(`[TIMEOUT]`);
      // Bekleme mesajını dön
      res.status(400).json({ msg: "wait" });
    }
  }
  next();
});


router.get("/paymonth", async (req, res) => {
  // İstek sorgusundan id'yi al
  const { id } = req.query;
  try {
    // Kullanıcının bakiyesini veritabanından bul
    const balance = await balancesDB.findOne({ userID: req.session.user.id });
    // Belirli bir id'ye sahip borcu bul
    const debt = balance.debts.find(item => item._id == id);
    // Borcun ödeme miktarını Decimal128 veri türüne dönüştür
    debt.sumAmountToPay = Decimal128.fromString(debt.sumAmountToPay.toString());
    // Borcun dizindeki konumunu bul
    const index = balance.debts.findIndex(item => item._id == id);
    // Borç bulunamadığında hata fırlat
    if (!debt) throw new Error("No Debt Found");
    // console.log(`[DEBT ${JSON.stringify(debt)}]`);
    // Geçerli tarihi al
    const currentDate = moment();
    // Borç ödeme süresinin 30 gün geçip geçmediğini kontrol et
    const isPast30Days = currentDate.isAfter(debt.paymentTime);
    if (isPast30Days) {
      // console.log(`[DEBT] ${JSON.stringify(debt)}`);
      // console.log(`[INDEX] ${index}`);
      // Yeni bakiyeyi hesapla
      const newBalance = parseFloat(balance.balance).toFixed(2) - parseFloat(debt.paymentAmountPerInterval).toFixed(2);
      const newSumAmountToPay = parseFloat(debt.sumAmountToPay).toFixed(2) - parseFloat(debt.paymentAmountPerInterval).toFixed(2);
      // Borcun yeni toplam ödeme miktarını Decimal128 veri türüne dönüştür
      debt.sumAmountToPay = Decimal128.fromString(newSumAmountToPay.toString());
      // console.log(`[NEW BALANCE] ${newBalance}`);
      // console.log(`[NEW SUM AMOUNT TO PAY] ${newSumAmountToPay}`);
      // Gelecekteki tarihi 30 gün sonraya ayarla
      const futureDate = moment().add(30, 'days');
      // Bakiyeyi güncelle
      balance.balance = newBalance
      // Ödeme sayısını artır
      // console.log(debt.payCount)
      debt.payCount+=1;
      // Ödeme zamanını güncelle
      debt.paymentTime = new Date(futureDate);
      // Borcu bakiye içindeki dizide güncelle
      balance.debts[index] = debt;
      // Bakiyeyi kaydet
      await balance.save();
      // Oturumdaki kullanıcının bakiye ve borç bilgilerini güncelle
      req.session.user.money.$numberDecimal = newBalance;
      if (balance.debts[index].payCount - 1 == balance.debts[index].creditexpirationmonth) {
        // Ödeme sayısı kredi bitiş ayına ulaştığında borcu diziden çıkar
        balance.debts.splice(index, 1);
        await balance.save();
        // Başarılı ve tamamlanmış mesajını dön
        res.status(201).send({ msg: "successandfinished" });
      } else {
        // Oturumdaki kullanıcının borç bilgilerini güncelle
        req.session.user.debt[index].payCount = balance.debts[index].payCount;
        req.session.user.debt[index].sumAmountToPay.$numberDecimal = newSumAmountToPay;
        req.session.save();
        // Başarılı mesajını dön
        res.status(201).send({ msg: "success" });
      }
    } else {
      res.status(400).send({ msg: "no-payment-time", date: debt.paymentTime });
      // Ödeme süresi geçmediğinde hata mesajını dön
    }
    // console.log(`[NEW BALANCE] ${JSON.stringify(balance.debts[index])}`);
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("'payCount'")) {
      // console.log("Error: 'payCount' property is undefined");
      return res.status(201).send({ msg: "success" });
    } else {
      console.log("[AN ERROR OCCURRED ON PAY MONTH]", err);
      return res.status(400).send({ msg: "error" });
    }
  }
});


router.get("/payall", async (req, res) => {
  // İstek sorgusundan id'yi al
  const { id } = req.query;
  try {
    // Kullanıcının bakiyesini veritabanından bul
    const balance = await balancesDB.findOne({ userID: req.session.user.id });
    // console.log(`[BALANCE] ${balance}`);
    // Belirli bir id'ye sahip borcu bul
    const debt = balance.debts.find(item => item._id == id);
    const index = balance.debts.findIndex(item => item._id == id);
    // Borç bulunamadığında hata fırlat
    if (!debt) throw new Error("No Debt Found");
    // console.log(`[DEBT] ${JSON.stringify(debt)}`);
    // console.log(`[INDEX] ${index}`);
    // Yeni bakiyeyi hesapla
    const newBalance = parseFloat(balance.balance).toFixed(2) - parseFloat(debt.sumAmountToPay).toFixed(2);
    // console.log(`[NEW BALANCE] ${newBalance}`);
    // Bakiyeyi güncelle
    balance.balance = newBalance;
    // Borcu diziden çıkar
    balance.debts.splice(index, 1);
    await balance.save();
    // Oturumdaki kullanıcının borç bilgilerini güncelle
    req.session.user.debt = balance.debts;
    req.session.user.money.$numberDecimal = newBalance;
    req.session.save();
    // Başarılı mesajını dön
    res.status(201).send({ msg: "success" });
    // console.log(`[NEW BALANCE] ${JSON.stringify(balance.debts[index])}`);
  } catch (err) {
    console.log(`[AN ERROR OCCURRED ON PAY MONTH] ${err}`);
    // Hata durumunda hata mesajını dön
    res.status(400).send({ msg: "error" });
  }
});

router.post("/usercreditapplication", async (req, res) => {
  try {
    // Kullanıcının kredi başvurularını bul
    const applications = await creditApplicationsDB.find({ userID: req.session.user.id });
    // Başvuru bulunamadığında hata fırlat
    if (!applications) throw new Error("no-data");
    // Başvuruların kredi kimliklerini al
    const creditID = applications.map(item => item.creditID);
    // Kimliklere sahip kredileri bul
    const credits = await creditsDB.find({ _id: { $in: creditID } });
    // Kredi bulunamadığında hata fırlat
    if (!credits) throw new Error("no-credit");
    // console.log(`[CREDIT] ${credits}`);
    const data = {
      applications,
      credits
    };
    // Verileri dön
    res.status(200).json(data);
  } catch (err) {
    switch (err.message) {
      case "no-data":
        // Veri bulunamadığında hata mesajını dön
        res.status(400).send({ msg: "no-data" });
        break;
      case "no-credit":
        // Kredi bulunamadığında hata mesajını dön
        res.status(400).send({ msg: "no-credit" });
        break;
      default:
        // Hata durumunda genel hata mesajını dön
        res.status(400).send({ msg: "error" });
        break;
    }
    console.log(`[AN ERROR OCCURRED ON USER CREDIT APPLICATION] ${err}`);
  }
});

module.exports = router