//Pages controllers

function showPage(page) {
    clear();
    page.style.transform = "scale(1)";
}

function showLogin(page) {
    play.style.transform = "scale(0)";
    page.style.transform = "scale(1)";
}

function back(page) {
    clear();
    page.style.transform = "scale(1)";
}

//Initial pages and errors cleaner

const play = document.querySelector('.play');
play.style.transform = "scale(1)";
const create = document.querySelector('.createGame');
const join = document.querySelector('.joinGame');
const lobby = document.querySelector('.lobby');
const lobbyJoinWithPassword = document.querySelector('.lobbyJoinWithPassword');
const lobbyJoinWithoutPassword = document.querySelector('.lobbyJoinWithoutPassword');
const contact = document.querySelector('.contact');
const info = document.querySelector('.info');
const help = document.querySelector('.help');

const clear = () => {
    play.style.transform = "scale(0)";
    create.style.transform = "scale(0)";
    join.style.transform = "scale(0)";
    lobby.style.transform = "scale(0)";
    lobbyJoinWithPassword.style.transform = "scale(0)";
    lobbyJoinWithoutPassword.style.transform = "scale(0)";
    contact.style.transform = "scale(0)";
    info.style.transform = "scale(0)";
    help.style.transform = "scale(0)";
    document.querySelectorAll('.error').forEach((error) => {
        error.innerHTML = "";
        error.style.margin = "0";
        error.style.transform = "scale(0)";
    });
};

//Forms errors messages controller

const showErrors = (page, message) => {
    let error = document.querySelector('.' + page).querySelector('.error');
    error.innerHTML = message;
    error.style.margin = "-60px 0 0 0";
    error.style.transform = "scale(1)";
};

//Create game controller

const createNickname = document.querySelector('.createNickname');
const createPassword = document.querySelector('.createPassword');
const createUsePassword = document.querySelector('.createUsePassword');

document.querySelector('.createGameBtn').addEventListener('click', () => {
    
    if (createNickname.value.length < 4) {
        showErrors("createGame", "Nickname must be at least 4 characters");
        return;
    }
    if (createPassword.value === "" && createUsePassword.checked) {
        showErrors("createGame", "Invalid password");
        return;
    }
    ws.send(["create", createPassword.value, createUsePassword.checked, createNickname.value]);
});

createUsePassword.addEventListener('click', () => {
    if (!createUsePassword.checked) {
        createPassword.value = "";
    }
    createPassword.disabled = !createUsePassword.checked;
});

//Join game controller

const joinNickname = document.querySelector('.joinNickname');
const joinRoomId = document.querySelector('.joinRoomId');
const joinPassword = document.querySelector('.joinPassword');

document.querySelector('.joinGameBtn').addEventListener('click', () => {
    if (joinNickname.value.length < 4) {
        showErrors("joinGame", "Nickname must be at least 4 characters");
        return;
    }
    if (JSON.parse(localStorage.getItem(joinRoomId.value)) === null) {
        showErrors("joinGame", "Room id not found");
        return;
    }
    if (JSON.parse(localStorage.getItem(joinRoomId.value)).players.map(player => player.nick).includes(joinNickname.value)) {
        showErrors("joinGame", "Nickname already in use");
        return;
    }
    if (JSON.parse(localStorage.getItem(joinRoomId.value)).password !== joinPassword.value) {
        showErrors("joinGame", "Wrong password");
        return;
    }
    ws.send(["join", joinRoomId.value, joinPassword.value, joinNickname.value, "joinGame"]);
});

//Lobby controller

const lobbyRefresher = () => {
    if (localStorage.length === 0)
        lobby.innerHTML = "There are no games available at the moment. Create one now!!";
    else {
        lobby.innerHTML = "";
        for (let i = 0; i < localStorage.length; ++i) {
            let game = JSON.parse(localStorage.getItem(localStorage.key(i)));
            let gameBox = document.createElement('div');
            gameBox.className = "gameBox";
            let roomId = document.createElement('span');
            roomId.className = "lobbyRoomId";
            roomId.innerHTML = "Room id: " + localStorage.key(i);
            gameBox.appendChild(roomId);
            let numberOfPlayers = document.createElement('span');
            numberOfPlayers.className = "lobbyPlayers";
            numberOfPlayers.innerHTML = game.players.length;
            let iconPerson = document.createElement('i');
            iconPerson.className = "bi bi-person";
            numberOfPlayers.appendChild(iconPerson);
            gameBox.appendChild(numberOfPlayers);
            let lock = document.createElement('span');
            lock.className = "lobbyLocked";
            let iconLock = document.createElement('i');
            iconLock.className = "bi bi-" + (game.password === "" ? "un" : "") + "lock";
            lock.appendChild(iconLock);
            gameBox.appendChild(lock);
            let a = document.createElement('a');
            let button = document.createElement('button');
            button.className = "lobbyJoin";
            button.id = localStorage.key(i);
            button.onclick = function() { Join(button.id) };
            let iconArrow = document.createElement('i');
            iconArrow.className = "bi bi-arrow-right-circle";
            button.appendChild(iconArrow);
            a.appendChild(button);
            gameBox.appendChild(a);
            if (i === localStorage.length - 1) {
                gameBox.style.margin = "0";
            }
            lobby.appendChild(gameBox);
        }
        if (localStorage.length > 3) {
            lobby.style.overflowX = "hidden";
            lobby.style.overflowY = "auto";
            lobby.style.height = "55%";
        } else {
            lobby.style.overflowX = "revert";
            lobby.style.overflowY = "revert";
            lobby.style.height = "revert";
        }
    }
};

function Join(id) {
    lobby.style.transform = "scale(0)";
    if (JSON.parse(localStorage.getItem(id)).password === "") {
        lobbyJoinWithoutPassword.style.transform = "scale(1)";
        lobbyJoinWithoutPassword.id = id;
    } else {
        lobbyJoinWithPassword.style.transform = "scale(1)";
        lobbyJoinWithPassword.id = id;
    }
};

const lobbyNickname = document.querySelector('.lobbyNickname');
const lobbyPassword = document.querySelector('.lobbyPassword');

document.querySelector('.lobbyJoinWithPasswordBtn').addEventListener('click', () => {
    if (lobbyNickname.value.length < 4) {
        showErrors("lobbyJoinWithPassword", "Nickname must be at least 4 characters");
        return;
    }
    if (JSON.parse(localStorage.getItem(lobbyJoinWithPassword.id)) === null) {
        showErrors("lobbyJoinWithPassword", "Room id not found");
        return;
    }
    if (JSON.parse(localStorage.getItem(lobbyJoinWithPassword.id)).players.map(player => player.nick).includes(lobbyNickname.value)) {
        showErrors("lobbyJoinWithPassword", "Nickname already in use");
        return;
    }
    if (JSON.parse(localStorage.getItem(lobbyJoinWithPassword.id)).password !== lobbyPassword.value) {
        showErrors("lobbyJoinWithPassword", "Wrong password");
        return;
    }
    ws.send(["join", lobbyJoinWithPassword.id, lobbyPassword.value, lobbyNickname.value, "lobbyJoinWithPassword"]);
});

const lobbyNicknameWithoutPassword = document.querySelector('.lobbyNicknameWithoutPassword');

document.querySelector('.lobbyJoinWithoutPasswordBtn').addEventListener('click', () => {
    if (lobbyNicknameWithoutPassword.value.length < 4) {
        showErrors("lobbyJoinWithoutPassword", "Nickname must be at least 4 characters");
        return;
    }
    if (JSON.parse(localStorage.getItem(lobbyJoinWithoutPassword.id)) === null) {
        showErrors("lobbyJoinWithoutPassword", "Room id not found");
        return;
    }
    if (JSON.parse(localStorage.getItem(lobbyJoinWithoutPassword.id)).players.map(player => player.nick).includes(lobbyNicknameWithoutPassword.value)) {
        showErrors("lobbyJoinWithoutPassword", "Nickname already in use");
        return;
    }
    ws.send(["join", lobbyJoinWithoutPassword.id, "", lobbyNicknameWithoutPassword.value, "lobbyNicknameWithoutPassword"]);
});

//Quit game handler

document.querySelector('.quit').addEventListener("click", (e) => {
    Swal.fire({
        template: "#quitGame"
    }).then(result => {
        if (result.isConfirmed) {
            ws.send(["remove"]);
        }
    });
    e.preventDefault();
});

//Manual delete handler

window.addEventListener('storage', event => {
    if (event.key !== null && event.newValue === null && event.oldValue !== null) {
        ws.send(["manualDelete", event.key]);
        lobbyRefresher();
    }
});

//Page reload handler

const user = { roomId: "", nickName: "", profileIcon: "" };

window.addEventListener("beforeunload", event => {
    if (user.nickName !== "" && user.roomId !== "") {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }
});

window.addEventListener("unload", () => {
    if (user.nickName !== "" && user.roomId !== "") {
        let game = JSON.parse(localStorage.getItem(user.roomId));
        game.players.splice(game.players.map(player => player.nick).indexOf(user.nickName), 1);
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
    }
    ws.close();
});

//Profile icons handler

const profileIcon = document.querySelector('.profileIcon');

profileIcon.addEventListener("click", () => {
    user.profileIcon = (user.profileIcon + 1) % tokenArray.length;
    let game = JSON.parse(localStorage.getItem(user.roomId));
    game.players.forEach(player => {
        if (player.nick === user.nickName) {
            player.icon = user.profileIcon;
        }
    });
    localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
    profileIcon.style.backgroundImage = "url(" + tokenArray[user.profileIcon] + ")";
    ws.send(["profileIconUpdate", user.profileIcon]);
});

//Gets image from drive

const getDrivePic = shareLink => {
    let split1, split2;
    if (shareLink !== undefined) {
        split1 = shareLink.split("/d/");
    } else return "invalidURL";
    if (split1[1] !== undefined) {
        split2 = split1[1].split("/view?");
    } else return "invalidURL";
    return split2[0];
}

//Background and token submit handler

const urlSubmitBg = document.getElementById("urlSubmitBg");
const urlSubmitToken = document.getElementById("urlSubmitToken");
const urlInput = document.getElementById("urlInput");

urlSubmitBg.addEventListener("click", () => {
    if (urlInput.value !== "") {
        let imgId = getDrivePic(urlInput.value);
        if (imgId === "invalidURL") {
            urlInput.value = "invalid URL";
            return;
        }
        let game = JSON.parse(localStorage.getItem(user.roomId));
        if (game.background !== "https://drive.google.com/uc?id=" + imgId) {
            backgroundImage.src = "https://drive.google.com/uc?id=" + imgId;
            game.background = backgroundImage.src;
            localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
            ws.send(["newBackground", backgroundImage.src]);
        }
        urlInput.value = "";
    }
});

urlSubmitToken.addEventListener("click", () => {
    if (urlInput.value !== "") {
        let imgId = getDrivePic(urlInput.value);
        if (imgId === "invalidURL") {
            urlInput.value = "invalid URL";
            return;
        }
        let game = JSON.parse(localStorage.getItem(user.roomId));
        if (!game.tokens.includes("https://drive.google.com/uc?id=" + imgId)) {
            tokenArray.push("https://drive.google.com/uc?id=" + imgId);
            refreshToken();
            game.tokens.push("https://drive.google.com/uc?id=" + imgId);
            localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
            ws.send(["newToken", "https://drive.google.com/uc?id=" + imgId]);
        }
        urlInput.value = "";
    }
});

//Change size handler

const gameboard = document.getElementsByClassName("gameboard")[0];
var tokenSize = "65px";
var horizontalTiles = 0;

document.querySelector(".small").addEventListener("click", () => {
    let game = JSON.parse(localStorage.getItem(user.roomId));
    if (game.size !== "S") {
        game.size = "S";
        game.positions.length = 0;
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
        ws.send(["changeSize", game.size]);
    }
});

document.querySelector(".medium").addEventListener("click", () => {
    let game = JSON.parse(localStorage.getItem(user.roomId));
    if (game.size !== "M") {
        game.size = "M";
        game.positions.length = 0;
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
        ws.send(["changeSize", game.size]);
    }
});

document.querySelector(".large").addEventListener("click", () => {
    let game = JSON.parse(localStorage.getItem(user.roomId));
    if (game.size !== "L") {
        game.size = "L";
        game.positions.length = 0;
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
        ws.send(["changeSize", game.size]);
    }
});

document.querySelector(".hexa").addEventListener("click", () => {
    let game = JSON.parse(localStorage.getItem(user.roomId));
    if (game.size !== "H") {
        game.size = "H";
        game.positions.length = 0;
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
        ws.send(["changeSize", game.size]);
    }
});

const changeSize = () => {
    switch(JSON.parse(localStorage.getItem(user.roomId)).size) {
        case "S":
            tokenSize = "32.5px";
            horizontalTiles = 40;
            generate(40, 20, 32.5);
            refreshToken();
            break;
        case "M":
            tokenSize = "65px";
            horizontalTiles = 20;
            generate(20, 10, 65);
            refreshToken();
            break;
        case "L":
            tokenSize = "80px";
            horizontalTiles = 10;
            generate(10, 5, 130);
            refreshToken();
            break;
        case "H":
            tokenSize = "55px";
            horizontalTiles = "Hexa";
            generatehexa(20, 12, 65);
            refreshToken();
            break;
        default:
            break;
    }
};

//Generates new grid dipending on the size

const cleargrid = () => {
    while (gameboard.childElementCount > 0) {
        gameboard.lastChild.remove();
    }
};

const generate = (x, y, size) => {
    cleargrid();
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let tile = document.createElement("div");
            tile.className = "squaretile";
            tile.style.width = size + "px";
            tile.style.height = size + "px";
            tile.value = i + "," + j;
            gameboard.append(tile);
        }
    }
    generateDragOn();
};

const generatehexa = (x, y, size) => {
    cleargrid();
    let hexagrid = document.createElement("img");
    hexagrid.src = "img/hexagonBackground.png";
    hexagrid.style.width = "170.8%";
    hexagrid.style.height = "317%";
    hexagrid.style.position = "absolute";
    hexagrid.style.left = "-9.9%";
    hexagrid.style.top = "-16.1%";
    gameboard.append(hexagrid);
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x + (i % 2); j++) {
            let tile = document.createElement("div");
            tile.style.zIndex = "1";
            tile.className = "squaretile";
            tile.style.width = size + "px";
            tile.style.height = (size - 7) + "px";
            tile.style.position = "absolute";
            tile.style.left = ((65 * j)) + "px";
            tile.style.border = "none";
            tile.value = i + "," + j;
            if (i % 2 !== 0) {
                tile.style.left = ((65 * j) - (65 / 2)) + "px";
            }
            tile.style.top = (65 * i) - (9 * i) + "px";
            gameboard.append(tile);
        }
    }
    generateDragOn();
};
    
const generateDragOn = () => {
    document.querySelectorAll('.squaretile').forEach(container => {

        container.addEventListener('dragover', e => {
            e.preventDefault();
        });

        container.addEventListener('drop', e => {
            e.preventDefault();
            let draggable = document.querySelector('.dragging');
            if (container.children.length < 1 && draggable !== null) {
                container.appendChild(draggable);
                let game = JSON.parse(localStorage.getItem(user.roomId));
                game.positions.push({nick: user.nickName, iconValue: draggable.value, coordinates: container.value});
                if (currentTokenPlace !== null) {
                    game.positions.splice(game.positions.map(position => position.coordinates).indexOf(currentTokenPlace), 1);
                }
                localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
                ws.send(["placeToken", draggable.value, container.value, currentTokenPlace]);
            }
        });
    });   
};

//Token handler

const tokenArray = new Array();
const tokencontainer = document.getElementById("tokenContainer");
const trashToken = document.getElementById("trashToken");
var currentTokenPlace;

const refreshToken = () => {
    tokencontainer.innerHTML = "";
    let tokenValue = 0;
    tokenArray.forEach(url => {
        let token = document.createElement("div");
        token.className = "draggable";
        token.draggable = "true";
        token.style.height = tokenSize;
        token.style.width = tokenSize;
        token.value = tokenValue;
        token.id = user.nickName;
        token.style.backgroundSize = tokenSize + " " + tokenSize;
        token.style.backgroundImage = "url(" + url + ")";
        tokencontainer.append(token);
        tokenValue++;
        token.addEventListener('dragstart', () => {
            token.classList.add('dragging');
            if (token.parentNode.className === "squaretile") {
                currentTokenPlace = token.parentNode.value;
            } else {
                currentTokenPlace = null;
            }
        });
        token.addEventListener('dragend', () => {
            token.classList.remove('dragging');
            refreshToken();
        });
    });
};

const placeToken = pack => {
    let pos = 1;
    if (horizontalTiles !== "Hexa") {
        pos = parseInt(pack[3]) * horizontalTiles + parseInt(pack[4]);
    } else {
        for (let i = 0; i < parseInt(pack[3]); ++i) {
            pos += (i % 2 === 0) ? 20 : 21;
        }
        pos += parseInt(pack[4]);
    }
    if (pack.length > 6) {
        let prevPos = 1;
        if (horizontalTiles !== "Hexa") {
            prevPos = parseInt(pack[5]) * horizontalTiles + parseInt(pack[6]);
        } else {
            for (let i = 0; i < parseInt(pack[5]); ++i) {
                prevPos += (i % 2 === 0) ? 20 : 21;
            }
            prevPos += parseInt(pack[6]);
        }
        gameboard.children[prevPos].children[0].remove();
    }
    let token = document.createElement("div");
    token.value = pack[2];
    token.style.height = tokenSize;
    token.style.width = tokenSize;
    token.id = pack[1];
    token.style.backgroundSize = tokenSize + " " + tokenSize;
    token.style.backgroundImage = "url(" + tokenArray[pack[2]] + ")";
    if (pack[1] === user.nickName) {
        token.className = "draggable";
        token.draggable = "true";
        token.addEventListener('dragstart', () => {
            token.classList.add('dragging');
            if (token.parentNode.className === "squaretile") {
                currentTokenPlace = token.parentNode.value;
            } else {
                currentTokenPlace = null;
            }
        });
        token.addEventListener('dragend', () => {
            token.classList.remove('dragging');
            refreshToken();
        });
    } else {
        token.className = "undraggable";
        token.title = pack[1];
        token.addEventListener('dragstart', e => {
            e.preventDefault();
        });
        token.addEventListener('dragend', e => {
            e.preventDefault();
        });
    }
    gameboard.children[pos].append(token);
};

trashToken.addEventListener('dragover', e => {
    e.preventDefault();
});

trashToken.addEventListener('drop', e => {
    e.preventDefault();
    let draggable = document.querySelector('.dragging');
    if (draggable !== null) {
        let game = JSON.parse(localStorage.getItem(user.roomId));
        game.positions.splice(game.positions.map(position => position.coordinates).indexOf(draggable.parentNode.value), 1);
        localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
        ws.send(["removeToken", draggable.parentNode.value]);
        draggable.remove();
    }
});

//Chat handler

const chatHistory = document.getElementById("chatHistory");
const textField = document.getElementById("textField");
const sendText = document.getElementById("sendText");

sendText.addEventListener("click", () => {
    let text = textField.value;
    if (text !== "") {
        ws.send(["addText", text]);
        let regex = /^\/[dD][1-9]\d*( [\+-\-] \d+)*$/;
        if (regex.test(text)) {
            ws.send(["diceRoll", text.toString().slice(2).split(" ")]);
        }
        textField.value = "";
    }
});

//Game starter

const navBar = document.querySelector('.navBar');
const content = document.querySelector('.content');
const game = document.querySelector('.game');
const profileNick = document.querySelector('.profileNick');
const partyList = document.querySelector('.partyList');
const backgroundImage = document.getElementById('backgroundImage');
const roomInfo = document.getElementById('roomInfo');

const startGame = () => {
    clear();
    Array.prototype.forEach.call(document.getElementsByTagName('form'), form => {
        form.reset();
    });
    createPassword.disabled = false;
    let Game = JSON.parse(localStorage.getItem(user.roomId));
    Game.tokens.forEach(token => {
        tokenArray.push(token);
    });
    changeSize();
    refreshToken();
    Game.players.forEach(player => {
        if (player.nick !== user.nickName) {
            let partyMember = document.createElement("div");
            partyMember.className = "partyMember";
            let partyMemberIcon = document.createElement("div");
            partyMemberIcon.className = "partyMemberIcon";
            partyMemberIcon.style.backgroundImage = "url(" + tokenArray[player.icon] + ")";
            partyMemberIcon.style.backgroundSize = "40px 40px";
            let partyMemberNick = document.createElement("div");
            partyMemberNick.className = "partyMemberNick";
            partyMemberNick.innerText = player.nick;
            partyMember.append(partyMemberIcon);
            partyMember.append(partyMemberNick);
            partyList.append(partyMember);
        }
    });
    profileNick.innerHTML = user.nickName;
    profileIcon.style.backgroundImage = "url(" + tokenArray[user.profileIcon] + ")";
    profileIcon.style.backgroundSize = "60px 60px";
    backgroundImage.src = Game.background;
    roomInfo.innerHTML = "Room ID: " + user.roomId;
    Game.positions.forEach(position => {
        let coordinates = position.coordinates.split(",");
        placeToken(["", position.nick, position.iconValue, coordinates[0], coordinates[1]]);
    });
    Game.chat.forEach(message => {
        let text = document.createElement("div");
        let regex = /rolled/;
        if (regex.test(message.text)) {
            text.style.color = "red";
        }
        text.innerText = "[" + message.nick + "]: " + message.text;
        chatHistory.append(text);
    });
    navBar.style.transform = "scale(0)";
    content.style.transform = "scale(0)";
    game.style.transform = "scale(1)";
};

//WebSocket event handler

const ws = new WebSocket("ws:localhost:3000/");

ws.addEventListener("message", event => {
    let pack = event.data.toString().split(",");
    console.log(pack);
    switch (pack[0]) {
        case "storageRequest":
            let games = new Map();
            for(let i = 0; i < localStorage.length; ++i)
                games.set(localStorage.key(i), JSON.parse(localStorage.getItem(localStorage.key(i))));
            ws.send(["initialStorage", JSON.stringify(Array.from(games.entries()))]);
            break;
        case "notifyCreate":
            localStorage.setItem(pack[1], JSON.stringify({password: pack[2], background: "img/defaultBackground.jpg", size: "none", players: [{nick: pack[3], icon: 0}], chat: [], positions: [], tokens: [
            "https://drive.google.com/uc?id=1_5arvj04YpLLWEAPMgicDKF2xwBysELv", 
            "https://drive.google.com/uc?id=11mQzFMuQKfdiHvwA4kUVR2ndhVAvXNr8", 
            "https://drive.google.com/uc?id=1Jr7OZu8IbmEdONgBiEvF68beLvecFESJ", 
            "https://drive.google.com/uc?id=1C-lGfQ6YTldBkbg8Ly2ZWA4dTisKDTma", 
            "https://drive.google.com/uc?id=1cPiKRQf9huq96gbtoV7kSgWx4NiEbifQ", 
            "https://drive.google.com/uc?id=1LkJXO8cpyQj2UWI-hQLw3Glck3ZNmAoH"]}));
            user.roomId = pack[1];
            user.nickName = pack[3];
            user.profileIcon = 0;
            startGame();
            ws.send(["updateLobby"]);
            break;
        case "notifyJoin":
            let joinGame = JSON.parse(localStorage.getItem(pack[1]));
            joinGame.players.push({nick: pack[3], icon: 0});
            localStorage.setItem(pack[1], JSON.stringify({password: joinGame.password, background: joinGame.background, size: joinGame.size, players: joinGame.players, chat: joinGame.chat, positions: joinGame.positions, tokens: joinGame.tokens}));
            user.roomId = pack[1];
            user.nickName = pack[3];
            user.profileIcon = 0;
            startGame();
            ws.send(["addPartyMember"]);
            ws.send(["updateLobby"]);
            break;
        case "notifyAddPartyMember":
            let partyMember = document.createElement("div");
            partyMember.className = "partyMember";
            let partyMemberIcon = document.createElement("div");
            partyMemberIcon.className = "partyMemberIcon";
            partyMemberIcon.style.backgroundImage = "url(" + tokenArray[0] + ")";
            partyMemberIcon.style.backgroundSize = "40px 40px";
            let partyMemberNick = document.createElement("div");
            partyMemberNick.className = "partyMemberNick";
            partyMemberNick.innerText = pack[1];
            partyMember.append(partyMemberIcon);
            partyMember.append(partyMemberNick);
            partyList.append(partyMember);
            break;
        case "notifyRemove":
            let removeGame = JSON.parse(localStorage.getItem(user.roomId));
            removeGame.players.splice(removeGame.players.map(player => player.nick).indexOf(user.nickName), 1);
            localStorage.setItem(user.roomId, JSON.stringify({password: removeGame.password, background: removeGame.background, size: removeGame.size, players: removeGame.players, chat: removeGame.chat, positions: removeGame.positions, tokens: removeGame.tokens}));
            user.roomId = "";
            user.nickName = "";
            user.profileIcon = "";
            profileIcon.innerHTML = "";
            profileNick.innerHTML = "";
            partyList.innerHTML = "";
            roomInfo.innerHTML = "";
            chatHistory.innerHTML = "";
            let div1 = document.createElement("div");
            div1.style.color = "gray";
            div1.innerHTML = "Diceroll example: /d20 + 4";
            chatHistory.append(div1);
            let div2 = document.createElement("div");
            div2.style.color = "gray";
            div2.innerHTML = "Diceroll example: /D6 - 1";
            chatHistory.append(div2);
            tokenArray.length = 0;
            tokencontainer.innerHTML = "";
            cleargrid();
            game.style.transform = "scale(0)";
            navBar.style.transform = "scale(1)";
            content.style.transform = "scale(1)";
            play.style.transform = "scale(1)";
            ws.send(["updateLobby"]);
            break;
        case "notifyRemovePartyMember":
            for (let i = 0; i < partyList.childElementCount; ++i) {
                if (partyList.children[i].children[1].innerHTML === pack[1]) {
                    partyList.children[i].remove();
                    break;
                }
            }
            break;
        case "notifyProfileIconUpdate":
            for (let i = 0; i < partyList.childElementCount; ++i) {
                if (partyList.children[i].children[1].innerHTML === pack[1]) {
                    partyList.children[i].children[0].style.backgroundImage = "url(" + tokenArray[pack[2]] + ")";
                    break;
                }
            }
            break;
        case "notifyChangeSize":
            changeSize();
            break;
        case "notifyText":
            let text = document.createElement("div");
            let regex = /rolled/;
            if (regex.test(pack)) {
                text.style.color = "red";
            }
            let fullText = "";
            if (pack.length > 2) {
                for (let i = 2; i < pack.length; i++) {
                    if (i === pack.length - 1) {
                        fullText += pack[i];
                    } else {
                        fullText += pack[i] + ", ";
                    }
                }
            } else {
                fullText = pack[1];
            }
            text.innerText = "[" + pack[1] + "]: " + fullText;
            chatHistory.append(text);
            if (user.nickName === pack[1]) {
                let game = JSON.parse(localStorage.getItem(user.roomId));
                game.chat.push({nick: pack[1], text: fullText});
                localStorage.setItem(user.roomId, JSON.stringify({password: game.password, background: game.background, size: game.size, players: game.players, chat: game.chat, positions: game.positions, tokens: game.tokens}));
            }
            break;
        case "notifyNewBackground":
            backgroundImage.src = pack[1];
            break;
        case "notifyNewToken":
            tokenArray.push(pack[1]);
            refreshToken();
            break;
        case "notifyPlaceToken":
            placeToken(pack);
            break;
        case "notifyRemoveToken":
            let j = parseInt(pack[1]);
            let i = parseInt(pack[2]);
            pos = 0;
            if (horizontalTiles === "Hexa") {
                for (let k = 0; k < j; ++k) {
                    pos += (k % 2 === 0) ? 20 : 21;
                }
                pos += i + 1;
            } else {
                pos = j * horizontalTiles + i;
            }
            gameboard.children[pos].children[0].remove();
            break;
        case "notifyManualDelete":
            Swal.fire({
                template: "#manualDelete"
            });
            user.roomId = "";
            user.nickName = "";
            user.profileIcon = "";
            profileIcon.innerHTML = "";
            profileNick.innerHTML = "";
            partyList.innerHTML = "";
            roomInfo.innerHTML = "";
            chatHistory.innerHTML = "";
            let Div1 = document.createElement("div");
            Div1.style.color = "gray";
            Div1.innerHTML = "Diceroll example: /d20 + 4";
            chatHistory.append(Div1);
            let Div2 = document.createElement("div");
            Div2.style.color = "gray";
            Div2.innerHTML = "Diceroll example: /D6 - 1";
            chatHistory.append(Div2);
            tokenArray.length = 0;
            tokencontainer.innerHTML = "";
            cleargrid();
            game.style.transform = "scale(0)";
            navBar.style.transform = "scale(1)";
            content.style.transform = "scale(1)";
            play.style.transform = "scale(1)";
            break;
        case "notifyUpdate":
            lobbyRefresher();
            break;
        case "notifyError":
            showErrors(pack[1], pack[2]);
            break;
        default:
            break;
    }
});
