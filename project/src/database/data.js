const mongoose = require("mongoose")


mongoose.connect("mongodb+srv://admin:admin123@luxbank.qfbhy0z.mongodb.net/bank_db?retryWrites=true&w=majority", {})
  .then(() => console.log("[DATABASE CONNECTED SUCCESSFULLY]"))
  .catch((err) => console.log(`[AN ERROR OCCURRED ON DATABASE CONNECTION ${err}]`));
