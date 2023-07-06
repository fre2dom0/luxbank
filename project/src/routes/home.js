const { Router } = require("express")

const srcPath = require("../helpers/srcPath")

const router = Router()

router.get("", (req, res) => {
    if (req.session && req.session.user && req.session.user.isLogged) {
        if (req.session.user.isLogged == true) {
            res.sendFile(srcPath() + "/templates/homePages/sessionHome.html")
        }
    }
    else {
        res.sendFile(srcPath() + "/templates/homePages/home.html")
    }
})

module.exports = router