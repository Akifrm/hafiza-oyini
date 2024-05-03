import tr from './language/tr.js';
import az from './language/az.js';
import us from './language/us.js';
class Game {
    constructor(levelCount = 5, startCount = 6) {
        this.idList;
        this.brokeListener = [];
        this.isCheckedSize = 0;
        this.levelList = {};
        this.gameHardLevelList = {
            easy: 50,
            normal: 80,
            hard: 100
        }
        this.level = 1;
        this.startCount = startCount;
        this.levelCount = levelCount;
        this.defaultYTH = 5;
        this.yth = 0;
        this.skor = 0;
        this.ythToSkor = 10;
        this.gameHardLevel;
        this.skors = [];
        this.levelFinished;
        this.gameFinished;
        this.playingLevel = 0;
        this.confettiInterval;
        this.setedVar = false;
        this.brokeClick = false;
        this.languageList = {
            'tr': tr,
            'az': az,
            'us': us
        };
        this.user = {
            language: ''
        };
        for (let i = 0; i < this.levelCount; i++) {
            this.levelList[i + 1] = i * 2 + this.startCount;
            this.skors.push(0);
        }
        this.changeLang();
    }
    start() {
        gameScene.classList.remove('d-none');
        setTimeout(() => {
            gameScene.classList.remove('modalOrSceneAnim');
        }, 1);
    }
    restart(newLevel = false) {
        const cardsDiv = document.querySelector('.cards');
        cardsDiv.innerHTML = "";

        this.isCheckedSize = 0;
        this.brokeListener = [];
        this.levelFinished = false;
        globalRepet = [], kacinciyedek = 0, idList = [], numberList = [];
        this.brokeClick = false;
        if (newLevel == 'restart') this.restartDatabase();

        let playingLevel = newLevel == 'restart'
            ? this.level
            : typeof newLevel == 'boolean' && newLevel == true
                ? this.level
                : typeof newLevel == 'number'
                    ? newLevel
                    : this.level;

        this.yth = 0;
        this.yth += this.defaultYTH;
        this.playingLevel = 0;
        this.playingLevel += playingLevel;
        let cards = createCards(this.levelList[playingLevel] || 6);

        cards = updateCards(cards);
        cards = setId(cards);
        let data = createRandomCartPosition(cards);
        cards = data.cards;
        this.idList = data.idList
        cards = updateCardsPosition(cards);
        pushCards(cards);
        customCardsRepeat();

        return true;
    }
    levelEnd(nextLevel = false) {
        this.brokeClick = true;
        if (nextLevel && this.getGameEnd()) {
            if (this.playingLevel >= this.level) this.setLevel(this.level + 1);
            return true;
        } else if (this.playingLevel >= this.level && nextLevel) this.setLevel(this.level + 1);

        const yth = LevelEndModal.querySelector('.yth');
        const skorDiv = LevelEndModal.querySelector('.skor');
        const loseOrWin = LevelEndModal.querySelector('.loseOrWin');
        const lang = this.getLang();
        const skor = nextLevel ? this.getSkor(this.level - 1) : this.yth * this.ythToSkor;

        yth.innerText = `${lang.remaining_yth}${skor / this.ythToSkor}`;
        skorDiv.innerText = `${lang.score}${skor}`;
        loseOrWin.innerText = lang.level_failed;
        loseOrWin.classList.add('text-danger');
        if (nextLevel) {
            const nextLevelButton = LevelEndModal.querySelector('button:last-child');
            nextLevelButton.classList.remove('d-none');
            this.levelFinished = true;
            loseOrWin.innerText = lang.level_success;
            loseOrWin.classList.remove('text-danger');
            loseOrWin.classList.add('text-success');
        }

        LevelEndModal.classList.remove('d-none');
        setTimeout(() => {
            LevelEndModal.classList.remove('modalOrSceneAnim');
        }, 1);
    }
    setYTH(num) {
        this.yth += num;

        if (this.yth <= 0) this.levelEnd(this.yth);
    }
    getSkor(level) {
        if (!level) return this.skor;
        else return this.skors[level - 1] || 0;
    }
    async setSkor(level = this.level) {
        let skor = this.yth * this.ythToSkor;
        this.skor += skor;
        console.log(this.skor, skor, this.skors[level - 1], this.skors[level - 1] < skor);

        if (this.skors[level - 1] < skor) {
            this.seted = false;
            this.skors[level - 1] = skor;
            await setDataToMongo(`levelYTH.${level - 1}`, skor);
        }
        return skor;
    }
    setGameLevel(level) {
        this.gameHardLevel = level;
        setDataToMongo('gameHardLevel', level);
        return true;
    }
    setLevel(level) {
        if (this.level < Object.keys(this.levelList).length) {
            this.level = level;
            setDataToMongo('level', level);
            return true;
        } else return false;
    }
    getNeedSkor() {
        return this.gameHardLevelList[this.gameHardLevel];
    }
    getTotalSkor() {
        return this.skors.reduce((total, current) => total + current, 0);
    }
    getGameEnd(retrn) {
        let gameEnd = this.level >= Object.keys(this.levelList).length;
        this.gameFinished = gameEnd;
        if (retrn && gameEnd) return true;
        else if (gameEnd) {
            const customCards = document.querySelectorAll('.cards .custom-card>div.card-back');
            for (const card of customCards) {
                this.brokeListener = [];
                this.brokeListener.push(card);
            }

            gameEndModal.classList.remove('d-none');
            const skor = this.getTotalSkor();
            const lang = this.getLang();
            gameEndModal.querySelector('.yth').innerText = `${lang.total_remaining_yth}${Math.floor(skor / this.ythToSkor)}`;
            gameEndModal.querySelector('.skor').innerText = `${lang.total_score}${skor}`;
            if (this.seted) gameEndModal.querySelector('[data-click="setSkor"]').classList.add('d-none');
            else gameEndModal.querySelector('[data-click="setSkor"]').classList.remove('d-none');
            removeDnoneOnButton();

            setTimeout(() => {
                gameEndModal.classList.remove('modalOrSceneAnim');
            }, 1);

            for (const button of gameStartSceneButtons) {
                button.disabled = true;
            }

            const duration = 20 * 1000,
                animationEnd = Date.now() + duration,
                defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            this.confettiInterval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    for (const button of gameStartSceneButtons) {
                        button.disabled = false;
                    }
                    document.body.removeEventListener('click', cutstomConfetti)
                    return clearInterval(this.confettiInterval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    })
                );
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    })
                );
            }, 250);
            document.body.addEventListener('click', cutstomConfetti);
            return true;
        } else return false;
    }
    restartDatabase() {
        this.level = 1;
        this.gameHardLevel = "";
        this.skor = 0;
        this.levelFinished = false;
        this.gameFinished = false;
        this.skors = [];

        for (let i = 0; i < Object.keys(this.levelList).length; i++) {
            this.skors.push(0);
        }
        gameEndModal.querySelector('[data-click="setSkor"]').classList.remove('d-none');

        setDataToMongo('restart');
    }
    changeLang(language = (navigator.language || navigator.userLanguage).split('-')[0] || 'tr') {
        const langs = [...settingsScene.querySelectorAll('.language')];
        this.user.language = language;

        let first = true;
        for (const lang of langs) {
            if (lang.dataset.changelang == language) {
                lang.dataset.order = '1';
                lang.classList.add('activeLanguage');
            } else {
                lang.classList.remove('activeLanguage');
                if (first) lang.dataset.order = '2';
                else lang.dataset.order = '3';
                first = !first;
            }
        }

        if (this.getLang() == undefined) {
            this.user.language = 'us';
            language = 'us';
        }
        const lang = this.getLang();

        for (const text of document.querySelectorAll(`[data-lang]`)) {
            const txt = text.dataset.lang;
            text.innerText = txt.replace(`${txt}`, lang[txt]);
        }
        createLevelButtons(this);
    }
    getLang() {
        return this.languageList[this.user.language];
    }
    setData(data) {
        this.skors = data.levelYTH;
        this.level = data.level;
        this.gameHardLevel = data.gameHardLevel;

        let finish = data.levelYTH[data.levelYTH.length - 1] > 0 ? true : false
        this.levelFinished = finish;
        this.gameFinished = finish;
        this.setedVar = data.seted;
    }
    async leaderboard() {
        const data = await getDataToMongo("skor", "skor");

        return globalLeaderboard.querySelector('.leaderboard').innerHTML = data.map(x => `<div>${x.name}: ${x.skor}</div>`).slice(0, 10).join('\n');
    }
    set seted(set) {
        this.setedVar = set;
        if (this.seted) setDataToMongo('seted', set);
    }
    get seted() {
        return this.setedVar;
    }
}

// all scenes and modals variables
const loader = document.querySelector('.loader'),
    gameStartScene = document.querySelector('.gameStartScene'),
    gameScene = document.querySelector('.gameScene'),
    closeModal = document.querySelector('.closeModal'),
    settingsScene = document.querySelector('.settingsScene'),
    hardLevel = document.querySelector('.hardLevel'),
    levelModal = document.querySelector('.levelModal'),
    LevelEndModal = document.querySelector('.LevelEndModal'),
    playerSureModal = document.querySelector('.playerSureModal'),
    gameEndModal = document.querySelector('.gameEndModal'),
    setSkorModal = document.querySelector('.setSkorModal'),
    globalLeaderboard = document.querySelector('.globalLeaderboard');

// function variables
let globalRepet = [],
    kacinciyedek = 0,
    idList = [],
    lastClicked,
    isTimeOut = false,
    isTimeOutModal = false,
    numberList = [];

const game = new Game(5, 6);
createLevelButtons(game);
const start = new Date();
let data = await getDataToMongo();
if (data) game.setData(data);
else {
    await setDataToMongo('restart');
    data = await getDataToMongo();
    if (data) game.setData(data);
}
const end = new Date();
removeDnoneOnButton();
let int = setTimeout(() => {
    loader.classList.add('modalOrSceneAnim');
    gameStartScene.classList.remove('d-none');
    setTimeout(() => {
        loader.classList.add('d-none');
        gameStartScene.classList.remove('modalOrSceneAnim');
    }, 500);
}, 2500 - (end - start));
if (!data) clearInterval(int);

const audio = document.getElementById('backgroundMusic');
const volume = document.getElementById('volume');
volume.value = ((data && data.volume) ? data.volume : .5) * 10000;
audio.volume = (data && data.volume) ? data.volume : .5;

volume.addEventListener('change', () => {
    const num = parseFloat(volume.value / 10000);
    setDataToMongo('volume', num);
});

volume.addEventListener('input', () => {
    const num = parseFloat(volume.value / 10000);
    audio.volume = num;
    audio.play();
})

// button listening
const gameStartSceneButtons = [...gameStartScene.children].filter(x => x.tagName == 'BUTTON');
for (const button of gameStartSceneButtons) {
    button.addEventListener('click', e => {
        audio.play();
        const { click } = button.dataset;
        if (click == 'close') {
            closeModal.classList.remove('d-none');
            setTimeout(() => {
                closeModal.classList.remove('modalOrSceneAnim');
            }, 1);
        } else if (click == 'settings') {
            settingsScene.classList.remove('d-none');
            setTimeout(() => {
                settingsScene.classList.remove('modalOrSceneAnim');
            }, 1);
        } else if (click == 'new') {
            if (game.gameHardLevel) {
                playerSureModal.classList.remove('d-none');

                setTimeout(() => {
                    playerSureModal.classList.remove('modalOrSceneAnim');
                }, 1);
            } else {
                hardLevel.classList.remove('d-none');

                setTimeout(() => {
                    hardLevel.classList.remove('modalOrSceneAnim');
                }, 1);
            }
        } else if (click == 'continue') {
            if (game.getGameEnd(true)) {
                gameStartScene.classList.add('modalOrSceneAnim');
                levelModal.classList.remove('d-none');

                setTimeout(() => {
                    levelModal.classList.remove('modalOrSceneAnim');
                }, 1);
                setTimeout(() => {
                    gameStartScene.classList.add('d-none');
                }, 300);

                return;
            }
            gameStartScene.classList.add('modalOrSceneAnim');
            game.restart(game.level);
            setTimeout(() => {
                gameStartScene.classList.add('d-none');
                game.start();
            }, 300);
        }
    })
}

const closeModalButtons = [...closeModal.children[1].children].filter(x => x.tagName == 'BUTTON');
for (const button of closeModalButtons) {
    button.addEventListener('click', e => {
        if (button.dataset.click == 'close') {
            closeModal.classList.add('modalOrSceneAnim');
            setTimeout(() => {
                closeModal.classList.add('d-none');
            }, 300);
        } else {
            window.close();
            setTimeout(() => {
                alert(game.getLang().close_code);
            }, 100);
        }
    })
}

const settingsSceneButtons = [...settingsScene.children].filter(x => x.tagName == 'BUTTON');
let first = true;
for (const button of settingsSceneButtons) {
    button.addEventListener('click', e => {
        const { click } = button.dataset;
        if (click == 'close') {
            settingsScene.classList.add('modalOrSceneAnim');
            setTimeout(() => {
                settingsScene.classList.add('d-none');
            }, 300);
        } else if (click == 'lang') {
            const langs = [...settingsScene.querySelectorAll('.language')];

            for (const lang of langs) {
                lang.style.top = `${(Number(lang.dataset.order) - 1) * 5 * first + 1}vw`;
            }

            if (!button.classList.value.includes('activeLanguage')) {
                game.changeLang(button.dataset.changelang);
                settingsScene.querySelector('.activeLanguage').classList.remove('activeLanguage');
                button.classList.add('activeLanguage');
            }
            first = !first;
        }
    })
}

const hardLevelButtons = [...hardLevel.children].filter(x => x.tagName == 'BUTTON');
for (const button of hardLevelButtons) {
    button.addEventListener('click', e => {
        game.setGameLevel(button.dataset.mode);
        hardLevel.classList.add('modalOrSceneAnim');
        levelModal.classList.remove('d-none');
        setTimeout(() => {
            levelModal.classList.remove('modalOrSceneAnim');
        }, 1);
        setTimeout(() => {
            hardLevel.classList.add('d-none');
        }, 300);
    })
}

const levelModalButtons = [...levelModal.children].filter(x => x.tagName == 'BUTTON');
const LevelEndModalButtons = [...LevelEndModal.children[LevelEndModal.children.length - 1].children].filter(x => x.tagName == 'BUTTON');
for (const button of LevelEndModalButtons) {
    button.addEventListener('click', e => {
        const { click } = button.dataset;
        if (click == 'next') {
            if (game.levelFinished == true) {
                game.restart(true);
                setTimeout(() => {
                    game.start();
                }, 300);
            } else {
                button.classList.add('d-none');
            }
        } else if (click == 'back') {
            gameScene.classList.add('modalOrSceneAnim');
            removeDnoneOnButton();
            gameStartScene.classList.remove('d-none');
            setTimeout(() => {
                gameStartScene.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                gameScene.classList.add('d-none');
            }, 300);
        } else if (click == 'levelModal') {
            levelModalButtonsDisable();
            levelModal.classList.remove('d-none');
            gameScene.classList.add('modalOrSceneAnim');
            setTimeout(() => {
                levelModal.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                gameScene.classList.add('d-none');
            }, 300);
        } else if (click == 'restart') {
            game.restart();
            setTimeout(() => {
                game.start();
            }, 300);
        }
        LevelEndModal.classList.add('modalOrSceneAnim');

        setTimeout(() => {
            LevelEndModal.classList.add('d-none');
        }, 300);
    });
}

const playerSureModalButtons = [...playerSureModal.children[[...playerSureModal.children].length - 1].children].filter(x => x.tagName == 'BUTTON');
for (const button of playerSureModalButtons) {
    button.addEventListener('click', e => {
        const { click } = button.dataset;
        if (click == 'yes') {
            game.restart('restart');
            gameStartScene.classList.add('modalOrSceneAnim');
            hardLevel.classList.remove('d-none');
            levelModalButtonsDisable();

            setTimeout(() => {
                hardLevel.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                gameStartScene.classList.add('d-none');
            }, 300);
        }
        playerSureModal.classList.add('modalOrSceneAnim');

        setTimeout(() => {
            playerSureModal.classList.add('d-none');
        }, 300);
    });
}

for (const button of levelModalButtons) {
    button.addEventListener('click', e => {
        let { level } = game;
        if (!(levelModalButtons.indexOf(button) < level) || levelModalButtons.filter(btn => !btn.disabled).length > level) return;
        levelModal.classList.add('modalOrSceneAnim');
        gameScene.classList.add('modalOrSceneAnim');
        gameStartScene.classList.add('modalOrSceneAnim');
        setTimeout(() => {
            levelModal.classList.add('d-none');
            gameStartScene.classList.add('d-none');
            game.restart(levelModalButtons.indexOf(button) + 1);
            game.start();
        }, 300);
    });
}

const gameEndModalButtons = [...gameEndModal.children].filter(x => x.tagName == 'BUTTON');
for (const button of gameEndModalButtons) {
    button.addEventListener('click', async e => {
        const { click } = button.dataset;
        if (click == 'back') {
            clearInterval(game.confettiInterval);
            for (const button of gameStartSceneButtons) {
                button.disabled = false;
            }
            document.body.removeEventListener('click', cutstomConfetti);
            gameStartScene.classList.remove('d-none');
            gameScene.classList.add('modalOrSceneAnim');
            gameEndModal.classList.add('modalOrSceneAnim');

            setTimeout(() => {
                gameStartScene.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                gameScene.classList.add('d-none');
                gameEndModal.classList.add('d-none');
            }, 300);
        } else if (click == "setSkor" && !game.seted) {
            setSkorModal.classList.remove('d-none');
            setTimeout(() => {
                setSkorModal.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                gameEndModal.querySelector('[data-click="setSkor"]').classList.add('d-none');
            }, 300);
        } else if (click == 'globalLeaderboard') {
            await game.leaderboard();
            globalLeaderboard.classList.remove('d-none');
            setTimeout(() => {
                globalLeaderboard.classList.remove('modalOrSceneAnim');
            }, 1);
        }
        console.log(click == "setSkor", !game.seted, click == "setSkor" && !game.seted)
    });
}

const inputBrokerList = ["<", ">"];
const setSkorModalButtons = [...setSkorModal.children].filter(x => x.tagName == 'BUTTON');
const input = setSkorModal.querySelector('input');
for (const button of setSkorModalButtons) {
    button.addEventListener('click', async e => {
        if (input.value > 50 || inputBrokerList.some(broker => input.value.includes(broker)) || game.skors.every(skor => skor < game.getNeedSkor())) {
            input.style.border = ".1vw solid red";
            return;
        } else if (game.seted) {
            setSkorModal.classList.add('modalOrSceneAnim');
            globalLeaderboard.classList.remove('d-none');
            setTimeout(() => {
                globalLeaderboard.classList.remove('modalOrSceneAnim');
            }, 1);
            setTimeout(() => {
                setSkorModal.classList.add('d-none');
            }, 300);
            return;
        }
        game.seted = true;
        await setDataToMongo('name', input.value, game.getTotalSkor());
        game.leaderboard();
        setSkorModal.classList.add('modalOrSceneAnim');
        globalLeaderboard.classList.remove('d-none');
        setTimeout(() => {
            globalLeaderboard.classList.remove('modalOrSceneAnim');
        }, 1);
        setTimeout(() => {
            setSkorModal.classList.add('d-none');
        }, 300);
    })
}

function leaderboard() {
    const globalLeaderboardButtons = globalLeaderboard.querySelectorAll('button');
    for (const button of globalLeaderboardButtons) {
        button.addEventListener('click', e => {
            const { click } = button.dataset;
            console.log(click)

            if (click == "close") {
                globalLeaderboard.classList.add('modalOrSceneAnim');
                setTimeout(() => {
                    globalLeaderboard.classList.add('d-none');
                }, 300);
            }
        })
    }
}
leaderboard()


function levelModalButtonsDisable() {
    let { level } = game;
    for (const button of levelModalButtons) {
        if (!(levelModalButtons.indexOf(button) < level)) button.disabled = true;
        else button.disabled = false;
    }
}

function removeDnoneOnButton() {
    if (game.gameHardLevel && game.level <= Object.keys(game.levelList).length) gameStartScene.querySelector('button').classList.remove('d-none');
    else gameStartScene.querySelector('button').classList.add('d-none');
}
levelModalButtonsDisable();

function createLevelButtons(game) {
    levelModal.innerHTML = "";
    let length = Object.keys(game.levelList).length;
    for (let i = 0; i < length; i++) {
        const button = document.createElement('button');
        button.setAttribute('data-lang', 'level');

        button.innerText = `${game.getLang()['level']} ${i + 1}`;

        levelModal.appendChild(button);
    }

    if (length > 7) levelModal.style.flexDirection = 'column';
}

function cutstomConfetti(e) {
    confetti({
        particleCount: 100,
        spread: 360,
        origin: {
            x: e.clientX / document.body.clientWidth,
            y: e.clientY / document.body.clientHeight
        }
    });
};


// functions
function customCardsRepeat() {
    const customCards = document.querySelectorAll('.cards .custom-card>div.card-back');
    for (const crd of customCards) {

        /*
            dev mode
        let cardBack = crd.parentElement.querySelector('.card-back');
        let cardFront = crd.parentElement.querySelector('.card-front');
        cardBack.classList.toggle('card-back-anim');
        cardFront.classList.toggle('custom-card-anim');
        */

        crd.addEventListener('click', async () => {
            if (game.brokeListener.includes(crd) || game.brokeClick) return;
            if (isTimeOut) {
                if (!isTimeOutModal) {
                    isTimeOutModal = true
                    const cantClickable = document.querySelector('.cantClickable');

                    cantClickable.classList.remove('d-none');
                    setTimeout(() => {
                        cantClickable.classList.remove('modalOrSceneAnim');
                    }, 1);

                    setTimeout(() => {
                        cantClickable.classList.add('modalOrSceneAnim');
                        setTimeout(() => {
                            cantClickable.classList.add('d-none');
                            isTimeOutModal = false;
                        }, 250);
                    }, 999);
                }
                return;
            }
            if (lastClicked == crd) return;
            let cardBack = crd.parentElement.querySelector('.card-back');
            let cardFront = crd.parentElement.querySelector('.card-front');
            cardBack.classList.toggle('card-back-anim');
            cardFront.classList.toggle('custom-card-anim');
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
            top: 76.5%;
            left: ${(game.brokeListener.length > 7 ? 7 : game.brokeListener.length) * 1.5 + 7}vw;
            transform: rotateZ(90deg);
            z-index: ${game.brokeListener.length};
        `
        card1.parentNode.parentNode.style = `
            top: 76.5%;
            left: ${(game.brokeListener.length > 7 ? 7 : game.brokeListener.length) * 1.5 + 7 + 1.5}vw;
            transform: rotateZ(90deg);
            z-index: ${game.brokeListener.length + 1};
        `

        game.isCheckedSize++;
        game.setYTH(1);
        game.brokeListener.push(card1, card2);
        if (customCards.length / 2 == game.isCheckedSize) {
            await new Promise(res => setTimeout(() => res(), 1000));
            const skor = await game.setSkor();

            if (skor >= game.getNeedSkor()) game.levelEnd(true);
            else game.levelEnd(false);
        }
        return false;
    } else {
        game.setYTH(-1);
        return true;
    }
}

function createCards(number) {
    if (isNaN(number)) throw new Error('not a number');
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
    let while2 = false;
    do {
        while2 = false;
        globalRepet = [], kacinciyedek = 0, idList = [], numberList = [];
        for (const cards of cardsList) {
            for (const card of cards) {
                card.innerHTML = `
                    <div class="custom-card">
                        <div class="card-front custom-card-anim">
                            <div>
                                <span class="cardNumber"></span>
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
                                <span class="cardNumber"></span>
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
                const createCardDesing = createCardDesingFunc(cards.length, card);
                let pushGlobal, numm;
                for (const c of cardDesing) {
                    pushGlobal = createCardDesing(c, first ? false : true);
                    if (pushGlobal == 'restart') {
                        while2 = true;
                    }
                    first = false;
                }
                if (pushGlobal) numm = pushGlobal(kacinciyedek);
                if (numm) kacinciyedek = numm;
            }
        }
    } while (while2);

    return cardsList;
}

function updateCardsPosition(cardsList) {
    let cardPosition = {
        0: 33,
        1: 50,
        2: 67
    }

    let sizeOfLine = cardsList.length / 2 / 2;
    for (const card of cardsList) {
        let length = [...cardsList].indexOf(card) + 1;
        card.style.transform = 'translate(-50%, -50%)';

        if (cardsList.length > 10) {
            card.style.left = (length / 2 > sizeOfLine ? length / 2 - sizeOfLine : length / 2) * (100 / ((length / 2 > sizeOfLine ? cardsList.length / 2 - sizeOfLine : sizeOfLine) + .5)) + '%';
            card.style.top = (length / 2 > sizeOfLine ? cardPosition[2] : cardPosition[0]) + '%';
        } else {
            card.style.left = length * (100 / (cardsList.length + 1)) + '%';
            card.style.top = '50%';
        }
    }

    return cardsList;
}


function createCardDesingFunc(num, card) {
    let repeat = [], lastRandomColor, lastItems = [], lastItemsLength = 0, push = true, firstPush = true;

    function random(length, floor) {
        if (length < 0) throw new Error('The input cannot be a negative number.');

        let rndm = Math.random() * (++length);
        if (floor) return rndm;
        return Math.floor(rndm);
    }

    function randomColor() {
        const colors = ["#FFA500", "#0047AB", "#8B0000", "#32CD32", "#FF7F50", "#556B2F", "#DA70D6", "#FFE4C4", "#C0C0C0"];
        let color;
        do {
            color = colors[Math.floor(Math.random() * (colors.length + 1))];
        } while (color == lastRandomColor);

        lastRandomColor = color;
        return color;
    }

    return function (spanCard, repeatLast = false) {
        const spans = spanCard.querySelectorAll('span');
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
                const random = Math.ceil(Math.random() * 9);
                for (const spanCardNumber of [...spanCard.parentElement.parentElement.querySelectorAll('.cardNumber')]) {
                    spanCardNumber.innerText = random;
                }
                numberList.push(random);

                let brk = false;
                if (firstPush) {
                    for (const rpt of globalRepet) {
                        let globalCount = 0;
                        for (const span of rpt) {
                            let count = 0;
                            for (let i = 0; i < span.length; i++) {
                                if (span[i] == repeat[i]) {
                                    count++;
                                }
                                if (count >= span.length) globalCount++;
                            }
                        }
                        if (globalCount >= 3) {
                            brk = true;
                        }
                    }
                    firstPush = !firstPush;
                }
                if (brk) return 'restart';

                return function () {
                    globalRepet.push(lastItems);
                }
            } else if (i == spans.length - 1 && !push) {
                const random = numberList.shift();
                for (const cardNumber of [...spanCard.parentElement.parentElement.querySelectorAll('.cardNumber')]) {
                    cardNumber.innerText = random;
                }

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

async function setDataToMongo(where, data, skors = "") {
    return fetch(`http://localhost:3000/${where}${!!skors ? "/" + skors : ""}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
    }).catch(() => {
        console.error('%cSunucuya Bağlanamıyorum', 'font-size: 24px; color: red;');
        return false;
    });
}

async function getDataToMongo(where = "", skors = "") {
    return fetch(`http://localhost:3000/${where}${!!skors ? "/" + skors : ""}`).then(res => res.json()).then(({ data }) => data).catch(() => {
        console.error('%cSunucuya Bağlanamıyorum', 'font-size: 24px; color: red;');
        return false;
    });
}