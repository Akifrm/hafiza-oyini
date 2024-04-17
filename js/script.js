class Game {
    start() {
        gameStartScene.classList.remove('gameStartSceneAnim');
    }
}

const loader = document.querySelector('.loader');
const gameStartScene = document.querySelector('.gameStartScene');
const closeModal = document.querySelector('.closeModal');
const settingsScene = document.querySelector('.settingsScene');

const game = new Game();
setTimeout(() => {
    loader.classList.add('opacity-0');
    gameStartScene.classList.remove('d-none')
    setTimeout(() => {
        loader.classList.add('d-none');

        game.start();
    }, 500);
    console.log()
    // const audioElement = document.createElement('audio');
    // audioElement.id = 'backgroundMusic';
    // audioElement.setAttribute('autoplay', "");
    // audioElement.setAttribute('loop', "");
    // audioElement.innerHTML = "<source src='music/robbery-of-the-century-152126.mp3' type='audio/mpeg'>";
    // document.body.appendChild(audioElement);

    const audio = document.getElementById('backgroundMusic');
    const volume = document.getElementById('volume');
    volume.addEventListener('input', () => {
        audio.volume = parseFloat(volume.value / 10000);
    })

    audio.addEventListener('play', function () {
        volume.value = audio.volume;
    });
}, 2500);

const gameStartSceneButtons = [...gameStartScene.children].filter(x => x.tagName == 'BUTTON');
for (const button of gameStartSceneButtons) {
    button.addEventListener('click', e => {
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
            gameStartScene.classList.add('gameStartSceneAnim');
            setTimeout(() => {
                gameStartScene.classList.add('d-none')
            }, 300);
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
            alert('Kapanma kodu çalıştı ama kapanmadı sebebi kullandığın tarayıcı başka tarayıcıda deneyebilirsin (hata konsolda gözüküyor)');
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