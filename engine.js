const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        drawScore: 0,
        scoreBox: document.getElementById('score-points'),
    },
    values: {
        playerAvailableCards: [],
        computerAvailableCards: [],
        conditionClick: true,
        endGame: false,
    },
    view: {
        winLoseH1: document.getElementById('win-lose-you'),
        winLoseSpan: document.getElementById('win-lose-result'),
        duelLocal: document.querySelector('.versus-top'),
    },
    cardSprites: {
        avatar: document.getElementById('card-image'),
        name: document.getElementById('card-name'),
        type: document.getElementById('card-type'),
    },
    fieldCards: {
        playerCard: document.getElementById('player-field-card'),
        computerCard: document.getElementById('computer-field-card'),
    },
    playerSides: {
        player1: 'player-cards',
        player1BOX: document.querySelector('#player-cards'),
        computer: 'computer-cards',
        computerBOX: document.querySelector('#computer-cards'),
        cardBack: './src/assets/icons/card-back.png',
    },
    actions: {
        button: document.getElementById('next-duel'),
    },
};

const pathImages = './src/assets/icons/';

//dados das cartas
const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: "Paper",
        img: `${pathImages}dragon.png`,
        WinOf:[1],
        LoseOf:[2],
    },
    {
        id: 1,
        name: "Dark Magician",
        type: "Rock",
        img: `${pathImages}magician.png`,
        WinOf:[2],
        LoseOf:[0],
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: `${pathImages}exodia.png`,
        WinOf:[0],
        LoseOf:[1],
    }
];

async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`);
    try {
        audio.volume = 0.5;
        audio.play();
    } catch (error) {}
};

//função que sorteia um tipo de carta aleatorio
async function getRandomCardIndex(){
    const randomid = Math.floor(Math.random() * cardData.length);
    return cardData[randomid].id;
};

//função que esconde os detalhes da carta
async function hiddenCardDetails() {
    state.cardSprites.avatar.src = state.playerSides.cardBack;
    state.cardSprites.name.innerText = 'Selecione';
    state.cardSprites.type.innerText = 'uma carta';
};

//função que cria a imagem da carta e adiciona os eventos de click e mouseover
async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement('img');
    cardImage.setAttribute('height', '100px')
    cardImage.setAttribute('src', state.playerSides.cardBack);
    cardImage.setAttribute('data-index', IdCard);
    cardImage.classList.add('card');

    if (fieldSide === state.playerSides.player1) {
        cardImage.addEventListener('click', () => {
            if (!state.values.conditionClick) {
                return;
            } else {
                setCardsField(cardImage.getAttribute('data-id'));
                hiddenCardDetails();
            }
        });

        cardImage.addEventListener('mouseover', () => {
            drawSelectedCard(IdCard);
        });
    } else {
        cardImage.addEventListener('mouseover', () => {
            drawSelectedCard('computer');
        });
    }

    return cardImage;
};

//função que desenha as cartas no campo de cartas
async function drawCards(cardNumbers, fieldSide) {
    for (let i = 0; i < cardNumbers; i++) {
        const randomIndexCard = await getRandomCardIndex();
        const cardImage = await createCardImage(randomIndexCard, fieldSide);
        cardImage.setAttribute('data-id', i);
        if (fieldSide === state.playerSides.player1) {
            state.values.playerAvailableCards.push(i);
        } else {
            state.values.computerAvailableCards.push(i);
        }


        document.getElementById(fieldSide).appendChild(cardImage);
    }
};

//função que atualiza o score
async function setCardsField(cardId) {
    let computerCardId = await getRandomAvaiableCard('computer');
    let cardIndex = await getDataIndex(cardId, state.playerSides.player1);
    let computerCardIndex = await getDataIndex(computerCardId, state.playerSides.computer);
    
    await removeSelectedCard(cardId, state.playerSides.player1);
    await removeSelectedCard(computerCardId, state.playerSides.computer);
    
    await ShowHiddenButtonCardFieldsImages(true);
    
    state.fieldCards.playerCard.src = cardData[cardIndex].img;
    state.fieldCards.computerCard.src = cardData[computerCardIndex].img;
    
    let duelResult = await checkDuelResult(cardIndex, computerCardIndex);
    state.values.conditionClick = false;
    await updateScore();
    await drawButton(duelResult);
};

//desenha a carta selecionada entre as disponiveis
async function drawSelectedCard(Id) {
    if (Id === 'computer') {
        state.cardSprites.avatar.src = state.playerSides.cardBack;
        state.cardSprites.name.innerText = 'Computer Card';
        state.cardSprites.type.innerText = 'Attribute : ?';
        return;
    }
    state.cardSprites.avatar.src = cardData[Id].img;
    state.cardSprites.name.innerText = cardData[Id].name;
    state.cardSprites.type.innerText = 'Attribute : ' + cardData[Id].type;
};

//seleciona uma carta aleatória entre os cards disponiblizados
async function getRandomAvaiableCard(player) {
    let availableCards = state.values[player + 'AvailableCards'];
    let randomIndex = Math.floor(Math.random() * availableCards.length);
    let randomId = availableCards[randomIndex];
    return randomId;
}
//retorna o index do tipo de carta da selecionada e remove ela da lista de cartas disponiveis
async function getDataIndex(cardId, playerSide) {
    let { computerBOX, player1BOX } = state.playerSides;
    let dataIndex;
    let player = playerSide === state.playerSides.player1 ? 'player' : 'computer';
    let imgElements = playerSide === state.playerSides.player1 ? player1BOX.querySelectorAll('img') : computerBOX.querySelectorAll('img');
    if (playerSide === state.playerSides.player1) {
        for (let img of imgElements) {
            if (img.getAttribute('data-id') === String(cardId)) {
                dataIndex = img.getAttribute('data-index');
                break;
            }
        }
    } else {
        for (let img of imgElements) {
            if (img.getAttribute('data-id') === String(cardId)) {
                dataIndex = img.getAttribute('data-index');
                break;
            }
        }
    }
    let cardIndex = state.values[player + 'AvailableCards'].indexOf(Number(cardId));
    state.values[player + 'AvailableCards'].splice(cardIndex, 1);
    return dataIndex;
}

//checa o resultado do duelo
async function checkDuelResult(playerCardIndex, computerCardIndex) {
    let duelResult = '';
    let playerCard = cardData[playerCardIndex];

    if (playerCard.WinOf.includes(Number(computerCardIndex))) {
        state.score.playerScore++;
        duelResult = "Win";
        await playAudio(duelResult);
    } else if (playerCard.LoseOf.includes(Number(computerCardIndex))) {
        state.score.computerScore++;
        duelResult = "Lose";
        await playAudio(duelResult);
    } else {
        state.score.drawScore++;
        duelResult = 'Draw';
    }

    await chekEndGame();
    await playAudio(duelResult);
    return duelResult;
};

//remove a imagem da carta selecionada
async function removeSelectedCard(cardId, fieldSide) {
    let { player1BOX, computerBOX } = state.playerSides;
    let imgElement = null;
    if (fieldSide === state.playerSides.player1) {
        imgElement = player1BOX.querySelector(`img[data-id='${cardId}']`);
        imgElement.remove();
    }

    if (fieldSide === state.playerSides.computer){
        imgElement = computerBOX.querySelector(`img[data-id='${cardId}']`);
        imgElement.remove();
    }
};

//remove todas as imagens das cartas
async function removeAllCardsImages() {
    let { player1BOX, computerBOX } = state.playerSides;
    
    let imgElements = player1BOX.querySelectorAll('img');
    imgElements.forEach((img) => img.remove());

    imgElements = computerBOX.querySelectorAll('img');
    imgElements.forEach((img) => img.remove());
};

//mostra ou esconde as imagens das cartas e o botão de proximo duelo
async function ShowHiddenButtonCardFieldsImages(value) {
    if (value) {
        state.fieldCards.playerCard.style.display = 'block';
        state.fieldCards.computerCard.style.display = 'block';
        state.actions.button.style.display = 'block';
    } else {
        state.fieldCards.playerCard.style.display = 'none';
        state.fieldCards.computerCard.style.display = 'none';
        state.actions.button.style.display = 'none';
    }
};

//checa se o fim do game
async function chekEndGame() {
    state.values.endGame = false;
    if (state.score.playerScore >= 3 || state.score.computerScore >= 3) {
        state.values.endGame = true;
        await drawGameResult();
    } 
    if (state.values.endGame === false && state.values.computerAvailableCards.length === 0) {
        await drawCards(3, state.playerSides.player1);
        await drawCards(3, state.playerSides.computer);
    }
}

async function drawButton(text) {
    state.actions.button.innerText = text.toUpperCase() + '!';
};

async function updateScore() {
    state.score.scoreBox.innerHTML = `Win : ${state.score.playerScore} <br> Lose : ${state.score.computerScore} <br> Draw : ${state.score.drawScore}`;
};

//função que desenha o resultado do game
async function drawGameResult() {
    let gameResult = '';

    if (state.score.playerScore >= 3) {
        state.view.winLoseH1.innerText = 'You ';
        state.view.winLoseSpan.innerText = 'Win!';
        gameResult = 'win';
    } else if (state.score.computerScore >= 3){
        state.view.winLoseH1.innerText = 'Game ';
        state.view.winLoseSpan.innerText = 'Over!';
        gameResult = 'lose';
    }

    state.view.duelLocal.classList.add('hidden');
    state.view.winLoseH1.classList.remove('hidden');
    state.view.winLoseSpan.classList.remove('hidden');
    state.view.winLoseH1.classList.add('active');
    state.view.winLoseSpan.classList.add('active', gameResult);
}

//função que reinicia o game e a partida
async function resetDuel() {
    state.values.conditionClick = true;
    ShowHiddenButtonCardFieldsImages(false);

    //se o jogo acabou, limpa os dados do game e inicia uma nova partida
    if (state.values.endGame) {
        state.score.playerScore = 0;
        state.score.computerScore = 0;
        state.score.drawScore = 0;
        state.values.playerAvailableCards = [];
        state.values.computerAvailableCards = [];
        await updateScore();
        removeAllCardsImages();
        state.view.winLoseH1.classList.add('hidden');
        state.view.winLoseSpan.classList.add('hidden');
        state.view.duelLocal.classList.remove('hidden');
        state.view.winLoseH1.classList.remove('active');
        state.view.winLoseSpan.classList.remove('active', 'win', 'lose');
        init();
    }
};

function init() {
    state.cardSprites.avatar.src = state.playerSides.cardBack;
    ShowHiddenButtonCardFieldsImages(false);

    drawCards(5, state.playerSides.player1);
    drawCards(5, state.playerSides.computer);

    const bgm = document.getElementById('bgm');
    bgm.volume = 0.2;
    bgm.play();
};

init();