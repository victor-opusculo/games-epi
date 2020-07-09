const TileSize = 40;
const BoardFont = { Color: "#000000", SizeFamily: "20px sans-serif" };
const FoundWordBgColor = "#22B14C";
const LetterBgColorOnMouseHover = "lightgray";

const Wordhunt = {};

Wordhunt.PageSession = function(pageObject)
{
    this.WordFound = new Array(pageObject.words.length);
	
	for (let i = 0; i < this.WordFound.length; i++)
		this.WordFound[i] = false;

};

Wordhunt.CanvasManager = function(canvasElement)
{
    this._element = canvasElement;
    this._renderIntervalId = undefined;
    this._context = canvasElement.getContext("2d");

    this._currentPageObject = null;
    this._currentPageSessionObject = null;

    this._xo = this._xf = this._yo = this._yf = 0;
    this._gridXo = this._gridXf = this._gridYo = this._gridYf = 0;

    this._dragging = false;

    this._addMouseEventListeners();
    this._addTouchEventListeners();
};

Wordhunt.CanvasManager.prototype =
{
    constructor: Wordhunt.CanvasManager,

    _drawGrid: function()
    {
        let board = this._currentPageObject.board;

        this._context.fillStyle= BoardFont.Color;
        this._context.font = BoardFont.SizeFamily;
        for (let l = 0; l < board.length; l++)
        {
            for (let c = 0; c < board[l].length; c++)
            {
                this._context.fillText(board[l][c], c*TileSize + TileSize*1/3, l*TileSize + TileSize*2/3);
            }				
        }
    },

    _foundWordsDraw: function()
    {
        const words = this._currentPageObject.words;
        const ct = this._context;

        for (let i = 0; i < pageSession.WordFound.length; i++)
            if (pageSession.WordFound[i])
            {
                let triangle = { opp: 0, adj: 0, hip: 0 }
                triangle.adj = words[i].orient === "h" ? words[i].string.length - 1 : 0;
                triangle.opp = words[i].orient === "v" ? words[i].string.length - 1 : 0;
                triangle.hip = Math.sqrt( Math.pow(triangle.adj, 2) + Math.pow(triangle.opp, 2) );
                
                let sinAngle = triangle.opp / triangle.hip;
                let angle = Math.asin(sinAngle);
                
                ct.beginPath();
                
                let markXorigin = words[i].position.x * TileSize + TileSize / 2;
                let markYorigin = words[i].position.y * TileSize + TileSize / 2;
                let markXfinal = words[i].orient === "h" ? (words[i].position.x + words[i].string.length - 1) * TileSize + TileSize / 2 : words[i].orient === "v" ? markXorigin : undefined;
                let markYfinal = words[i].orient === "v" ? (words[i].position.y + words[i].string.length - 1) * TileSize + TileSize / 2 : words[i].orient === "h" ? markYorigin : undefined;
                
                ct.arc(markXorigin, markYorigin, TileSize/2, 0.5*Math.PI+angle, 1.5*Math.PI+angle);
                ct.arc(markXfinal, markYfinal, TileSize/2, 1.5*Math.PI+angle, 0.5*Math.PI+angle);
                
                ct.closePath();
                ct.fillStyle = FoundWordBgColor;
                ct.fill();
            }
    },

    _drawSelection: function()
    {
        let ct = this._context;

        if (this._dragging)
        {
            let triangle = { opp: 0, adj: 0, hip: 0 }
            triangle.adj = this._xf - this._xo;
            triangle.opp = this._yf - this._yo;
            triangle.hip = Math.sqrt( Math.pow(triangle.adj, 2) + Math.pow(triangle.opp, 2) );
            
            let sinAngle = triangle.opp / triangle.hip;
            
            let angle = Math.asin(sinAngle);
        
            ct.beginPath();  
            
            if (this._xf - this._xo > 0)
            {
                ct.arc(this._xo, this._yo, TileSize/2, 0.5*Math.PI+angle, 1.5*Math.PI+angle);
                ct.arc(this._xf, this._yf, TileSize/2, 1.5*Math.PI+angle, 0.5*Math.PI+angle);
            }
            else
            {
                ct.arc(this._xo, this._yo, TileSize/2, 1.5*Math.PI-angle, 0.5*Math.PI-angle);
                ct.arc(this._xf, this._yf, TileSize/2, 0.5*Math.PI-angle, 1.5*Math.PI-angle);
            }
            
            ct.closePath(); 
            ct.stroke(); 
        }
        else
        {
            ct.beginPath();
            ct.arc( this._xf, 
                    this._yf, 
                    TileSize / 2, 
                    0, 
                    2*Math.PI);
                    
            ct.closePath();
            ct.fillStyle= LetterBgColorOnMouseHover;
            ct.fill();
        }
    },

    _clearFrame: function()
    {
        this._context.clearRect(0,0, this._element.width, this._element.height);
    },

    _drawFrame: function()
    {
        this._foundWordsDraw();
        this._drawSelection();
        this._drawGrid();
    },

    _drawLoop: function(canvasManagerObject)
    {
        canvasManagerObject._clearFrame();

        if (canvasManagerObject._currentPageObject)
            canvasManagerObject._drawFrame();
    },

    _processSelection: function()
    {
        let orient = this._gridYf === this._gridYo ? "h" : this._gridXf === this._gridXo ? "v" : undefined;
				
        let realXorigin = this._gridXo > this._gridXf ? this._gridXf : this._gridXo;
        let realYorifin = this._gridYo > this._gridYf ? this._gridYf : this._gridYo;
        
        let length;
        if (orient === "h")
        {
            let rawLength = this._gridXf - this._gridXo;
            rawLength = rawLength > 0 ? rawLength : rawLength * -1;
            length = rawLength + 1;
        }
        else if (orient === "v")
        {
            let rawLength = this._gridYf - this._gridYo;
            rawLength = rawLength > 0 ? rawLength : rawLength * -1;
            length = rawLength + 1;
        }
        
        if (length && orient)
        {
            let foundWord = CheckForWordOn(realXorigin, realYorifin, length, orient, this._currentPageObject);
        
            if (foundWord > -1)
                this._currentPageSessionObject.WordFound[foundWord] = true;
                
            UpdateNextButtonState();
            UpdatePageLabels();
        }
    },

    _addMouseEventListeners: function()
    {
        let cmObj = this;

        this._element.addEventListener("mousedown", function(e)
        {
            let coords = cmObj.GetCanvasMouseCoordinates(e);
			
            cmObj._gridXo = Math.floor(coords.x / TileSize);
            cmObj._gridYo = Math.floor(coords.y / TileSize);
            
            cmObj._xo = cmObj._gridXo * TileSize + TileSize/2;
            cmObj._yo = cmObj._gridYo * TileSize + TileSize/2;
            cmObj._dragging = true;
                
        }, false);

        this._element.addEventListener("mousemove", function(e)
        {
            let coords = cmObj.GetCanvasMouseCoordinates(e);
				
            cmObj._gridXf = Math.floor(coords.x / TileSize);
            cmObj._gridYf = Math.floor(coords.y / TileSize);
            
            cmObj._xf = cmObj._gridXf * TileSize + TileSize/2;
            cmObj._yf = cmObj._gridYf * TileSize + TileSize/2;

        }, false);

        this._element.addEventListener("mouseup", function(e)
        {
            cmObj._dragging = false;

            if (cmObj._currentPageObject && cmObj._currentPageSessionObject)
                cmObj._processSelection();

        }, false);
    },

    _addTouchEventListeners: function()
	{
		const canvasobj = this;
	
		this._element.addEventListener("touchstart", function(e)
		{
			var touch = e.touches[0];
			var mouseEvent = new MouseEvent("mousedown", { clientX: touch.clientX, clientY: touch.clientY });
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);

		this._element.addEventListener("touchend", function(e)
		{
			var mouseEvent = new MouseEvent("mouseup", {});
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);

		this._element.addEventListener("touchmove", function(e)
		{
			var touch = e.touches[0];
			var mouseEvent = new MouseEvent("mousemove", { clientX: touch.clientX, clientY: touch.clientY });
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);
	},

    DrawPage: function(pageObject, pageSessionObject)
    {
        this._currentPageObject = pageObject;
        this._currentPageSessionObject = pageSessionObject;

        this._element.width = pageObject.board[0].length * TileSize + 1;
        this._element.height = pageObject.board.length * TileSize + 1;
    },

    ClearPage: function()
    {
        this._currentPageObject = null;
        this._currentPageSessionObject = null;
    },

    StartRendering: function()
    {
        if (!this._renderIntervalId)
            this._renderIntervalId = setInterval(this._drawLoop, 1000 / 30, this)
    },

    StopRendering: function()
    {
        if (this._renderIntervalId)
        {
            clearInterval(this._renderIntervalId);
            this._renderIntervalId = undefined;
        }
        this._clearFrame();
    },

    GetCanvasMouseCoordinates: function(mouseEventObj)
    {
        let rect = this._element.getBoundingClientRect();
        let x = mouseEventObj.clientX - rect.left;
        let y = mouseEventObj.clientY - rect.top;
        
        return { x: x, y: y};
    }
};
Object.freeze(Wordhunt);

var canvasManager;
var gameSession;
var pageSession;

var startPageForm; //HTMLElement
var gamePageForm; //HTMLElement
var endPageForm; //HTMLElement

function InitializeDocument()
{
	startPageForm = document.getElementById("startPage");
	gamePageForm = document.getElementById("gamePage");
    endPageForm = document.getElementById("endPage");

    canvasManager = new Wordhunt.CanvasManager(document.getElementById("tableCanvas"));

	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
	
	document.getElementById("btnNext").onclick = btnNext_onClick;
	document.getElementById("btnShowAnswer").onclick = btnShowAnswer_onClick;
	
    CommonScript.DownloadGameData("wordhunt/EPI-wordhunt1.json", Game_onLoad);
}

function Game_onLoad(e)
{
	gameSession = e.gameSession;
    document.getElementById("startPageContent").innerHTML = gameSession.Settings.startPageContent;
    
	CS.SetElementVisibility(startPageForm, true);
}

function ClearPage()
{
    canvasManager.ClearPage();
    canvasManager.StopRendering();
    pageSession = undefined;
}

function DrawPage(pageObject)
{
    document.getElementById("pageText").innerHTML = pageObject.text;

    pageSession = new Wordhunt.PageSession(pageObject);
    canvasManager.DrawPage(pageObject, pageSession);
    canvasManager.StartRendering();

    UpdateNextButtonState();
    UpdatePageLabels();
}

function CheckForWordOn(gridX, gridY, gridLength, orient, pageObject)
{
    const words = pageObject.words;

    for (let i = 0; i < words.length; i++)
    {
        const w = words[i];

        if (w.position.x === gridX && w.position.y === gridY && w.string.length === gridLength && w.orient === orient)
            return words.indexOf(w);
    }

    return -1;
}

function UpdatePageLabels()
{
	document.getElementById("lblFoundWords").innerHTML = (function()
	{ 
		let finalString = "";
		pageSession.WordFound.forEach( function(item, index) 
		{ 
			if (item) 
				finalString += gameSession.CurrentPage().words[index].string + "<br/>";
		});
		return finalString;
	}());

}

function UpdateNextButtonState()
{
	let btn = document.getElementById("btnNext");
	if (pageSession.WordFound.indexOf(false) > -1)
		btn.disabled = true;
	else
		btn.disabled = false;	
}

function GoNextPage()
{
    ClearPage();
    DrawPage(gameSession.NextPage());
}

function EndGame()
{
    ClearPage();
    CS.SetElementVisibility(gamePageForm, false);
    CS.SetElementVisibility(endPageForm, true);
}

//#region Event Listeners

function btnNext_onClick(e)
{
	if (!gameSession.IsOver())
		GoNextPage();
	else
		EndGame();
}

function btnShowAnswer_onClick(e)
{
    for (let i = 0; i < pageSession.WordFound.length; i++)
        pageSession.WordFound[i] = true;

    UpdatePageLabels();
    UpdateNextButtonState();
}

function btnClear_onClick(e)
{
	ClearPage();
	DrawPage(gameSession.CurrentPage());
}

function btnStartGame_onClick(e)
{
	CS.SetElementVisibility(startPageForm, false);
	CS.SetElementVisibility(gamePageForm, true);

	DrawPage(gameSession.NextPage());
}
//#endregion