class Game {
    constructor() {
        this.idList;
        this.brokeListener = [];
        this.isCheckedSize = 0;
        this.levelList = {
            1: 6,
            2: 8,
            3: 10,
            4: 12,
            5: 14
        }
        this.level = localStorage.getItem('level') || 1;
        this.startCount = 6;
        this.defaultYTH = 5;
        this.yth = 0;
        this.skor = 0;
    }
    start() {
        gameScene.classList.remove('d-none');
        setTimeout(() => {
            gameScene.classList.remove('gameSceneAnim');
        }, 1);
        this.yth += this.defaultYTH;
    }
    ready(newLevel = false) {
        if (typeof newLevel == 'boolean') this.level++;
        else if (typeof newLevel == 'number') this.level = newLevel;
        if (this.level > this.levelList.length) return alert('Oyun bitti tebrikler arkaya havai fişek');
        let cards = createCards(this.levelList[this.level] || 6);
        cards = updateCards(cards);
        cards = setId(cards);
        let data = createRandomCartPosition(cards);
        cards = data.cards;
        cards = updateCardsPosition(cards);
        this.idList = data.idList
        pushCards(cards);
        customCardsRepeat();
        return true;
    }
    restart(newLevel) {
        const cards = document.querySelector('.cards');
        cards.innerHTML = "";
        this.setSkor(this.yth);
        this.isCheckedSize = 0;
        this.yth = 0;
        this.yth += this.defaultYTH;
        this.brokeListener = [];
        globalRepet = [], kacinciyedek = 0, idList = [];
        return this.ready(newLevel);
    }
    setYTH(num) {
        this.yth += num;

        if (this.yth <= 0) {
            alert('Kaybetme ekranı');
            game.restart();
        }
    }
    setSkor(yth) {
        this.skor += yth * 10;
    }
}

// all scene variables
const loader = document.querySelector('.loader');
const gameStartScene = document.querySelector('.gameStartScene');
const gameScene = document.querySelector('.gameScene');
const closeModal = document.querySelector('.closeModal');
const settingsScene = document.querySelector('.settingsScene');
const hardLevel = document.querySelector('.hardLevel');
const levelModal = document.querySelector('.levelModal');
const LevelEndModal = document.querySelector('.LevelEndModal');

// function variables
var globalRepet = [], kacinciyedek = 0, idList = [];

const game = new Game();
setTimeout(() => {
    loader.classList.add('opacity-0');
    gameStartScene.classList.remove('d-none')
    setTimeout(() => {
        loader.classList.add('d-none');
        gameStartScene.classList.remove('gameStartSceneAnim');
    }, 500);
    // const audioElement = document.createElement('audio');
    // audioElement.id = 'backgroundMusic';
    // audioElement.setAttribute('autoplay', "");
    // audioElement.setAttribute('loop', "");
    // audioElement.innerHTML = "<source src='music/robbery-of-the-century-152126.mp3' type='audio/mpeg'>";
    // document.body.appendChild(audioElement);
}, 2500);

const audio = document.getElementById('backgroundMusic');
const volume = document.getElementById('volume');
volume.value = localStorage.getItem('volume') * 10000;
audio.volume = localStorage.getItem('volume');
volume.addEventListener('input', () => {
    const num = parseFloat(volume.value / 10000);
    localStorage.setItem('volume', num);
    audio.volume = num;
    audio.play();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/volume", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    const data = JSON.stringify({ data: `${num}` });

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
        }
    };

    try {
        xhr.send(data);
    } catch (e) {
        console.log(e);
    }
})

// button listening
const gameStartSceneButtons = [...gameStartScene.children].filter(x => x.tagName == 'BUTTON');
for (const button of gameStartSceneButtons) {
    button.addEventListener('click', e => {
        audio.play();
        if (button.dataset.click == 'close') {
            closeModal.classList.remove('d-none');
            setTimeout(() => {
                closeModal.classList.remove('closeModalAnim');
            }, 1);
        } else if (button.dataset.click == 'settings') {
            settingsScene.classList.remove('d-none');
            setTimeout(() => {
                settingsScene.classList.remove('settingsSceneAnim');
            }, 1);
        } else if (button.dataset.click == 'new') {
            hardLevel.classList.remove('d-none');
            setTimeout(() => {
                hardLevel.classList.remove('hardLevelAnim');
            }, 1);
        }
    })
}

const closeModalButtons = [...closeModal.children[1].children].filter(x => x.tagName == 'BUTTON');
for (const button of closeModalButtons) {
    button.addEventListener('click', e => {
        if (button.dataset.click == 'close') {
            closeModal.classList.add('closeModalAnim');
            setTimeout(() => {
                closeModal.classList.add('d-none');
            }, 300);
        } else {
            window.close();
            setTimeout(() => {
                alert('Kapanma kodu çalıştı ama kapanmadı sebebi kullandığın tarayıcı başka tarayıcıda deneyebilirsin (hata konsolda gözüküyor)');
            }, 100);
        }
    })
}

const settingsSceneButtons = [...settingsScene.children].filter(x => x.tagName == 'BUTTON');
let first = true;
for (const button of settingsSceneButtons) {
    button.addEventListener('click', e => {
        if (button.dataset.click == 'close') {
            settingsScene.classList.add('settingsSceneAnim');
            setTimeout(() => {
                settingsScene.classList.add('d-none');
            }, 300);
        } else if (button.dataset.click == 'lang') {
            if (first) button.innerHTML += `<img src="img/azerbaycan.png" alt=""><img src="img/us.png" alt="">`;
            else button.innerHTML = `<img src="img/turkiye.png" alt="">`;
            first = !first;
        }
    })
}

//function variables
let lastClicked, isTimeOut = false, isTimeOutModal = false;
const hardLevelButtons = [...hardLevel.children].filter(x => x.tagName == 'BUTTON');
const levelModalButtons = [...levelModal.children].filter(x => x.tagName == 'BUTTON');
for (const button of hardLevelButtons) {
    button.addEventListener('click', e => {
        hardLevel.classList.add('hardLevelAnim');
        levelModal.classList.remove('d-none');
        setTimeout(() => {
            levelModal.classList.remove('levelModalAnim');
        }, 1);
        setTimeout(() => {
            hardLevel.classList.add('d-none');
        }, 300);
    })
}

const LevelEndModalButtons = [...LevelEndModal.children].filter(x => x.tagName == 'BUTTON');
for (const button of LevelEndModalButtons) {
    button.addEventListener('click', e => {
        LevelEndModal.classList.add('LevelEndModalAnim');
        gameScene.classList.add('gameSceneAnim');
        gameStartScene.classList.add('gameStartSceneAnim');
        setTimeout(() => {
            LevelEndModal.classList.add('d-none');
            gameStartScene.classList.add('d-none');
            game.ready(LevelEndModalButtons.indexOf(button) + 1);
            game.start();
        }, 300);
    });
    if (!(LevelEndModalButtons.indexOf(button) < level)) button.disabled = true;
}

const level = localStorage.getItem('level') || 1;
for (const button of levelModalButtons) {
    button.addEventListener('click', e => {
        if (!(levelModalButtons.indexOf(button) < level) || levelModalButtons.filter(btn => !btn.disabled).length > level) return;
        levelModal.classList.add('levelModalAnim');
        gameScene.classList.add('gameSceneAnim');
        gameStartScene.classList.add('gameStartSceneAnim');
        setTimeout(() => {
            levelModal.classList.add('d-none');
            gameStartScene.classList.add('d-none');
            game.ready(levelModalButtons.indexOf(button) + 1);
            game.start();
        }, 300);
    });
    if (!(levelModalButtons.indexOf(button) < level)) button.disabled = true;
}

// functions
function customCardsRepeat() {
    const customCards = document.querySelectorAll('.cards .custom-card>div.card-back');
    for (const crd of customCards) {
        let cardBack = crd.parentElement.querySelector('.card-back');
        let cardFront = crd.parentElement.querySelector('.card-front');
        cardBack.classList.toggle('card-back-anim');
        cardFront.classList.toggle('custom-card-anim');
        crd.addEventListener('click', async () => {
            if (game.brokeListener.includes(crd)) return;
            if (isTimeOut) {
                if (!isTimeOutModal) {
                    isTimeOutModal = true
                    const cantClickable = document.querySelector('.cantClickable');

                    cantClickable.classList.remove('d-none');
                    setTimeout(() => {
                        cantClickable.classList.remove('cantClickableAnim');
                    }, 1);

                    setTimeout(() => {
                        cantClickable.classList.add('cantClickableAnim');
                        setTimeout(() => {
                            cantClickable.classList.add('d-none');
                            isTimeOutModal = false;
                        }, 250);
                    }, 999);
                }
                return;
            }
            if (lastClicked == crd) {
                isTimeOut = true;
                await new Promise(res => setTimeout(res, 100));
                isTimeOut = false;
            }
            let cardBack = crd.parentElement.querySelector('.card-back');
            let cardFront = crd.parentElement.querySelector('.card-front');
            cardBack.classList.toggle('card-back-anim');
            cardFront.classList.toggle('custom-card-anim');
            if (lastClicked == crd) return;
            if (!lastClicked) lastClicked = crd;
            else {
                let lastClickedBack = lastClicked.parentElement.querySelector('.card-back');
                let lastClickedFront = lastClicked.parentElement.querySelector('.card-front');

                isTimeOut = true;
                setTimeout(async () => {
                    isTimeOut = false;
                    let rotate = await isChecked(crd, lastClicked);

                    if (rotate) {
                        cardBack.classList.toggle('card-back-anim');
                        cardFront.classList.toggle('custom-card-anim');
                        lastClickedBack.classList.toggle('card-back-anim');
                        lastClickedFront.classList.toggle('custom-card-anim');
                    }
                    lastClicked = undefined;
                }, 1000);
            }
        });
    }
}

async function isChecked(card1, card2) {
    const customCards = document.querySelectorAll('.cards .custom-card');

    let card1ID = game.idList[[...customCards].indexOf(card1.parentNode)];
    let card2ID = game.idList[[...customCards].indexOf(card2.parentNode)];

    if (card1ID == card2ID) {
        card2.parentNode.parentNode.style = `
            top: 77.75% !important;
            left: ${(game.brokeListener.length > 5 ? 5 : game.brokeListener.length) * 1.5 + 5}vw !important;
            transform: rotateZ(90deg) !important;
            z-index: ${game.brokeListener.length};
        `
        card1.parentNode.parentNode.style = `
            top: 77.75% !important;
            left: ${(game.brokeListener.length > 5 ? 5 : game.brokeListener.length) * 1.5 + 5 + 1.5}vw !important;
            transform: rotateZ(90deg) !important;
            z-index: ${game.brokeListener.length + 1};
        `

        game.isCheckedSize++;
        game.setYTH(1);

        game.brokeListener.push(card1, card2);
        if (customCards.length / 2 == game.isCheckedSize) {
            await new Promise(res => setTimeout(() => res(), 1000));
            if (game.level >= localStorage.getItem('level')) {
                localStorage.setItem('level', game.level + 1);
                if (localStorage.getItem(`level-${game.level}`) < game.yth * 10) localStorage.setItem(`level-${game.level}`, game.yth * 10);
            }
            game.restart(true);
        }
        return false;
    } else {
        game.setYTH(-1);
        return true;
    }
}

function createCards(number) {
    if (isNaN(number)) throw new Error('not a number');
    // const gameCardsDiv = document.querySelector('.gameScene .cards');
    const cardsList = [[], []];
    for (let i = 0; i < number; i++) {
        const newCard = document.createElement('div');
        const newCard2 = document.createElement('div');

        newCard.classList.add('custom-card-div');
        newCard2.classList.add('custom-card-div');

        cardsList[0].push(newCard);
        cardsList[1].push(newCard2);
    }
    return cardsList;
}

function updateCards(cardsList) {
    for (const cards of cardsList) {
        for (const card of cards) {
            card.innerHTML = `
                <div class="custom-card">
                    <div class="card-front custom-card-anim">
                        <div>
                            <span class="cardNumber">1</span>
                            <div class="cardDesing">
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="cardDesing midCardDesing">
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span class="cardNumber">1</span>
                            <div class="cardDesing">
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class='card-back card-back-anim'></div>
                </div>
            `

            let first = true;
            const cardDesing = card.querySelectorAll('.cardDesing');
            const createCardDesing = createCardDesingFunc(cards.length);
            let pushGlobal, numm;
            for (const c of cardDesing) {
                pushGlobal = createCardDesing(c, first ? false : true);
                first = false;
            }
            if (pushGlobal) numm = pushGlobal(kacinciyedek);
            if (numm) kacinciyedek = numm;
        }
    }

    return cardsList;
}

function updateCardsPosition(cardsList) {
    let cardPosition = {
        0: 30,
        1: 50,
        2: 70
    }

    let sizeOfLine = cardsList.length / 2 / 2;
    for (const card of cardsList) {
        let length = [...cardsList].indexOf(card) + 1;
        card.style.transform = 'translate(-50%, -50%)';

        if (cardsList.length > 10) {
            // card.style.left = (length + 1 > 10 ? length - 10 + 1 : length + 1) * (100 / ((length + 1 > 10 ? cardsList.length - 10 : 10) + 1)) + '%';

            // card.style.top = (length + 1 > 10 ? cardPosition[2] : cardPosition[0]) + '%';

            card.style.left = (length / 2 > sizeOfLine ? length / 2 - sizeOfLine : length / 2) * (91 / (length / 2 > sizeOfLine ? cardsList.length / 2 - sizeOfLine : sizeOfLine)) + '%';
            card.style.top = (length / 2 > sizeOfLine ? cardPosition[2] : cardPosition[0]) + '%';
        } else {
            card.style.left = length * (100 / (cardsList.length + 1)) + '%';
            card.style.top = '50%';
        }
    }

    return cardsList;
}


function createCardDesingFunc(num) {
    let repeat = [], lastRandomColor, lastItems = [], lastItemsLength = 0, push = true;

    function random(length, floor) {
        if (length < 0) throw new Error('The input cannot be a negative number.');

        let rndm = Math.random() * (++length);
        if (floor) return rndm;
        return Math.floor(rndm);
    }

    function randomColor() {
        const colors = ["orange", "blue", "yellow", "purple", "green", "pink", "turquoise", "red", "navy", "brown"];
        let color;
        do {
            color = colors[Math.floor(Math.random() * (colors.length + 1))];
        } while (color == lastRandomColor);

        lastRandomColor = color;
        return color;
    }

    return function (card, repeatLast = false) {
        const spans = card.querySelectorAll('span');
        let randomColorSize = 0, kacinci = 0;

        for (let i = 0; i < spans.length; i++) {
            let span = spans[i];
            let rndmColor = 'black';

            if (globalRepet.length < num) {
                if (
                    (!repeatLast || !repeat[i]) &&
                    randomColorSize < 2 &&
                    (
                        !!random(random(1) < random(i) ? 0 : 2) ||
                        (repeat.every(color => color == 'black') && i == spans.length - 1)
                    )
                ) {
                    rndmColor = randomColor();
                    randomColorSize++;
                } else rndmColor = repeat[i];
                if (!rndmColor) rndmColor = 'black';
            } else {
                push = false;
                let colorsList = globalRepet[kacinciyedek][kacinci % 3];
                kacinci++;
                rndmColor = colorsList[i];
            }
            repeat[i] = rndmColor;

            span.style.backgroundColor = rndmColor;
            span.setAttribute('color', `color-${rndmColor}`);
            if (i == spans.length - 1 && push) {
                lastItemsLength++;
                lastItems.push(repeat);
                return function () {
                    globalRepet.push(lastItems);
                }
            } else if (i == spans.length - 1 && !push) {
                return function (n) {
                    return ++n;
                }
            }
        }
    }
}

function createId() {
    let id;
    do {
        id = (Math.random() * 1000).toString(36);
    } while (idList.includes(id))
    idList.push(id);
    return id;
}

function setId(cardsList) {
    let idList = new Map(), cards = [];

    for (let i = 0; i < cardsList[0].length; i++) {
        const card0 = cardsList[0][i];
        const card = cardsList[1][i];
        let id = createId();
        idList.set(id, card0);
        cards.push({ id, card });
    }

    return { idList, cards }
}

function createRandomCartPosition(cards) {
    let cardsPushList = [];
    let idList = [];
    for (const [id, card] of cards.idList) {
        let go = false;
        let go2 = false;
        do {
            let random = Math.floor(Math.random() * (cards.idList.size * 2));
            if (!cardsPushList[random]) {
                cardsPushList[random] = card;
                idList[random] = id;
                go = false;
            } else go = true;
        } while (go);
        do {
            let random = Math.floor(Math.random() * (cards.idList.size * 2));
            if (!cardsPushList[random]) {
                let cardData = cards.cards.filter(card => card.id == id)[0];
                cardsPushList[random] = cardData.card;
                idList[random] = cardData.id;
                go2 = false;
            } else go2 = true;
        } while (go2);
    }

    return { cards: cardsPushList, idList };
}

function pushCards(cards) {
    const cardsDiv = document.querySelector('.gameScene .cards');

    for (const card of cards) {
        cardsDiv.appendChild(card);
    }

    return cardsDiv;
}