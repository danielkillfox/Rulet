let Rulette = document.getElementById("Peso")


// ===== НАСТРОЙКИ =====
const TOTAL_ITEMS = 40;      // сколько карточек в ленте
const ITEM_WIDTH = 120;      // ширина одной карточки в px (должна совпадать с CSS)
const WINNER_INDEX = 30;     // на какой позиции в ленте будет выигрышная карточка
const SPIN_TIME = 5000;      // длительность прокрутки в мс

// Шансы не обязаны давать в сумме 100 — они нормализуются автоматически
const ITEMS = [
    { name: "gift_red",   image: "red_present.jpg",   chance: 30 },
    { name: "gift_green", image: "green_present.jpg", chance: 10 },
    { name: "gift_white", image: "white_present.jpg", chance: 50 },
];

// ===== ЭЛЕМЕНТЫ СТРАНИЦЫ =====
const spinBtn   = document.getElementById("Spin_Button");
const cancelBtn = document.getElementById("Cancel_Button");
const rlb       = document.getElementById("roulette_bar");   // лента
const dialog    = document.getElementById("drop_dialog");    // окно результата
const resultEl  = document.getElementById("result");         // содержимое окна

let spinning = false; // идёт ли сейчас прокрутка

// ===== ВЫБОР ПРЕДМЕТА ПО ШАНСАМ =====
function pickWinner() {
    // Суммируем все шансы
    const total = ITEMS.reduce((sum, item) => sum + item.chance, 0);

    // Случайное число от 0 до total
    let r = Math.random() * total;

    // Идём по предметам и вычитаем их шансы из r.
    // Предмет, в "отрезок" которого попало r, и выигрывает.
    for (const item of ITEMS) {
        if (r < item.chance) return item;
        r -= item.chance;
    }

    // Страховка от ошибок округления
    return ITEMS[ITEMS.length - 1];
}

// ===== СОЗДАНИЕ ЛЕНТЫ =====
function buildLine(winner) {
    rlb.innerHTML = ""; // очищаем ленту

    for (let i = 0; i < TOTAL_ITEMS; i++) {
        // На позиции WINNER_INDEX ставим победителя,
        // на остальных — случайные предметы для красоты
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

// ===== ПРОКРУТКА =====
function spin() {
    if (spinning) return; // не запускаем, если уже крутится
    spinning = true;
    spinBtn.disabled = true;

    const winner = pickWinner();
    buildLine(winner);

    // 1. Сбрасываем ленту в начало без анимации
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0)";
    rlb.offsetWidth; // принудительный reflow, чтобы браузер применил сброс

    // 2. Считаем, куда сдвинуть ленту:
    //    центр выигрышной карточки должен оказаться под указателем (в центре окна)
    const windowWidth = rlb.parentElement.clientWidth;
    const cardCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    const targetOffset = windowWidth / 2 - cardCenter;

    // Небольшой случайный сдвиг внутри карточки, чтобы остановка не была всегда по центру
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.6;

    // 3. Запускаем анимацию
    rlb.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    rlb.style.transform = `translateX(${targetOffset + jitter}px)`;

    // 4. Когда анимация закончилась — показываем результат
    rlb.addEventListener("transitionend", () => finish(winner), { once: true });
}

// ===== ПОКАЗ РЕЗУЛЬТАТА =====
function finish(winner) {
    spinning = false;
    spinBtn.disabled = false;

    resultEl.innerHTML = "";
    const img = document.createElement("img");
    img.src = winner.image;
    img.alt = winner.name;

    const title = document.createElement("p");
    title.textContent = `Выпало: ${winner.name}`;

    resultEl.append(img, title);
    dialog.showModal();
}

// ===== СБРОС =====
function reset() {
    dialog.close();
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0)";
}

// ===== СОБЫТИЯ =====
spinBtn.addEventListener("click", spin);
cancelBtn.addEventListener("click", reset);