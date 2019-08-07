/* =======================================================================================================
 * Jogo da Memória
 * Desenvolvido por Victor Opusculo para a Escola do Parlamento de Itapevi - Câmara Municipal de Itapevi
 * =======================================================================================================*/

function PageSession(pageObject)
{
    this._pageObject = pageObject;
    this.InPagePieceIndexes = [];

    for (let i = 0; i < pageObject.pieces.length; i++)
    {
        this.InPagePieceIndexes.push(i);
        this.InPagePieceIndexes.push(i);
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
    document.getElementById("btnRestart").onclick = btnRestart_onClick;
    document.getElementById("btnNext").onclick = btnNext_onClick;
    SetNextButtonEnabled(false);

    CommonScript.DownloadGameData("EPI-memgame1.json", Game_onLoad);
}

function DrawPage(pageObject)
{
    pageSession = new PageSession(pageObject);
    
    pageSession.InPagePieceIndexes = pageSession.InPagePieceIndexes.randomizeItems();

    for (let i = 0; i < pageSession.InPagePieceIndexes.length; i++)
    {
        const pieceObject = gameSession.CurrentPage().pieces[pageSession.InPagePieceIndexes[i]];
        
        let pieceElement = document.createElement("div");
        let picture = document.createElement("img");
        picture.src = pieceObject.picture;
        picture.alt = pieceObject.caption;
        CS.SetElementVisibility(picture, false);
        pieceElement.appendChild(picture);

        pieceElement.className = "piece";
        pieceElement.setAttribute("data-id", pageSession.InPagePieceIndexes[i]);
        pieceElement.onclick = Piece_onClick;

        pieceBoard.appendChild(pieceElement);
    }
}

function ClearPage()
{
    while (pieceBoard.firstChild) pieceBoard.removeChild(pieceBoard.firstChild);
    pageSession = undefined;
    SetNextButtonEnabled(false);
}

function Game_onLoad(e)
{
    gameSession = e.gameSession;
    CS.SetElementVisibility(startForm, true);
}

function ResetPiece(pieceElement)
{
    CS.SetElementVisibility(pieceElement.querySelector("img"), false);
    pieceElement.onclick = Piece_onClick;
}

function SelectPiece(pElement)
{
    const pieceElement = pElement;
    const pieceID = pieceElement.getAttribute("data-id");

    CS.SetElementVisibility(pieceElement.querySelector("img"), true);  //show piece picture
 

    if (!pageSession.firstPieceElementSelected) pageSession.firstPieceElementSelected = pieceElement; //first piece from the pair selected? 
    else if (pageSession.firstPieceElementSelected !== pieceElement) //second piece from the pair selected?
    {
        if (pageSession.firstPieceElementSelected.getAttribute("data-id") === pieceID)
        {
             pageSession.score++;
             MarkCorrectPair(pieceElement, pageSession.firstPieceElementSelected);
        }
        else
        {
            ResetIncorrectPair(pieceElement, pageSession.firstPieceElementSelected)            
        }
        pageSession.firstPieceElementSelected = undefined;
    }
}

function MarkCorrectPair(piece1Element, piece2Element)
{
    piece1Element.onclick = piece2Element.onclick = undefined;
    piece1Element.style.border = piece2Element.style.border = "2px solid green";
}

function ResetIncorrectPair(piece1Element, piece2Element)
{
    piece1Element.onclick = piece2Element.onclick = undefined;
    setTimeout(ResetPiece, gameSession.Settings.resetPieceTimeout, piece1Element);
    setTimeout(ResetPiece, gameSession.Settings.resetPieceTimeout, piece2Element);
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

function SetNextButtonEnabled(state)
{
    let btn = document.getElementById("btnNext");
    btn.disabled = !state;
}

//#region Event listenters

function btnStartGame_onClick(e)
{
    DrawPage(gameSession.NextPage());
    CS.SetElementVisibility(startForm, false);
    CS.SetElementVisibility(gameForm, true);
}

function btnRestart_onClick(e)
{
    ClearPage();
    DrawPage(gameSession.CurrentPage());
}

function btnNext_onClick(e)
{
    ClearPage();
    if (!gameSession.IsOver())
        DrawPage(gameSession.NextPage());
    else
    {
        CS.SetElementVisibility(gameForm, false);
        CS.SetElementVisibility(endForm, true);
    }
}

function Piece_onClick(e)
{
    SelectPiece(this);
    if (pageSession.IsOver()) SetNextButtonEnabled(true);
}

//#endregion