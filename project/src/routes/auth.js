const { Router } = require("express")
const userData = require("../database/schemas/users")
const balanceData = require("../database/schemas/userBalance")
const path = require("node:path")

const {hashPassword} = require("../helpers/hashing/hash")
const ibanProducer = require("../helpers/producers/iban.js")
const srcPath = require("../helpers/srcPath")
const {comparePassword} = require("../helpers/hashing/hash")
const register = require("../functions/auth/register")
const login = require("../functions/auth/login")





const router = Router()

router.get("/login", (req, res) => {
    // console.log("[LOGIN JOINED]")
    if (req.session && req.session.user && req.session.user.isLogged) {
        if (req.session.user.isLogged == true) {
            if (req.url == "/auth/login")
                // console.log("[LOGIN REDIRECT]")
            res.redirect("/")
        }
    }
    else {
        res.sendFile(srcPath() + "/templates/authPages/login.html")
    }
})

router.post("/login/submit", async (req, res) => {
    const { identityNumber, password } = req.body;
    try {
        // Kullanıcıyı kimlik numarasına göre ara
        const userDB = await userData.findOne({ identityNumber });
        if (!userDB) throw new Error(`$USER-HAS-NOT-FOUND`);
        // Girilen şifreyi kullanıcının şifresiyle karşılaştır
        const isValid = comparePassword(password, userDB.password);
        if (!isValid) throw new Error(`$PASSWORD-IS-NOT-CORRECT`);
        // Kullanıcının bakiyesini bul
        let userBalance = await balanceData.findOne({ userID: userDB._id });
        if (!userBalance) {
            // Kullanıcının bakiyesi yoksa yeni bir bakiye oluştur
            const newUserBalance = await balanceData.create({ userID: newUser._id });
            await newUserBalance.save();
            userBalance = await userData.findOne({ userID: userDB._id });
        }
        // Kullanıcının bilgilerini yanıt olarak hazırla
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
        };
        // Kullanıcı oturumunu başlatmak için yanıtı kullanıcı oturumu olarak ayarla
        req.session.user = respond;
        // Ana sayfaya yönlendir
        res.redirect("/");
    }
    catch (err) {
        console.log(`[AN ERROR OCCURRED ON LOGIN] ${err}`);
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
        };
        // Kullanıcı oturumunu başlatmak için yanıtı kullanıcı oturumu olarak ayarla (boş oturum)
        req.session.user = respond;
        // Hata mesajıyla birlikte giriş sayfasına yönlendir
        res.status(400).send("<script>location.href = '/auth/login'; alert(`User Has Not Found`);</script>");
    }
});


router.get("/register", (req, res) => {
    // console.log("[REGISTER JOINED]")
    if (req.session && req.session.user && req.session.user.isLogged) {
        // console.log(`[SESSION TRUE]`)
        if (req.session.user.isLogged == true) {
            // console.log(`[REGISTER REDIRECT]`)
            res.redirect("/")
        }
    }
    else {
        res.sendFile(srcPath() + "/templates/authPages/register.html")
    }
})

router.post("/register/submit", async (req, res) => {
    const { name, surname, email, password, tel, birthDate, gender, identityNumber, street, district, city, country } = req.body;
    try {
        // Kullanıcının email, telefon veya kimlik numarasına göre veritabanında var olup olmadığını kontrol et
        const userDB = await userData.findOne({ $or: [{ email }, { tel }, { identityNumber }] });
        if (userDB) {
            if (userDB.identityNumber == identityNumber) throw new Error("[---[---[THERE IS A USER AT THIS ID]---]---]");
            else if (userDB.tel == tel) throw new Error("[---[---[THERE IS A USER AT THIS TEL NUMBER]---]---]");
            else if (userDB.email == email) throw new Error("[---[---[THERE IS A USER AT THIS EMAIL]---]---]");
            return false;
        } else {
            // YAŞI HESAPLAMA
            const [year, month, day] = birthDate.split("-");
            const currentDate = new Date();
            const birth = new Date(year, month, day);
            let ageCalculate = currentDate.getFullYear() - birth.getFullYear();

            // Geçerli tarihin ayı ve günü, doğum tarihinin ayından ve gününden küçük mü diye kontrol et
            if (currentDate.getMonth() + 1 < birth.getMonth() || (currentDate.getMonth() + 1 == birth.getMonth() && currentDate.getDate() < birth.getDate())) {
                ageCalculate--;
            }
            const age = ageCalculate;

            // Şifreyi hashleme
            const hashedPassword = hashPassword(password);
            // Tüm ibanları getir
            const ibans = await balanceData.find({}, { iban: 1 });
            // Yeni bir iban oluştur
            const iban = ibanProducer(ibans);
            // Yeni kullanıcıyı oluştur
            const newUser = await userData.create({
                name,
                surname,
                email,
                password: hashedPassword,
                tel,
                birthDate,
                age,
                gender,
                identityNumber,
                address: {
                    street,
                    district,
                    city,
                    country,
                },
            });
            // console.log(`[NEW USER] ${newUser}`);
            // Yeni kullanıcıya ait bakiyeyi oluştur
            const newUserBalance = await balanceData.create({ userID: newUser._id, iban });
            // console.log(`[NEW USER BALANCE] ${newUserBalance}`);
            // Yeni kullanıcıyı ve bakiyesini kaydet
            await newUser.save();
            await newUserBalance.save();
            // console.log(`[---[---[NEW USER SAVED]---]---]`);
            // Kayıt başarılıysa giriş sayfasına yönlendir
            res.status(201).redirect("/auth/login");
        }
    } catch (err) {
        console.log(`[AN ERROR OCCURRED ON REGISTER] ${err}`);
        // Hata mesajıyla birlikte kayıt sayfasına yönlendir
        res.status(400).send(`<script>alert("An Error Occurred ${err.message}"); location.href = "/auth/register"</script>`);
    }
});


router.get("/logout", (req, res) => {
    req.session.user = undefined
    res.status(200).redirect("/")
})



module.exports = router