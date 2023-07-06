const cardGenerator = (cards) => {
    let numbers = ""
    while(true){
        for(let i = 0; numbers.length < 16 ; i++){
            numbers += Math.floor(Math.random()* 10)
        }
        const card = cards.find(card => card.cardInfos.cardNumber == numbers)
        if(card == undefined){
            return numbers
        }

        console.log(`[AN CART FOUNDED]`)
    }
        
}

const cvvGenerator = () => {
    let numbers = ""
    for(let i = 0; numbers.length < 3 ; i++){
        numbers += Math.floor(Math.random()* 10)
    }
    return numbers
}

const dateGenerator = () => {
    const currentYear = new Date().getFullYear();
    console.log(`[CURRENT YEAR] ${currentYear}`)
    const minYear = currentYear;
    const maxYear = currentYear + 10;
    const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1) + minYear);
    console.log(`[RANDOM YEAR] ${randomYear}`)
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    console.log(`[RANDOM MONTH] ${randomMonth}`)
    const monthFormatted = String(randomMonth).padStart(2, '0');
    console.log(`[MONTH FORMATTED] ${monthFormatted}`)
    return `${monthFormatted}/${randomYear}`;
}

const modules = {
    cardGenerator,
    cvvGenerator,
    dateGenerator
}

module.exports = modules

        