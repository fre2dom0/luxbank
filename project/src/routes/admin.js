const { Router } = require("express")  // express paketinden Router modülünü alıyoruz
const path = require("node:path")  // path modülünü alıyoruz
const srcPath = require("../helpers/srcPath")  // srcPath yardımcı fonksiyonunu alıyoruz
const usersData = require("../database/schemas/users")  // kullanıcı verilerini tutan users şemasını alıyoruz
const userBalance = require("../database/schemas/userBalance")  // kullanıcı bakiyelerini tutan userBalance şemasını alıyoruz
const cardApplicationsDB = require("../database/schemas/cardApplications")  // kart başvurularını tutan cardApplications şemasını alıyoruz
const creditApplicationsDB = require("../database/schemas/creditApplications")  // kredi başvurularını tutan creditApplications şemasını alıyoruz
const cardDB = require("../database/schemas/cards")  // kartları tutan cards şemasını alıyoruz
const creditsDB = require("../database/schemas/credits")  // kredileri tutan credits şemasını alıyoruz
const carouselDB = require("../database/schemas/carousel")  // carousel verilerini tutan carousel şemasını alıyoruz
const { hashPassword } = require("../helpers/hashing/hash")  // hashPassword fonksiyonunu alıyoruz
const { cardGenerator, cvvGenerator, dateGenerator } = require("../helpers/producers/cardgenerator")  // cardGenerator, cvvGenerator ve dateGenerator fonksiyonlarını alıyoruz
const ibanProducer = require("../helpers/producers/iban.js")  // ibanProducer fonksiyonunu alıyoruz
const addAdminProcess = require("../helpers/addToHistory/addAdminProcessHistory")  // addAdminProcess fonksiyonunu alıyoruz
const moment = require('moment');  // moment kütüphanesini alıyoruz
const multer = require("multer")  // multer modülünü alıyoruz
const fs = require("node:fs")
const router = Router()  // Router nesnesini oluşturuyoruz

router.get("/", async (req, res) => {  // "/" yoluna gelen GET isteklerini işleyen bir yönlendirici tanımlıyoruz
  if (req.session && req.session.user && req.session.user.isLogged) {  // Eğer oturum varsa, kullanıcı varsa ve kullanıcı giriş yapmışsa
    if (req.session.user.isLogged) {  // Kullanıcı giriş yapmışsa
      const user = await usersData.findById(req.session.user.id)
      if (user.authorization == "admin" || user.authorization == "owner") {  // Kullanıcının yetkisi "admin" veya "owner" ise
        res.sendFile(srcPath() + "/templates/adminPanel/admin.html")  // admin.html dosyasını gönderiyoruz
      }
      else {  // Kullanıcının yetkisi "admin" veya "owner" değilse
        res.redirect("/")  // ana sayfaya yönlendiriyoruz
      }
    }
  }
  else {  // Oturum yoksa veya kullanıcı giriş yapmamışsa
    res.redirect("/auth/login")  // giriş sayfasına yönlendiriyoruz
  }
})

router.delete("/deleteuser", async (req, res) => {
  try {
    const id = req.query.id  // İstek parametrelerinden "id" parametresini alıyoruz
    const userDB = await usersData.findById(id)  // "id" değerine göre kullanıcıyı veritabanından buluyoruz
    if (!userDB) throw new Error("User Has Not Found")  // Kullanıcı bulunamazsa hata fırlatıyoruz
    
    if (req.session && req.session.user) {  // Eğer oturum varsa ve kullanıcı giriş yapmışsa
      if (req.session.user.authorization == "owner" && req.session.user.id != userDB._id) {
        // Eğer kullanıcının yetkisi "owner" ise ve silinmek istenen kullanıcının kimliği, oturumdaki kullanıcının kimliğiyle farklı ise
        addAdminProcess("deleting", req.session.user, userDB.name, userDB.surname, userDB._id, userDB.authorization)
        // Admin işlem geçmişine "deleting" olayını, oturumdaki kullanıcı bilgileri ve silinecek kullanıcının bilgilerini ekliyoruz
        await userBalance.findOneAndDelete({ userID: userDB._id })  // Kullanıcının bakiyesini sil
        await userDB.deleteOne()  // Kullanıcıyı veritabanından sil
        if (userDB.pfpPath) {
          fs.unlink(userDB.pfpPath, (err) => {
              if (err) {
                  // console.error('Dosya silinirken bir hata oluştu:', err);
                  null
              } else {
                  // console.log('Dosya başarıyla silindi.');
                  null
              }
          });
      }
        res.status(200).send({ msg: "deleted" })  // Başarılı bir şekilde silindiğini bildiren yanıt gönder
      }
      else if (req.session.user.authorization == "admin" && (userDB.authorization != "owner" && userDB.authorization != "admin")) {
        // Eğer kullanıcının yetkisi "admin" ise ve silinmek istenen kullanıcının yetkisi "owner" veya "admin" değilse
        addAdminProcess("deleting", req.session.user, userDB.name, userDB.surname, userDB._id, userDB.authorization)
        // Admin işlem geçmişine "deleting" olayını, silinecek kullanıcının bilgilerini ekliyoruz
        await userBalance.findOneAndDelete({ userID: userDB._id })  // Kullanıcının bakiyesini sil
        if (userDB.pfpPath) {
          fs.unlink(userDB.pfpPath, (err) => {
              if (err) {
                  // console.error('Dosya silinirken bir hata oluştu:', err);
                  null
              } else {
                  // console.log('Dosya başarıyla silindi.');
                  null
              }
          });
      }
        await userDB.deleteOne()  // Kullanıcıyı veritabanından sil
        res.status(200).send({ msg: "deleted" })  // Başarılı bir şekilde silindiğini bildiren yanıt gönder
      }
      else {
        // Silme işlemini gerçekleştiremeyecek bir durum olduğunda
        res.status(400).send({ msg: "notDeleted" })  // Silinemediğini bildiren yanıt gönder
      }
    }
    else {
      // Oturum yoksa veya kullanıcı giriş yapmamışsa
      res.send(`<script>alert("You have to log in!");</script>`).redirect("/auth/login")  // JavaScript kodu ile giriş yapılması gerektiğini bildiren bir uyarı göster ve giriş sayfasına yönlendir
    }
  }
  catch (err) {
    // Hata oluştuğunda
    res.status(400).send({ msg: "notDeleted" })  // Silinemediğini bildiren yanıt gönder
  }
})

router.post("/updateuser", async (req, res) => {
  try {
    const data = req.query; // İstekten gelen veriler alınır ve 'data' değişkenine atanır.
    // console.log(data)
    // console.log(`[UPDATE DATA] ${JSON.stringify(data)}`);
    const userDB = await usersData.findById(data.id); // Kullanıcı veritabanından 'data.id' ile kullanıcı aranır ve 'userDB' değişkenine atanır.
    if (!userDB) throw new Error("User Has Not Found"); // Eğer kullanıcı bulunamazsa hata fırlatılır.
    const userBalanceDB = await userBalance.findOne({ userID: userDB._id }); // Kullanıcının bakiye bilgisi 'userID' ile bulunur ve 'userBalanceDB' değişkenine atanır.
    if (!userBalanceDB) throw new Error("Balance Has Not Found"); // Eğer bakiye bilgisi bulunamazsa hata fırlatılır.
    // Verilerin güncellenmesi
    if (data.address) {
      data.address = JSON.parse(data.address); // 'data.address' varsa JSON formatından ayrıştırılır.
    }

    if (req.session && req.session.user) {
      let historyDataKeys = []; // Geçmiş veri anahtarlarını tutacak boş bir dizi oluşturulur.
      let historyDataValues = []; // Geçmiş veri değerlerini tutacak boş bir dizi oluşturulur.

      if (req.session.user.authorization == "owner") {
        // Kullanıcının yetkisi 'owner' ise:
        for (let key in data) {
          if (key === "balance") {
            // Eğer 'key' 'balance' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.
            await userBalanceDB.updateOne({ [key]: parseFloat(data[key]).toFixed(2) }); // 'userBalanceDB' güncellenir.
          } else if (key === "debts" || key === "iban") {
            // Eğer 'key' 'debts' veya 'iban' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.
            await userBalanceDB.updateOne({ [key]: parseFloat(data[key]) }); // 'userBalanceDB' güncellenir.
          } else if (key === "birthdate") {
            // Eğer 'key' 'birthdate' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.

            // YAŞIN HESAPLANMASI
            const [year, month, day] = data[key].split("-");
            const currentDate = new Date();
            const birth = new Date(year, month, day);
            let ageCalculate = currentDate.getFullYear() - birth.getFullYear();

            // DOĞUM AYI VE GÜNÜNÜN MEVCUT AY VE GÜNDEN KÜÇÜK OLUP OLMADIĞININ KONTROLÜ
            if (currentDate.getMonth() + 1 < birth.getMonth() || (currentDate.getMonth() + 1 == birth.getMonth() && currentDate.getDate() < birth.getDate())) {
              ageCalculate--;
            }

            const age = ageCalculate;
            await userDB.updateOne({ birthDate: data[key], age }); // Kullanıcının yaş bilgisi güncellenir.
          } else if (key === "password") {
            // Eğer 'key' 'password' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push("password"); // Geçmiş veri değerleri dizisine "password" eklenir.
            await userDB.updateOne({ password: hashPassword(data[key]) }); // Kullanıcının şifresi güncellenir.
          } else if (key === "address") {
            // Eğer 'key' 'address' ise:
            const keys = Object.keys(data[key]); // 'data[key]' içindeki anahtarlar alınır.
            const values = Object.values(data[key]); // 'data[key]' içindeki değerler alınır.
            const newAddress = {
              street: userDB.address.street,
              district: userDB.address.district,
              city: userDB.address.city,
              country: userDB.address.country,
            };

            keys.map((keyValue, index) => {
              if (keyValue === "street") {
                newAddress.street = values[index];
              } else if (keyValue === "district") {
                newAddress.district = values[index];
              } else if (keyValue === "city") {
                newAddress.city = values[index];
              } else if (keyValue === "country") {
                newAddress.country = values[index];
              }
            });

            await userDB.updateOne({ address: newAddress }); // Kullanıcının adres bilgisi güncellenir.
          } else {
            if (key != "id" || key != undefined) {
              historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
              historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.
            }
            await userDB.updateOne({ [key]: data[key] }); // Kullanıcının diğer bilgileri güncellenir.
          }

          await userBalanceDB.save(); // 'userBalanceDB' kaydedilir.
          await userDB.save(); // 'userDB' kaydedilir.
        }

        const updateData = [historyDataKeys, historyDataValues]; // Güncelleme verisi oluşturulur.
        addAdminProcess("updating", req.session.user, userDB.name, userDB.surname, userDB._id, userDB.authorization, updateData); // Yönetici işlemi eklenir.
        res.status(200).send({ msg: "updated" }); // Yanıt olarak 'updated' mesajı gönderilir.
      } 
      else if (req.session.user.authorization == "admin" && (userDB.authorization != "owner" && userDB.authorization != "admin")) {
        // Eğer kullanıcının yetkisi 'admin' ise ve güncellenen kullanıcının yetkisi 'owner' veya 'admin' değilse:
        for (let key in data) {
          if(key === "authorization"){
            res.status(400).send({msg: "authError"});
            return
          }
          else if (key === "balance") {
            // Eğer 'key' 'balance' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.
            await userBalanceDB.updateOne({ [key]: parseFloat(data[key]).toFixed(2) }); // 'userBalanceDB' güncellenir.
          } else if (key === "password") {
            // Eğer 'key' 'password' ise:
            historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
            historyDataValues.push("password"); // Geçmiş veri değerleri dizisine "password" eklenir.
            await userDB.updateOne({ password: hashPassword(data[key]) }); // Kullanıcının şifresi güncellenir.
          }

          else if (key === "address") {
            // Eğer 'key' 'address' ise:
            const keys = Object.keys(data[key]); // 'data[key]' içindeki anahtarlar alınır.
            const values = Object.values(data[key]); // 'data[key]' içindeki değerler alınır.
            const newAddress = {
              street: userDB.address.street,
              district: userDB.address.district,
              city: userDB.address.city,
              country: userDB.address.country,
            };

            keys.map((keyValue, index) => {
              if (keyValue === "street") {
                newAddress.street = values[index];
              } else if (keyValue === "district") {
                newAddress.district = values[index];
              } else if (keyValue === "city") {
                newAddress.city = values[index];
              } else if (keyValue === "country") {
                newAddress.country = values[index];
              }
            });


            await userDB.updateOne({ address: newAddress }); // Kullanıcının adres bilgisi güncellenir.
          } else {
            if (key != "id" || key != undefined) {
              historyDataKeys.push(key); // Geçmiş veri anahtarları dizisine 'key' eklenir.
              historyDataValues.push(data[key]); // Geçmiş veri değerleri dizisine 'data[key]' eklenir.
            }
            await userDB.updateOne({ [key]: data[key] }); // Kullanıcının diğer bilgileri güncellenir.
          }
        }

        const updateData = [historyDataKeys, historyDataValues]; // Güncelleme verisi oluşturulur.
        addAdminProcess("updating", req.session.user, userDB.name, userDB.surname, userDB._id, userDB.authorization, updateData); // Yönetici işlemi eklenir.
        res.status(200).send({ msg: "updated" }); // Yanıt olarak 'updated' mesajı gönderilir.
      } else {
        // Kullanıcı oturumu yoksa veya kullanıcı yetkisi uygun değilse:
        res.status(400).send({ msg: "notUpdated" }); // Yanıt olarak 'notUpdated' mesajı gönderilir.
      }
    } else {
      // Oturum hatası:
      res.send(`<script>alert("You have to log in!");</script>`).redirect("/login"); // 'login' sayfasına yönlendirilir.
    }
  } catch (error) {
    console.log(`[ERROR UPDATE] ${error}`)
    res.status(500).send({ error: error.message }); // Hata durumunda hata mesajı gönderilir.
  }
});


router.post("/adduser", async (req, res) => {
  try {
    const { name, surname, email, password, tel, birthDate, gender, identityNumber, street, district, city, country, authorization } = req.query;

    // Yönetici kullanıcı kontrolü
    if (req.session.user.authorization == "admin" && (authorization == "owner" || authorization == "admin")) {
      throw new Error("[---[---[YOU CAN'T ADD AN OWNER OR ADMIN]---]---]");
    }

    // Kullanıcının veritabanında mevcut olup olmadığını kontrol etme
    const userDB = await usersData.findOne({ $or: [{ email }, { tel }, { identityNumber }] });
    if (userDB) {
      if (userDB.identityNumber == identityNumber) {
        throw new Error("[---[---[THERE IS A USER AT THIS ID]---]---]");
      } else if (userDB.tel == tel) {
        throw new Error("[---[---[THERE IS A USER AT THIS TEL NUMBER]---]---]");
      } else if (userDB.email == email) {
        throw new Error("[---[---[THERE IS A USER AT THIS TEL EMAIL]---]---]");
      }
    } else {
      // Yaş hesaplama
      const [year, month, day] = birthDate.split("-");
      const currentDate = new Date();
      const birth = new Date(year, month, day);
      let ageCalculate = currentDate.getFullYear() - birth.getFullYear();

      // Doğum ayı ve gününün geçerli ay ve gününden daha küçük olup olmadığını kontrol etme
      if (currentDate.getMonth() + 1 < birth.getMonth() || (currentDate.getMonth() + 1 == birth.getMonth() && currentDate.getDate() < birth.getDate())) {
        ageCalculate--;
      }
      const age = ageCalculate;

      // Şifre hashleme
      const hashedPassword = hashPassword(password);

      // Kullanıcıya ait IBAN'ları al
      const ibans = await userBalance.find({}, { iban: 1 });
      const iban = ibanProducer(ibans);

      // Yeni kullanıcı oluşturma ve kaydetme
      const newUser = await usersData.create({
        name,
        surname,
        email,
        password: hashedPassword,
        tel,
        iban,
        birthDate,
        age,
        gender,
        identityNumber,
        authorization,
        address: {
          street,
          district,
          city,
          country,
        },
      });

      // Yeni kullanıcının bakiye bilgilerini oluşturma ve kaydetme
      const newUserBalance = await userBalance.create({ userID: newUser._id, iban });
      await newUser.save();
      await newUserBalance.save();

      // Yönetici işlemi ekleme
      addAdminProcess("adding", req.session.user, newUser.name, newUser.surname, newUser.id, newUser.authorization);

      res.status(200).send({ msg: "added" });
    }
  } catch (err) {
    res.status(400).send({ msg: "notAdded " + err });
  }
});


router.post("/applicationupdate", async (req, res) => {
  try {
    const { id, isAccepted } = req.query;

    // Başvuru kimliği ile başvuruyu bulup güncelleme
    const application = await cardApplicationsDB.findByIdAndUpdate(id, { isAccepted });

    // Başvuruya ait kullanıcıyı bulma
    const user = await usersData.findById(application.userID);

    // Yönetici işlemi ekleme
    addAdminProcess(`card-application-${isAccepted}`, req.session.user, user.name, user.surname, user.id, user.authorization);

    if (isAccepted === "accepted") {
      // Kart numarası, CVV ve son kullanma tarihi oluşturma
      const cards = await cardDB.find({});
      const cardNumber = cardGenerator(cards);
      const cvv = cvvGenerator();
      const date = dateGenerator();

      // Yeni kart verilerini oluşturma
      const data = {
        userID: user._id,
        cardInfos: {
          cardType: application.cardInfos.cardType,
          cardName: application.cardInfos.cardName,
          cardNumber: cardNumber,
          expirationDate: date,
          cvv: cvv,
          limit: application.cardInfos.limit,
        },
      };

      // Yeni kart oluşturma ve kaydetme
      const newCard = await cardDB.create(data);
      await newCard.save();

      res.status(200).json({ msg: "accepted" });
    } else {
      res.status(200).json({ msg: "cancelled" });
    }
  } catch (err) {
    res.status(500).json({ msg: "servererror" });
  }
});


router.post("/createcredit", async (req, res) => {
  const {
    creditname,
    creditdescription,
    creditamount,
    creditinterest,
    creditexpirationmonth,
    creditinstallmentmonth,
    interestCalculated,
    sumAmountToPay,
    paymentInterval,
    paymentAmountPerInterval,
  } = req.query;

  try {
    // Kredi adına göre kredi veritabanında aranır
    const credit = await creditsDB.findOne({ creditname });

    // Eğer kredi bulunursa hata fırlatılır
    if (credit) {
      throw new Error(`CREDIT-HAS-BEEN-FOUNDED`);
    }

    // Yeni kredi oluşturulur ve kaydedilir
    const newCredit = await creditsDB.create({
      creditname,
      creditdescription,
      creditamount,
      creditinterest,
      creditexpirationmonth,
      creditinstallmentmonth,
      interestCalculated,
      sumAmountToPay,
      paymentInterval,
      paymentAmountPerInterval,
    });
    await newCredit.save();

    res.status(200).send({ msg: "CREDIT-HAS-BEEN-CREATED" });
  } catch (err) {
    res.status(400).send({ msg: err.message });
  }
});

router.post("/processcredit", async (req, res) => {
  try {
    const { id, process } = req.query;

    if (process == "active") {
      // ID kullanarak krediyi bulur
      const credit = await creditsDB.findById(id);

      if (credit.creditActive) {
        // Kredi aktifse devre dışı bırakır
        credit.creditActive = false;
        credit.save();
        res.status(200).send({ msg: "changed", status: "DISABLED" });
      } else {
        // Kredi devre dışıysa etkinleştirir
        credit.creditActive = true;
        credit.save();
        res.status(200).send({ msg: "changed", status: "ACTIVATED" });
      }
    } else {
      // Krediyi siler
      await creditsDB.findByIdAndDelete(id);
      res.status(200).send({ msg: "deleted" });
    }
  } catch (err) {
    res.status(400).send({ msg: err.message });
  }
});


router.post("/creditapplication", async (req, res) => {
  const { id, isAccepted } = req.query;

  try {
    // Başvuruyu ID kullanarak bulur
    const application = await creditApplicationsDB.findById(id);

    if (isAccepted === "accepted") {
      // Başvuru kabul edildiyse:
      const balance = await userBalance.findOne({ userID: application.userID });
      const credit = await creditsDB.findById(application.creditID);

      const currentDate = moment();
      const futureDate = moment().add(30, 'days');

      // Kullanıcının bakiyesine kredi miktarı eklenir
      const newBalance = parseFloat(balance.balance) + parseFloat(credit.creditamount);
      balance.balance = parseFloat(newBalance).toFixed(2);

      // Kredi kabul tarihi ve ödeme zamanı güncellenir
      credit.acceptDate = new Date();
      credit.paymentTime = futureDate;

      // Kullanıcının borçları arasına kredi eklenir
      balance.debts.push(credit);

      // Değişiklikler kaydedilir
      await balance.save();
      await application.updateOne({ isAccepted: "accepted" });
      await application.save();

      const user = await usersData.findById(application.userID);

      // Başvuruyla ilgili bilgilendirme işlemi yapılır
      addAdminProcess(`credit-application-${isAccepted}`, req.session.user, user.name, user.surname, user.id, user.authorization, undefined, credit.creditname);

      // İşlem başarılıysa "success" mesajı gönderilir
      res.status(201).send({ msg: "success" });
    } else {
      // Başvuru reddedildiyse:
      await application.updateOne({ isAccepted: "cancelled" });

      const credit = await creditsDB.findById(application.creditID);
      const user = await usersData.findById(application.userID);

      // Başvuruyla ilgili bilgilendirme işlemi yapılır
      addAdminProcess(`credit-application-${isAccepted}`, req.session.user, user.name, user.surname, user.id, user.authorization, undefined, credit.creditname);

      // İşlem başarılıysa "cancelled" mesajı gönderilir
      res.status(201).send({ msg: "cancelled" });
    }
  } catch (err) {
    // Hata durumunda uygun hata mesajı gönderilir ve hata konsola yazdırılır
    if (err.message === "Not-Enough-Money") {
      res.status(201).send({ msg: "notenoughmoney" });
    } else {
      res.status(201).send({ msg: "error" });
    }
    console.log(`[AN ERROR OCCURRED ON CREDIT APPLICATION] ${err}`);
  }
});


// Multer diskStorage ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dosyanın kaydedileceği dizin
    cb(null, srcPath() + '/public/carousel/');
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, timestamp + extension);
  }
});

// Multer yükleme ayarları
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Dosya boyutunu 510B ile sınırla
  },
});

router.post("/addcarousel", upload.single('carousel'), async (req, res) => {
  try {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(req.file.originalname);

    // Yüklenecek dosya boyutunu kontrol et
    if (req.file.size > 10 * 1024 * 1024) {
      res.status(400).send(`<script>alert("USE LOWER IMAGE THAN 10MB"); location.href = "/panel";</script>`);
      return;
    }
    // Desteklenmeyen dosya uzantısını kontrol et
    else if (!allowedExtensions.includes(fileExtension)) {
      // console.log(`[EXTENSION] ${fileExtension}`);
      res.status(400).send(`<script>alert("USE AN IMAGE"); location.href = "/panel";</script>`);
      return;
    }
    else {
      const filePath = req.file.path;

      // Veritabanına carousel kaydını oluştur ve kaydet
      const carousel = await carouselDB.create({ path: filePath });
      carousel.save();

      res.status(200).send(`<script>alert("CAROUSEL ADDED"); location.href = "/panel";</script>`);
    }
  }
  catch (err) {
    console.log(`[AN ERROR OCCURRED ON UPLOADING PFP] ${err.message}`);
    res.status(400).send(`<script>alert("AN ERROR OCCURRED ON CAROUSEL ADDING"); location.href = "/panel";</script>`);
  }
});


router.post("/carouselactive/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Belirtilen ID'ye sahip carousel'ı bul
    const carousel = await carouselDB.findById(id);

    // Carousel'ın durumunu değiştir (aktifse pasif, pasifse aktif)
    carousel.active = !carousel.active;

    carousel.save();

    // Başarıyla durum değiştirildiğine dair yanıt gönder
    res.status(200).send({ msg: "success", status: carousel.active });
  }
  catch (err) {
    console.log(`[AN ERROR OCCURRED ON CAROUSEL STATUS CHANGING] ${err.message}`);

    // Hata durumunda hata mesajını yanıt olarak gönder
    res.status(400).send({ msg: err.message });
  }
});

router.post("/carouseldelete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Belirtilen ID'ye sahip carousel'ı sil
    const carousel = await carouselDB.findByIdAndDelete(id);

    // Carousel başarıyla silindiğine dair yanıt gönder
    res.status(200).send({ msg: "success", status: carousel.active });
  }
  catch (err) {
    console.log(`[AN ERROR OCCURRED ON CAROUSEL STATUS CHANGING] ${err.message}`);

    // Hata durumunda hata mesajını yanıt olarak gönder
    res.status(400).send({ msg: err.message });
  }
});

router.post("/addlink", async (req, res) => {
  const { id, link } = req.query;
  try {
    // Belirtilen ID'ye sahip carousel'ı bul
    const carousel = await carouselDB.findById(id);

    // Carousel'a link ekle
    carousel.link = link;
    carousel.save();

    // Başarıyla link eklendiğine dair yanıt gönder
    res.status(200).send({ msg: "success" });
  }
  catch (err) {
    console.log(`[AN ERROR OCCURRED ON ADDING LINK] ${err.message}`);

    // Hata durumunda hata mesajını yanıt olarak gönder
    res.status(400).send({ msg: err.message });
  }
});


module.exports = router