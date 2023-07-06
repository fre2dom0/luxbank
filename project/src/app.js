const express = require("express"); // Express framework'ünü içe aktarın.
const bodyParser = require("body-parser"); // İsteklerin JSON verilerini ve URL kodlamasını ayrıştırmak için body-parser modülünü içe aktarın.
const path = require("node:path"); // Dosya yollarını işlemek için path modülünü içe aktarın.
const session = require("express-session"); // Oturum yönetimi için express-session modülünü içe aktarın.

const homeRouter = require(path.join(__dirname, "routes", "home")); // 'home' rotası için yönlendiriciyi içe aktarın.
const userProfileRouter = require(path.join(__dirname, "routes", "userprofile")); // 'userprofile' rotası için yönlendiriciyi içe aktarın.
const authRouter = require(path.join(__dirname, "routes", "auth")); // 'auth' rotası için yönlendiriciyi içe aktarın.
const apiRouter = require(path.join(__dirname, "routes", "api", "data")); // 'api/data' rotası için yönlendiriciyi içe aktarın.
const cardRouter = require(path.join(__dirname, "routes", "card")); // 'card' rotası için yönlendiriciyi içe aktarın.
const adminRouter = require(path.join(__dirname, "routes", "admin")); // 'admin' rotası için yönlendiriciyi içe aktarın.
const creditRouter = require(path.join(__dirname, "routes", "credit")); // 'credit' rotası için yönlendiriciyi içe aktarın.
const srcPath = require("./helpers/srcPath"); // 'srcPath' yardımcı fonksiyonunu içe aktarın.

require(path.join(__dirname, "database", "data.js")); // Veritabanı bağlantısını sağlamak için 'data.js' dosyasını içe aktarın.

const app = express(); // Express uygulaması oluşturun.
const PORT = 5000; // Kullanılacak olan port numarasını belirleyin.

app.use(bodyParser.json()); // İsteklerin JSON verilerini ayrıştırmak için body-parser'ı kullanın.
app.use(bodyParser.urlencoded({ extended: true })); // İsteklerin URL kodlamasını ayrıştırmak için body-parser'ı kullanın.
app.use(session({
    secret: "x)", // Oturum kimlik doğrulaması için kullanılan gizli anahtar.
    resave: false, // Değişiklik olmadığında oturumu yeniden kaydetmeyin.
    saveUninitialized: false // Başlatılmamış oturumları kaydetmeyin.
}));

// YÖNETİCİ OLARAK OTURUM AÇMAK İÇİN BU KODU ETKİNLEŞTİRİN

// app.use((req, res, next) => {
//     req.session.user = {
//         id: "64a15f992deadddb3f146fcd", // Kullanıcının kimlik bilgisi
//         authorization: "owner", // Kullanıcının yetkilendirme seviyesi
//         isLogged: true, // Kullanıcının oturum açıp açmadığı
//     };
//     next();
// });


app.use(express.static(path.join(__dirname, "public", "css"))); // 'public/css' klasörünü istemciye statik dosya olarak sunun.
app.use(express.static(path.join(__dirname, "public", "pfp"))); // 'public/pfp' klasörünü istemciye statik dosya olarak sunun.
app.use(express.static(path.join(__dirname, "public", "carousel"))); // 'public/carousel' klasörünü istemciye statik dosya olarak sunun.
app.use(express.static(path.join("node_modules", "bootstrap", "dist", "js"))); // 'node_modules/bootstrap/dist/js' klasörünü istemciye statik dosya olarak sunun.
app.use(express.static(path.join(__dirname, "public", "img"))); // 'public/img' klasörünü istemciye statik dosya olarak sunun.

app.listen(PORT, () => console.log(`[SERVER LISTENING ON PORT http://localhost:${PORT}]`)); // Uygulamayı belirtilen portta dinleyin ve konsola bir mesaj yazdırın.

app.use("/", homeRouter); // '/' rotası için 'home' yönlendiricisini kullanın.
app.use("/user", userProfileRouter); // '/user' rotası için 'userProfile' yönlendiricisini kullanın.
app.use("/card", cardRouter); // '/card' rotası için 'card' yönlendiricisini kullanın.
app.use("/auth", authRouter); // '/auth' rotası için 'auth' yönlendiricisini kullanın.
app.use("/api", apiRouter); // '/api' rotası için 'api' yönlendiricisini kullanın.
app.use("/panel", adminRouter); // '/panel' rotası için 'admin' yönlendiricisini kullanın.
app.use("/credit", creditRouter); // '/credit' rotası için 'credit' yönlendiricisini kullanın.
app.use((req, res, next) => {
    if (req.session.user && req.session.user.isLogged) {
        res.status(404).sendFile(srcPath() + "/templates/not-found/404session.html"); // Oturum açılmışsa, 404 durum kodu ile birlikte '404session.html' dosyasını gönderin.
    } else {
        res.status(404).sendFile(srcPath() + "/templates/not-found/404.html"); // Oturum açılmamışsa, 404 durum kodu ile birlikte '404.html' dosyasını gönderin.
    }
});
