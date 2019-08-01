function PageSession(pageObject)
{
    this._pageObject = pageObject;
    this.allPieces = [];

    for (let i = 0; i < pageObject.pieces.length; i++)
    {
        const piece = pageObject.pieces[i];
        piece.id = i;
        this.allPieces.push(piece);
        this.allPieces.push(piece);
    }
        
    this.firstPieceElementSelected; //HTMLElement
    this.score = 0;
}

PageSession.prototype.IsOver = function()
{
    return this.score === this._pageObject.pieces.length;
}

var startForm; //HTMLElement (form)
var gameForm;  //HTMLElement (form)
var endForm; //HTMLElement (form)

var pieceBoard //HTMLElement (div)

var gameSession; //CommonScript -> Game
var pageSession; //PageSession

function InitializeDocument()
{
    startForm = document.getElementById("startForm");
    gameForm = document.getElementById("gameForm");
    endForm = document.getElementById("endForm");

    pieceBoard = document.getElementById("pieceBoard");

    document.getElementById("btnStartGame").onclick = btnStartGame_onClick;

    CommonScript.DownloadGameData("EPI-memgame1.json", Game_onLoad);
}

function DrawPage(pageObject)
{
    pageSession = new PageSession(pageObject);
    
    pageSession.allPieces = pageSession.allPieces.randomizeItems();

    for (let i = 0; i < pageSession.allPieces.length; i++)
    {
        const piece = pageSession.allPieces[i];
        let pieceElement = document.createElement("div");
        pieceElement.className = "piece";
        pieceElement.setAttribute("data-id", piece.id);
        pieceElement.onclick = Piece_onClick;

        pieceBoard.appendChild(pieceElement);
    }
}

function ClearPage()
{
    while (pieceBoard.firstChild) pieceBoard.removeChild(pieceBoard.firstChild);
    pageSession = undefined;
}

function Game_onLoad(e)
{
    gameSession = e.gameSession;
    CS.SetElementVisibility(startForm, true);
}

function ResetPiece(pieceElement)
{
    pieceElement.style.backgroundImage = "";
    pieceElement.onclick = Piece_onClick;
}

Array.prototype.randomizeItems = function() //returns new Array
{
    let randIntervalNumber = this.length - 0.5;
    var finalSequence = [];
    let array = this.slice(0);

    while (array.length > 0)
    {
        let randomized = Math.floor(Math.random() * randIntervalNumber);
        finalSequence.push(array[randomized]);
        array.splice(randomized, 1);
        randIntervalNumber--;
    }

    return finalSequence;
};

//#region Event listenters

function btnStartGame_onClick(e)
{
    DrawPage(gameSession.NextPage());
    CS.SetElementVisibility(startForm, false);
    CS.SetElementVisibility(gameForm, true);
}

function Piece_onClick(e)
{
    const pieceElement = e.target;
    const pieceID = pieceElement.getAttribute("data-id");
    const pieceObject = gameSession.CurrentPage().pieces[pieceID];

    pieceElement.style.backgroundImage = "url(" + pieceObject.picture + ")";

    if (!pageSession.firstPieceElementSelected) pageSession.firstPieceElementSelected = pieceElement;
    else if (pageSession.firstPieceElementSelected !== pieceElement)
    {
        if (pageSession.firstPieceElementSelected.getAttribute("data-id") === pieceID)
        {
             pageSession.score++;
             pieceElement.onclick = undefined;
             pageSession.firstPieceElementSelected.onclick = undefined;
        }
        else
        {
            let fpes = pageSession.firstPieceElementSelected;
            fpes.onclick = undefined;
            pieceElement.onclick = undefined;

            setTimeout(ResetPiece, gameSession.Settings.resetPieceTimeout, fpes);
            setTimeout(ResetPiece, gameSession.Settings.resetPieceTimeout, pieceElement);
            
        }
        pageSession.firstPieceElementSelected = undefined;
    }

    if (pageSession.IsOver()) alert("Terminado!");
        
}

//#endregion