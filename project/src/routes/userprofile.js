const { Router } = require("express")
const path = require("node:path")
const fs = require('fs');
const userData = require("../database/schemas/users")
const userBalance = require("../database/schemas/userBalance")
const moneyHistory = require("../database/schemas/moneyHistory")
const {comparePassword, hashPassword} = require("../helpers/hashing/hash")
const srcPath = require("../helpers/srcPath")

const multer = require("multer")
const router = Router()

router.get("/", (req, res) => {
    if(req.session && req.session.user && req.session.user.isLogged){
        if(req.session.user.isLogged == true){
            res.sendFile(srcPath() + "/templates/userProfile/userProfile.html")
        }
    } else{
        res.redirect("/auth/login")
    }
})

router.post("/userupdate", async (req, res) => {
    const data = req.body; // İstekten gelen veriyi al
    let error = false; // Hata durumunu kontrol etmek için bir değişken tanımla

    try {
        const found = data.find(item => item.type === "password"); // Veride "password" türünde bir öğe bulunup bulunmadığını kontrol et

        if (found !== undefined) {
            // Eğer "password" türünde bir öğe varsa
            const user = await userData.findById(req.session.user.id); // Kullanıcıyı veritabanından bul

            const isValid = comparePassword(found.oldPassword, user.password); // Eski şifrenin doğru olup olmadığını kontrol et

            if (isValid) {
                // Eski şifre doğruysa
                const newHashedPassword = hashPassword(found.newPassword); // Yeni şifreyi hashle
                await user.updateOne({ password: newHashedPassword }); // Kullanıcının şifresini güncelle
            } else {
                // console.log(`[RES STATUS 400]`);
                res.status(400).send({ msg: "falsepassword" });
                return;
            }

            const userfound = await Promise.all(data.map(async item => await userData.findOne({ $or: [{ email: item.value }, { tel: item.value }] }))); // Verideki email ve telefon numaralarını kontrol et

            if (userfound.lenght == 0) throw new Error("error");

            for (const item of data) {
                // Her bir veri öğesi için döngü
                // console.log(`[ITEM] ${JSON.stringify(item)}`);
                const user = await userData.findOne({ $or: [{ email: item.value }, { tel: item.value }] }); // Email veya telefon numarasına sahip kullanıcıyı bul

                // console.log(`[USER] ${user}`);

                if (user != null) throw new Error("error"); // Kullanıcı bulunduysa hata fırlat
                else {
                    // Kullanıcı bulunmadıysa veriyi güncelle
                    if (item.type === "email") {
                        // console.log(`[EMAIL]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { email: item.value }); // Kullanıcının emailini güncelle
                    }
                    if (item.type === "tel") {
                        // console.log(`[TEL]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { tel: item.value }); // Kullanıcının telefon numarasını güncelle
                    } else if (item.type === "bDate") {
                        // console.log(`[BDATE]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { birthDate: item.value }); // Kullanıcının doğum tarihini güncelle
                    } else if (item.type === "street") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.street": item.value } }); // Kullanıcının adresinin sokak bilgisini güncelle
                    } else if (item.type === "district") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.district": item.value } }); // Kullanıcının adresinin ilçe bilgisini güncelle
                    } else if (item.type === "city") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.city": item.value } }); // Kullanıcının adresinin şehir bilgisini güncelle
                    } else if (item.type === "country") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.country": item.value } }); // Kullanıcının adresinin ülke bilgisini güncelle
                    }
                }
            }

            res.status(200).send({ msg: "success" }); // Başarılı yanıt gönder
        } else {
            // "password" türünde bir öğe yoksa
            let yes = false;
            const userfound = await Promise.all(data.map(async item => await userData.findOne({ $or: [{ email: item.value }, { tel: item.value }] })));


            if (userfound.lenght == 0) throw new Error("error");

            for (const item of data) {
                // console.log(`[ITEM] ${JSON.stringify(item)}`);
                const user = await userData.findOne({ $or: [{ email: item.value }, { tel: item.value }] });
                // console.log(`[USER]`);

                if (user != null) {
                    throw new Error("error");
                } else {
                    if (item.type === "email") {
                        // console.log(`[EMAIL]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { email: item.value });
                    }
                    if (item.type === "tel") {
                        // console.log(`[TEL]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { tel: item.value });
                    } else if (item.type === "bDate") {
                        // console.log(`[BDATE]`);
                        await userData.findByIdAndUpdate(req.session.user.id, { birthDate: item.value });
                    } else if (item.type === "street") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.street": item.value } });
                    } else if (item.type === "district") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.district": item.value } });
                    } else if (item.type === "city") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.city": item.value } });
                    } else if (item.type === "country") {
                        await userData.findByIdAndUpdate(req.session.user.id, { $set: { "address.country": item.value } });
                    }
                }
            }

            res.status(200).send({ msg: "success" });
        }
    } catch (err) {
        console.log(`[AN ERROR OCCURRED ON USER UPDATING] ${err.message}`);
        if (err.message === "same-email") {
            res.status(400).send({ msg: "same-email" });
        } else if (err.message === "same-tel") {
            res.status(400).send({ msg: "same-tel" });
        } else {
            res.status(400).send({ msg: "error" });
            return;
        }
    }
});


router.post("/sendmoney", async (req, res) => {
    const { iban, amount, note } = req.query; // İstekten gelen iban, miktar ve not bilgilerini al
    // console.log(`[IBAN] ${iban} [AMOUNT] ${amount} [IBAN] ${iban}`); // İban ve miktarı konsola yazdır

    try {
        // console.log(`[NOTE] ${note}`)
        if (iban === req.session.user.iban) throw new Error("SAME-IBAN"); // Gönderenin ibanı, alıcının ibanıyla aynı ise hata fırlat

        const sender = await userBalance.findOne({ userID: req.session.user.id }); // Gönderenin hesabını bul
        if (!sender) throw new Error("SENDER-HAS-NOT-FOUND"); // Gönderen hesabı bulunamazsa hata fırlat

        const receiver = await userBalance.findOne({ iban }); // Alıcının hesabını bul
        const receiverUserDB = await userData.findById(receiver.userID); // Alıcının kullanıcı verilerini bul

        if (!receiver) throw new Error("IBAN-IS-NOT-CORRECT"); // Alıcının hesabı bulunamazsa hata fırlat
        if (!receiverUserDB) throw new Error("Error"); // Alıcının kullanıcı verileri bulunamazsa hata fırlat

        const fixedAmount = parseFloat(amount); // Miktarı ondalık sayıya çevir
        const senderbalance = parseFloat(sender.balance); // Gönderenin bakiyesini ondalık sayıya çevir
        const receiverbalance = parseFloat(receiver.balance); // Alıcının bakiyesini ondalık sayıya çevir

        const newSenderBalance = senderbalance - fixedAmount; // Yeni gönderen bakiyesini hesapla
        const newReceiverBalance = receiverbalance + fixedAmount; // Yeni alıcı bakiyesini hesapla

        await sender.updateOne({ balance: newSenderBalance.toFixed(2) }); // Gönderenin bakiyesini güncelle
        await receiver.updateOne({ balance: newReceiverBalance.toFixed(2) }); // Alıcının bakiyesini güncelle

        req.session.user.money.$numberDecimal = newSenderBalance.toFixed(2); // Kullanıcının oturumundaki bakiyeyi güncelle
        req.session.save(); // Oturumu kaydet
        let params = {}; // Parametreleri tutmak için boş bir nesne oluştur

        if (note) {
            // Eğer not varsa
            params = {
                sender: {
                    id: req.session.user.id,
                    name: req.session.user.name,
                    surname: req.session.user.surname,
                    oldmoney: senderbalance.toFixed(2),
                    amount: fixedAmount.toFixed(2),
                    newmoney: newSenderBalance.toFixed(2),
                    note
                },
                receiver: {
                    id: receiverUserDB._id,
                    name: receiverUserDB.name,
                    surname: receiverUserDB.surname,
                    oldmoney: receiverbalance.toFixed(2),
                    newmoney: newReceiverBalance.toFixed(2),
                }
            };
        } else {
            // Not yoksa
            params = {
                sender: {
                    id: req.session.user.id,
                    name: req.session.user.name,
                    surname: req.session.user.surname,
                    oldmoney: senderbalance.toFixed(2),
                    amount: fixedAmount.toFixed(2),
                    newmoney: newSenderBalance.toFixed(2),
                },
                receiver: {
                    id: receiverUserDB._id,
                    name: receiverUserDB.name,
                    surname: receiverUserDB.surname,
                    oldmoney: receiverbalance.toFixed(2),
                    newmoney: newReceiverBalance.toFixed(2),
                }
            };
        }

        const moneyHist = await moneyHistory.create(params); // Para geçmişini oluştur ve kaydet
        await moneyHist.save(); // Para geçmişini kaydet

        res.status(200).send({ msg: "success" }); // Başarılı yanıt gönder
    }
    catch (err) {
        console.log(`[AN ERROR OCCURRED ON SENDING MONEY] ${err}`);
        if (err instanceof Error) {
            if (err.message === "IBAN-IS-NOT-CORRECT") {
                res.status(400).send({ msg: "false-iban" }); // Hatalı iban durumunda hata yanıtı gönder
            }
            else if (err.message === "SAME-IBAN") {
                res.status(400).send({ msg: "same-iban" }); // Aynı iban durumunda hata yanıtı gönder
            }
            else {
                res.status(400).send({ msg: "error" }); // Diğer hata durumlarında hata yanıtı gönder
            }
        }
        else {
            res.status(400).send({ msg: "error" }); // Diğer hata durumlarında hata yanıtı gönder
        }
    }
});


router.post("/moneyhistory", async (req, res) => {
    try {
        const userId = req.session.user.id; // Oturumdaki kullanıcı kimliğini al
        // console.log(`[USER ID] ${userId}`);

        const moneydata = await moneyHistory.find({
            $or: [
                { "sender.id": userId }, // Kullanıcının gönderen olarak yer aldığı tüm para geçmişini bul
                { "receiver.id": userId } // Kullanıcının alıcı olarak yer aldığı tüm para geçmişini bul
            ]
        });

        // console.log(moneydata);

        const data = {
            moneydata, // Para geçmişi verilerini içeren nesne
            userId // Kullanıcı kimliği
        };

        // console.log(`[MONEY HISTORY DATA] ${JSON.stringify(data)}`);

        res.status(200).json(data); // Verileri başarılı yanıt olarak gönder
    }
    catch (err) {
        console.log(`[AN ERROR OCCURRING ON SENDING MONEY HISTORY DATA] ${err}`);
        // Hata durumunda hata mesajını konsola yazdır

        // İsteğe hata yanıtı gönder
    }
});


// Multer diskStorage ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dosyanın kaydedileceği dizin
        cb(null, srcPath() + '/public/pfp/');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const timestamp = Date.now();
        cb(null, timestamp + '-' + req.session.user.id + extension);
    }
});

// Multer yükleme ayarları
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB olarak sınırla
    },
});

router.post("/pfp", upload.single('pfp'), async (req, res) => {
    try {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const fileExtension = path.extname(req.file.originalname);
        
        // Dosya boyutunu kontrol et
        // console.log(`[SIZE FILE] ${req.file.size}`);
        if (req.file.size > 4 * 1024 * 1024) {
            res.status(400).send(`<script>alert("USE LOWER IMAGE THAN 5MB"); location.href = "/user";</script>`);
            return;
        }
        // Dosya uzantısını kontrol et
        else if (!allowedExtensions.includes(fileExtension)) {
            // console.log(`[EXTENSION] ${fileExtension}`);
            res.status(400).send(`<script>alert("USE AN IMAGE"); location.href = "/user";</script>`);
            return;
        }
        else {
            const user = await userData.findById(req.session.user.id);
            
            // Kullanıcının mevcut profil fotoğrafı varsa, eski dosyayı sil
            if (user.pfpPath) {
                fs.unlink(user.pfpPath, (err) => {
                    if (err) {
                        // console.error('Dosya silinirken bir hata oluştu:', err);
                        null
                    } else {
                        // console.log('Dosya başarıyla silindi.');
                        null
                    }
                });
            }
           
            const filePath = req.file.path;
            const extension = path.extname(req.file.originalname);
            
            // Kullanıcının profil fotoğrafı yolunu güncelle
            await user.updateOne({ pfpPath: filePath });
            res.status(200).send(`<script>alert("PROFILE PHOTO CHANGED"); location.href = "/user";</script>`);
        }
    } catch (err) {
        console.log(`[AN ERROR OCCURRED ON UPLOADING PFP] ${err.message}`);
        res.status(200).send(`<script>alert("AN ERROR OCCURRED ON CHANGING PROFILE PHOTO"); location.href = "/user";</script>`);
    }
});



module.exports = router