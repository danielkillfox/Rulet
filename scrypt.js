const TOTAL_ITEMS = 40
const btn = document.getElementById("Spin_Button");
const rlb = document.getElementById("roulette_bar");
const Drop_js = document.getAnimations("result");

//RANDOME SYSTEM

let r = Math.random()*100; //Генератор вероятности
let total_chanse = 0 // Накапение шанса

for(const item of ITEMS) { //перебераем предметы из массива
    total_chanse = ITEMS.chance //Записываем шанс предмета в переменную
    if (r < total_chanse) return item //Если Рандомное чисор меньше шанса предмета,его диапазон(chance: 60- это от 0 до 60).То возвращаем предмет
}


//ITEMS
const ITEMS = {
    name:"gift_red" ,Image:"red_present.jpg",chance:30,
    name:"gift_green",Image:"green_present.jpg",chance:10,
    name:"gift_white",Image:"white_presemt.jpg", chance:50,
}


const IMAGE = document.createElement("img")