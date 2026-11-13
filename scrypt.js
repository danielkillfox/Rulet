// Получаем контейнер рулетки (само окно). Сейчас не используется напрямую, но оставлено для возможного расширения.
let Rulette = document.getElementById("Peso");

// ===== НАСТРОЙКИ РУЛЕТКИ =====
const TOTAL_ITEMS = 40;      // сколько карточек в ленте
const ITEM_WIDTH = 120;      // ширина одной карточки в px (должна совпадать с CSS: .roulette_item flex: 0 0 120px)
const WINNER_INDEX = 30;     // на какой позиции в ленте будет выигрышная карточка (от 0)
const SPIN_TIME = 5000;      // длительность прокрутки в миллисекундах

// Список предметов с шансами выпадения.
// Шансы не обязаны давать в сумме 100 — они нормализуются автоматически в pickWinner().
const ITEMS = [
    { name: "gift_red",   image: "red_presrnt.jpg",   chance: 30 },
    { name: "gift_green", image: "green_present.png", chance: 10 },
    { name: "gift_white", image: "white_present.png", chance: 50 },
];

// ===== ЭЛЕМЕНТЫ СТРАНИЦЫ =====
const spinBtn   = document.getElementById("Spin_Button");   // кнопка запуска
const cancelBtn = document.getElementById("Cancel_Button"); // кнопка отмены/сброса
const rlb       = document.getElementById("roulette_bar");  // лента с карточками
const dialog    = document.getElementById("drop_dialog");   // модальное окно результата
const resultEl  = document.getElementById("result");        // содержимое окна результата

let spinning = false; // флаг: идёт ли сейчас прокрутка (защита от повторных кликов)

// ===== ВЫБОР ПРЕДМЕТА ПО ШАНСАМ =====
// Возвращает случайный предмет с учётом весов (chance).
function pickWinner() {
    // Суммируем все шансы — получаем "общий вес"
    const total = ITEMS.reduce((sum, item) => sum + item.chance, 0);

    // Случайное число от 0 до total (не включая total)
    let r = Math.random() * total;

    // Идём по предметам: вычитаем шанс текущего предмета из r.
    // Предмет, в "отрезок" которого попало r, и выигрывает.
    for (const item of ITEMS) {
        if (r < item.chance) return item; // попали в этот отрезок
        r -= item.chance;                  // переходим к следующему отрезку
    }

    // Страховка от ошибок округления с плавающей точкой
    return ITEMS[ITEMS.length - 1];
}

// ===== СОЗДАНИЕ ЛЕНТЫ КАРТОЧЕК =====
// Заполняет ленту: на позиции WINNER_INDEX ставит победителя,
// на остальных — случайные предметы (для визуальной "мешанины").
function buildLine(winner) {
    rlb.innerHTML = ""; // очищаем ленту от старых карточек

    for (let i = 0; i < TOTAL_ITEMS; i++) {
        const item = (i === WINNER_INDEX) ? winner : pickWinner();

        const card = document.createElement("div");
        card.className = "roulette_item";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;

        card.appendChild(img);
        rlb.appendChild(card);
    }
}

// ===== ПРОКРУТКА РУЛЕТКИ =====
function spin() {
    if (spinning) return; // не запускаем, если уже крутится
    spinning = true;
    spinBtn.disabled = true; // блокируем кнопку на время прокрутки

    const winner = pickWinner(); // определяем победителя
    buildLine(winner);           // собираем ленту с победителем на нужной позиции

    // 1. Сбрасываем ленту в начало без анимации
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0)";
    rlb.offsetWidth; // принудительный reflow: заставляем браузер применить сброс до анимации

    // 2. Считаем, куда сдвинуть ленту:
    //    центр выигрышной карточки должен оказаться под указателем (в центре окна)
    const windowWidth = rlb.parentElement.clientWidth;
    const cardCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    const targetOffset = windowWidth / 2 - cardCenter;

    // Небольшой случайный сдвиг внутри карточки, чтобы остановка не была всегда ровно по центру
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.6;

    // 3. Запускаем анимацию с плавным замедлением (cubic-bezier)
    rlb.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    rlb.style.transform = `translateX(${targetOffset + jitter}px)`;

    // 4. Когда анимация закончилась — показываем результат (срабатывает один раз)
    rlb.addEventListener("transitionend", () => finish(winner), { once: true });
}

// ===== ПОКАЗ РЕЗУЛЬТАТА =====
function finish(winner) {
    spinning = false;          // прокрутка завершена
    spinBtn.disabled = false;  // разблокируем кнопку

    resultEl.innerHTML = "";    // очищаем предыдущий результат

    const img = document.createElement("img");
    img.src = winner.image;
    img.alt = winner.name;

    const title = document.createElement("p");
    title.textContent = `Выпало: ${winner.name}`;

    resultEl.append(img, title);
    dialog.showModal(); // показываем модальное окно с результатом
}

// ===== СБРОС / ОТМЕНА =====
function reset() {
    dialog.close(); // закрываем окно результата
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0)"; // возвращаем ленту в начало
}

// ===== ОТКРЫТИЕ ПОДАРКА =====
// При клике на подарок: тряска -> падение -> появление рулетки -> автозапуск прокрутки
const caseImg = document.getElementById("Case_Js");
const rouletteSection = document.getElementById("rouletteSection");

let giftOpened = false; // защита от повторных кликов по подарку

caseImg.addEventListener("click", () => {
    if (giftOpened) return; // если уже открыт — игнорируем
    giftOpened = true;

    // 1. Тряска подарка (0.6 секунды)
    caseImg.classList.add("shake");

    // 2. После тряски — падение (1 секунда)
    setTimeout(() => {
        caseImg.classList.remove("shake");
        caseImg.classList.add("fall");
    }, 600);

    // 3. После падения — показываем рулетку и запускаем прокрутку
    setTimeout(() => {
        caseImg.style.pointerEvents = "none"; // делаем подарок некликабельным
        rouletteSection.classList.add("show"); // показываем блок рулетки (display: block)
        setTimeout(spin, 300);               // небольшая задержка перед стартом прокрутки
    }, 1600);
});

// ===== ПРИВЯЗКА СОБЫТИЙ К КНОПКАМ =====
spinBtn.addEventListener("click", spin);     // клик "Make a Wish" запускает прокрутку
cancelBtn.addEventListener("click", reset);  // клик "Cancel" сбрасывает результат и ленту