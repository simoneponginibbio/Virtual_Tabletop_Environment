const WebSocket = require("ws");
var port = 3000;
const wss = new WebSocket.Server({port: port});
const wsMap = new Map();
const wsCollection = new Array();
var games = new Map();
var firstConnection = true;

console.log("Server running on port: " + port);

wss.on("connection", ws => {
    const user = {roomId: "", nickName: "", profileIcon: ""};
    console.log("new client connected");
    wsCollection.push(ws);
    if (firstConnection) {
        ws.send("storageRequest");
        firstConnection = false;
    }
    ws.send("notifyUpdate");

    ws.on("message", event => {
        const pack = event.toString().split(",");
        console.log(pack);
        switch (pack[0]) {
            case "initialStorage":
                pack.shift();
                games = new Map(JSON.parse(pack));
                break;
            case "create":
                if (pack[3].length < 4) {
                    ws.send("notifyError,createGame,Nickname must be at least 4 characters");
                    return;
                }
                if (pack[1] === "" && pack[2] === true) {
                    ws.send("notifyError,createGame,Invalid password");
                    return;
                }
                do {
                    var roomId = "";
                    for (let i = 0; i < 5; ++i) {
                        roomId += String.fromCharCode(Math.floor(Math.random() * 25) + (Math.random() >= 0.5 ? 65 : 97));
                    }
                } while (games.has(roomId));
                user.roomId = roomId;
                user.nickName = pack[3];
                user.profileIcon = 0;
                wsMap.set(user.nickName + ", " + user.roomId, ws);
                games.set(user.roomId, {password: pack[1], background: "img/defaultBackground.jpg", size: "none", players: [{nick: user.nickName, icon: 0}], chat:[], positions: [], tokens: [
                "https://drive.google.com/uc?id=1_5arvj04YpLLWEAPMgicDKF2xwBysELv", 
                "https://drive.google.com/uc?id=11mQzFMuQKfdiHvwA4kUVR2ndhVAvXNr8", 
                "https://drive.google.com/uc?id=1Jr7OZu8IbmEdONgBiEvF68beLvecFESJ", 
                "https://drive.google.com/uc?id=1C-lGfQ6YTldBkbg8Ly2ZWA4dTisKDTma", 
                "https://drive.google.com/uc?id=1cPiKRQf9huq96gbtoV7kSgWx4NiEbifQ", 
                "https://drive.google.com/uc?id=1LkJXO8cpyQj2UWI-hQLw3Glck3ZNmAoH"]});
                ws.send("notifyCreate," + user.roomId + "," + pack[1] + "," + user.nickName);
                break;
            case "join":
                if (pack[3].length < 4) {
                    ws.send("notifyError," + pack[4] + ",Nickname must be at least 4 characters");
                    return;
                }
                if (games.get(pack[1]) === null) {
                    ws.send("notifyError," + pack[4] + ",Room id not found");
                    return;
                }
                if (games.get(pack[1]).players.map(player => player.nick).includes(pack[3])) {
                    ws.send("notifyError," + pack[4] + ",Nickname already in use");
                    return;
                }
                if (games.get(pack[1]).password !== pack[2]) {
                    ws.send("notifyError," + pack[4] + ",Wrong password");
                    return;
                }
                user.roomId = pack[1];
                user.nickName = pack[3];
                user.profileIcon = 0;
                wsMap.set(user.nickName + ", " + user.roomId, ws);
                games.get(user.roomId).players.push({nick: user.nickName, icon: 0});
                ws.send("notifyJoin," + user.roomId + "," + pack[2] + "," + user.nickName);
                break;
            case "addPartyMember":
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        wsMap.get(player.nick + ", " + user.roomId).send("notifyAddPartyMember," + user.nickName);
                    }
                });
                break;
            case "remove":
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        wsMap.get(player.nick + ", " + user.roomId).send("notifyRemovePartyMember," + user.nickName);
                    } else {
                        ws.send("notifyRemove");
                    }
                });
                wsMap.delete(user.nickName + ", " + user.roomId);
                games.get(user.roomId).players.splice(games.get(user.roomId).players.map(player => player.nick).indexOf(user.nickName), 1);
                user.roomId = "";
                user.nickName = "";
                user.profileIcon = "";
                break;
            case "profileIconUpdate":
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        wsMap.get(player.nick + ", " + user.roomId).send("notifyProfileIconUpdate," + user.nickName + "," + pack[1]);
                    } else {
                        player.icon = pack[1];
                    }
                });
                break;
            case "addText":
                let text = "";
                if (pack.length > 2) {
                    for (let i = 1; i < pack.length; ++i) {
                        if (i === pack.length - 1) {
                            text = text + pack[i];
                        } else {
                            text = text + pack[i] + ", ";
                        }
                    }
                } else {
                    text = pack[1];
                }
                games.get(user.roomId).chat.push({nick: user.nickName, text: text});
                games.get(user.roomId).players.forEach(player => {
                    wsMap.get(player.nick + ", " + user.roomId).send("notifyText," + user.nickName + ", " + text);
                });
                break;
            case "diceRoll":
                let diceRoll = Math.floor(Math.random() * parseInt(pack[1])) + 1;
                if (pack[2] === "+") {
                    diceRoll = diceRoll + parseInt(pack[3]);
                }
                if (pack[2] === "-") {
                    diceRoll = diceRoll - parseInt(pack[3]);
                }
                games.get(user.roomId).chat.push({nick: user.nickName, text: diceRoll});
                games.get(user.roomId).players.forEach(player => {
                    wsMap.get(player.nick + ", " + user.roomId).send("notifyText," + user.nickName + ", " + "rolled: " + diceRoll);
                });
                break;
            case "changeSize":
                games.get(user.roomId).size = pack[1];
                games.get(user.roomId).positions.length = 0;
                games.get(user.roomId).players.forEach(player => {
                    wsMap.get(player.nick + ", " + user.roomId).send("notifyChangeSize");
                });
                break;
            case "newBackground":
                games.get(user.roomId).background = pack[1];
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        wsMap.get(player.nick + ", " + user.roomId).send("notifyNewBackground," + pack[1]);
                    }
                });
                break;
            case "newToken":
                games.get(user.roomId).tokens.push(pack[1]);
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        wsMap.get(player.nick + ", " + user.roomId).send("notifyNewToken," + pack[1]);
                    }
                });
                break;
            case "placeToken":
                games.get(user.roomId).positions.push({nick: user.nickName, iconValue: pack[1], coordinates: pack[2] + "," + pack[3]});
                if (pack.length >= 6) {
                    games.get(user.roomId).positions.splice(games.get(user.roomId).positions.map(position => position.coordinates).indexOf(pack[4] + "," + pack[5]), 1);
                }
                games.get(user.roomId).players.forEach(player => {
                    if (player.nick !== user.nickName) {
                        if (pack.length < 6) {
                            wsMap.get(player.nick + ", " + user.roomId).send("notifyPlaceToken," + user.nickName + "," + pack[1] + "," + pack[2] + "," + pack[3]);
                        } else {
                            wsMap.get(player.nick + ", " + user.roomId).send("notifyPlaceToken," + user.nickName + "," + pack[1] + "," + pack[2] + "," + pack[3] + "," + pack[4] + "," + pack[5]);
                        }
                    }
                });
                break;
            case "removeToken":
                if (pack.length > 2) {
                    games.get(user.roomId).positions.splice(games.get(user.roomId).positions.map(position => position.coordinates).indexOf(pack[1] + "," + pack[2]), 1);
                    games.get(user.roomId).players.forEach(player => {
                        if (player.nick !== user.nickName) {
                            wsMap.get(player.nick + ", " + user.roomId).send("notifyRemoveToken," + pack[1] + "," + pack[2]);
                        }
                    });
                }
                break;
            case "manualDelete":
                if (user.roomId === pack[1]) {
                    wsMap.delete(user.nickName + ", " + user.roomId);
                    user.roomId = "";
                    user.nickName = "";
                    user.profileIcon = "";
                    ws.send("notifyManualDelete");
                }
                if (games.get(pack[1]) !== null) {
                    games.delete(pack[1]);
                }
                break;
            case "updateLobby":
                wsCollection.forEach(ws => {
                    ws.send("notifyUpdate");
                });
                break;
            default:
                break;
        }
    });

    ws.on("close", () => {
        wsCollection.splice(wsCollection.indexOf(ws), 1);
        if (user.nickName !== "" && user.roomId !== "") {
            wsMap.delete(user.nickName + ", " + user.roomId);
            games.get(user.roomId).players.splice(games.get(user.roomId).players.map(player => player.nick).indexOf(user.nickName), 1);
            games.get(user.roomId).players.forEach(player => {
                wsMap.get(player.nick + ", " + user.roomId).send("notifyRemovePartyMember," + user.nickName);
            });
        }
    });
});
