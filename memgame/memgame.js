
var startForm; //HTMLElement (form)
var gameForm;  //HTMLElement (form)
var endForm; //HTMLElement (form)

var gameSession;

function InitializeDocument()
{
    startForm = document.getElementById("startForm");
    gameForm = document.getElementById("gameForm");
    endForm = document.getElementById("endForm");

    document.getElementById("btnStartGame").onclick = btnStartGame_onClick;

    CS.DownloadGameData("EPI-memgame1.json", Game_onLoad);
}

function Game_onLoad(e)
{
    gameSession = e.gameSession;
    CS.SetElementVisibility(startForm, true);
}

//#region Event listenters

function btnStartGame_onClick(e)
{

}

//#endregion