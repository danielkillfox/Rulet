// ===== НЕМНОГО О DOM =====
// DOM — это «дерево» элементов страницы, с которым работает JavaScript.
// document.getElementById("id") находит элемент по его атрибуту id и возвращает его.
// Найденные элементы сохраняем в константы, чтобы потом удобно к ним обращаться.

// ===== НАСТРОЙКИ РУЛЕТКИ =====
const TOTAL_ITEMS = 40;  // Сколько карточек будет на ленте
const ITEM_WIDTH = 120;  // Ширина одной карточки в px. Должна совпадать с .roulette_item в CSS!
const WINNER_INDEX = 30; // Позиция выигрышной карточки в ленте (счёт с нуля)
const SPIN_TIME = 5000;  // Сколько миллисекунд идёт прокрутка (1000 мс = 1 секунда)

// ===== СПИСОК ВОЗМОЖНЫХ ПРИЗОВ =====
// У каждого приза: имя (для текста), имя файла картинки и шанс (вес) выпадения.
// Шансы не обязаны давать в сумме ровно 100 — функция pickWinner() нормализует их сама.
const ITEMS = [
    { name: "gift_red",   image: "red_presrnt.jpg",   chance: 30 }, // Вес 30
    { name: "gift_green", image: "green_present.png", chance: 10 }, // Вес 10
    { name: "gift_white", image: "white_present.png", chance: 50 }, // Вес 50
];

// ===== ЭЛЕМЕНТЫ СТРАНИЦЫ =====
const caseImg = document.getElementById("Case_Js");             // Картинка подарка
const rouletteSection = document.getElementById("rouletteSection"); // Блок рулетки над подарком
const rouletteWindow = document.getElementById("Peso");         // Окно, где видна лента
const rlb = document.getElementById("roulette_bar");            // Сама лента с карточками
const spinBtn = document.getElementById("Spin_Button");         // Кнопка «Make a Wish»
const cancelBtn = document.getElementById("Cancel_Button");     // Кнопка «Cancel»
const dialog = document.getElementById("drop_dialog");          // Модальное окно результата
const resultEl = document.getElementById("result");             // Куда кладём картинку и текст приза

// ===== ПЕРЕМЕННЫЕ-ФЛАГИ =====
// Флаг — обычная переменная true/false, которая запоминает состояние программы.
let giftFell = false;      // true — подарок уже упал и начал трястись
let giftOpened = false;    // true — по подарку кликнули и рулетка появилась
let spinning = false;      // true — лента сейчас крутится (защита от повторных кликов)
let spinEndHandler = null; // Ссылка на обработчик окончания прокрутки (нужна для отмены)

// ===== ШАГ 1: ПОДАРОК ПАДАЕТ САМ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
function startGiftDrop() {
    // classList.add() добавляет CSS-класс. В style.css у .drop-in есть анимация падения.
    caseImg.classList.add("drop-in");

    // animationend — событие, которое браузер поднимет, когда анимация закончится.
    // { once: true } означает: выполнить один раз и больше не следить за событием.
    caseImg.addEventListener("animationend", () => {
        caseImg.classList.remove("drop-in"); // Убираем анимацию падения
        caseImg.classList.add("shake");      // Включаем бесконечную тряску
        giftFell = true;                     // Теперь подарок можно нажать
    }, { once: true });
}

// ===== ШАГ 2: КЛИК ПО ПОДАРКУ ПОКАЗЫВАЕТ РУЛЕТКУ НАД НИМ =====
function openRoulette() {
    // Если подарок ещё падает или рулетка уже открыта — ничего не делаем.
    if (!giftFell || giftOpened) return;

    giftOpened = true;                 // Запоминаем, что рулетка открыта
    caseImg.classList.remove("shake"); // Останавливаем тряску
    rouletteSection.classList.add("show"); // В CSS у .show стоит visibility: visible + анимация появления

    // Важно: прокрутку НЕ запускаем автоматически.
    // Игрок сам нажимает «Make a Wish» — так последовательность из задания сохраняется:
    // упал → трясётся → клик → рулетка появилась над подарком.
}

// ===== ВЫБОР ПРИЗА С УЧЁТОМ ШАНСОВ =====
// Возвращает один случайный приз из массива ITEMS.
function pickWinner() {
    // 1. Считаем общий вес всех призов: 30 + 10 + 50 = 90.
    let total = 0;
    for (const item of ITEMS) {
        total += item.chance;
    }

    // 2. Берём случайное число от 0 до total (но не включая total).
    //    Math.random() даёт число от 0 до 1, умножаем его на общий вес.
    let r = Math.random() * total;
    //    Призы с весами 30/10/50 занимают отрезки:
    //    красный 0–30, зелёный 30–40, белый 40–90.

    // 3. Идём по призам и вычитаем их вес из r.
    //    Тот приз, чей отрезок «поглотил» r, и побеждает.
    for (const item of ITEMS) {
        if (r < item.chance) return item; // r попал в отрезок этого приза
        r -= item.chance;                 // Нет — переходим к следующему отрезку
    }

    // 4. Страховка от ошибок округления: если из-за дробей цикл ничего не вернул,
    //    всё равно вернём последний приз.
    return ITEMS[ITEMS.length - 1];
}

// ===== СОЗДАНИЕ ЛЕНТЫ КАРТОЧЕК =====
// На позиции WINNER_INDEX ставим выигрышный приз, остальные карточки — случайные.
function buildLine(winner) {
    rlb.innerHTML = ""; // Очищаем ленту от карточек прошлого вращения

    // Цикл создаст ровно TOTAL_ITEMS карточек.
    for (let i = 0; i < TOTAL_ITEMS; i++) {
        const item = (i === WINNER_INDEX) ? winner : pickWinner();
        // Тернарный оператор «? :» — короткая запись if/else:
        // если i равно номеру победителя, берём winner, иначе случайный приз.

        const card = document.createElement("div"); // Создаём пустой <div> в памяти браузера
        card.className = "roulette_item";            // Даём ему класс, чтобы применились стили CSS

        const img = document.createElement("img");   // Создаём элемент картинки
        img.src = item.image;                        // Указываем адрес файла
        img.alt = item.name;                         // Текст для читателей с экранным диктором

        card.appendChild(img);   // Кладём картинку внутрь карточки
        rlb.appendChild(card);   // Добавляем карточку в конец ленты
    }
}

// ===== ПРОКРУТКА РУЛЕТКИ =====
function spin() {
    // Защита: крутить можно только после открытия рулетки и не во время прокрутки.
    if (!giftOpened || spinning) return;

    spinning = true;             // Поднимаем «флаг занятости»
    spinBtn.disabled = true;     // Блокируем кнопку, чтобы нельзя было нажать её второй раз

    const winner = pickWinner(); // Заранее определяем победителя
    buildLine(winner);           // Собираем ленту с победителем на нужной позиции

    // 1. Мгновенно ставим ленту в начало БЕЗ анимации.
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";

    // Чтение offsetWidth заставляет браузер применить сброс прямо сейчас.
    // Иначе браузер может «слить» сброс и новую анимацию в одно движение.
    void rlb.offsetWidth;

    // 2. Считаем, на сколько пикселей сдвинуть ленту.
    //    Центр выигрышной карточки в начальном состоянии:
    const cardCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    //    Нужно, чтобы этот центр оказался под указателем, то есть в середине окна:
    const windowWidth = rouletteWindow.clientWidth;
    const targetOffset = windowWidth / 2 - cardCenter;
    //    Небольшой случайный сдвиг внутри карточки, чтобы остановка не была всегда ровной.
    //    Диапазон примерно −36…+36 px — карточка всё равно остаётся под указателем.
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.6;

    // 3. Включаем анимацию и задаём конечную позицию.
    //    cubic-bezier — «кривая скорости»: быстро стартуем и плавно тормозим.
    rlb.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    rlb.style.transform = `translateX(${targetOffset + jitter}px)`;

    // 4. Когда transition (переход) закончится, покажем результат.
    //    Сохраняем функцию в переменную, чтобы при отмене можно было снять обработчик.
    spinEndHandler = (event) => {
        // На всякий случай проверяем, что закончился именно переход transform.
        if (event.propertyName !== "transform") return;

        rlb.removeEventListener("transitionend", spinEndHandler);
        spinEndHandler = null;
        finish(winner);
    };
    rlb.addEventListener("transitionend", spinEndHandler);
}

// ===== ПОКАЗ РЕЗУЛЬТАТА =====
function finish(winner) {
    spinning = false;          // Прокрутка завершена
    spinBtn.disabled = false;  // Разблокируем кнопку — можно крутить ещё раз

    resultEl.innerHTML = "";   // Чистим результат предыдущего вращения

    const img = document.createElement("img"); // Создаём картинку приза
    img.src = winner.image;
    img.alt = winner.name;

    const title = document.createElement("p"); // Создаём подпись
    title.textContent = `Выпало: ${winner.name}`;
    // Шаблонная строка в обратных кавычках позволяет вставлять переменные через ${...}

    resultEl.append(img, title); // Добавляем оба элемента в окно результата
    dialog.showModal();          // Показываем модальное окно поверх страницы
}

// ===== ОТМЕНА / СБРОС =====
function reset() {
    // Если прокрутка ещё идёт, снимаем обработчик, чтобы результат НЕ появился после сброса.
    if (spinEndHandler !== null) {
        rlb.removeEventListener("transitionend", spinEndHandler);
        spinEndHandler = null;
    }

    spinning = false;          // Снимаем флаг занятости
    spinBtn.disabled = false;  // Кнопка снова доступна
    dialog.close();            // Закрываем окно результата, если оно открыто
    resultEl.innerHTML = "";   // Очищаем содержимое окна результата

    // Возвращаем ленту в исходное положение без анимации.
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";

    // Рулетка остаётся открытой: можно сразу нажать «Make a Wish» ещё раз.
}

// ===== ПРИВЯЗКА СОБЫТИЙ =====
// addEventListener("событие", функция) = «когда произойдёт событие, выполни функцию».
caseImg.addEventListener("click", openRoulette); // Клик по подарку → показать рулетку
spinBtn.addEventListener("click", spin);         // Клик по кнопке → запустить прокрутку
cancelBtn.addEventListener("click", reset);      // Клик по Cancel → сбросить результат

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
// Скрипт подключён с defer, поэтому все элементы уже существуют в DOM.
startGiftDrop(); // Подарок падает, затем начинает трястись и ждёт клика
