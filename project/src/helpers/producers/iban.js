

const ibanProducer = (ibans) => {
    while(true){
        let numbers = "";
        for(let i = 0; numbers.length < 24 ; i++){
            numbers += Math.floor(Math.random()* 10)
        }
        const iban = ibans.find(iban => iban.iban == numbers)
        if(iban == undefined){
            return numbers
        }

        console.log(`[AN IBAN FOUNDED]`)
    }
        
}

module.exports = ibanProducer

        