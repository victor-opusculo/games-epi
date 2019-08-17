//@ts-check

const SpriteType = {};
Object.defineProperty(SpriteType, "Piece", {writable: false, value: 1});
Object.defineProperty(SpriteType, "Receptacle", {writable: false, value: 0});
Object.freeze(SpriteType);

function Sprite(src, x, y, type, typeProperties, onSpriteLoad)
{	
	this.x = x;
	this.y = y;

	this.imageObj = new Image();
	this.imageObj.src = src;
	this.imageObj.onload = onSpriteLoad;

	this.type = type;
	this.typeProperties = typeProperties;

	this.width = this.height = 0;
	Object.defineProperty(this, "width", {get:function(){return this.imageObj.width;}});
	Object.defineProperty(this, "height", {get:function(){return this.imageObj.height;}});

	this.initial_x = this.initial_y = 0;
	Object.defineProperty(this, "initial_x", {writable: false, value: x});
	Object.defineProperty(this, "initial_y", {writable: false, value: y});
}

/** @param {CanvasRenderingContext2D} context*/
Sprite.prototype.Draw = function(context) 
{
	context.drawImage(this.imageObj, this.x, this.y);
};

Sprite.prototype.HitTest = function(positionObject)
{	
	var x = positionObject.x;
	var y = positionObject.y;

	return (
		(x >= this.x) && (x <= this.x + this.width) 
		&&
		(y >= this.y) && (y <= this.y + this.height)
		);
}

function Canvas(htmlElement)
{
	/** @type {HTMLCanvasElement} */
	this._element = htmlElement;

	/**@type{CanvasRenderingContext2D} */
	this._context = this._element.getContext("2d");
	this._mainLoopInterval = undefined;

	/**@type{Sprite}*/
	this._dragging = null;

	/**@type{Array<Sprite>}*/
	this.Drawables = [];	
}

Canvas.prototype._setPiecePosition = function(pieceObject, PositionObject, topLeftOrigin)
{
	if (topLeftOrigin)
	{
		pieceObject.x = PositionObject.x;
		pieceObject.y = PositionObject.y;
	}
	else
	{
		pieceObject.x = PositionObject.x - (pieceObject.width / 2);
		pieceObject.y = PositionObject.y - (pieceObject.height / 2);
	}
	
}

Canvas.prototype.IsPageCompleted = function()
{
	let piecesFound = 0;
	this.Drawables.forEach( function(item)
	{
		if (item.type === SpriteType.Piece) piecesFound++;
	});

	return piecesFound === 0;
}

Canvas.prototype._managePieceDrop = function(draggedObject, mousePos)
{
	for (let i = 0; i < this.Drawables.length; i++)
	{
		if (this.Drawables[i].type === SpriteType.Receptacle)
		if (this.Drawables[i].HitTest(mousePos))
		if (this.Drawables[i].typeProperties.Id === draggedObject.typeProperties.destinationReceptacle)
		{
			this.Drawables.splice(this.Drawables.indexOf(this._dragging));
			SetNextButtonEnabled(this.IsPageCompleted());
			break;
		}
		else
			this._setPiecePosition(draggedObject, {x: draggedObject.initial_x, y: draggedObject.initial_y}, true);
	}

	
}

Canvas.prototype._updateMouseCursor = function(mousePosition)
{
	const canvasobj = this;
	for (let i = 0; i < canvasobj.Drawables.length; i++)
	{
		if (canvasobj.Drawables[i].type == SpriteType.Piece)
		{
			if (canvasobj.Drawables[i].HitTest(mousePosition))
			{
				canvasobj._element.style.cursor = "pointer";
				break;
			}
		}
		else
		{
			canvasobj._element.style.cursor = "";
		}
	}
}

Canvas.prototype._addMouseEventListeners = function()
{
	const canvasobj = this;
	this._element.addEventListener("mousedown", function (e) 
	{
		//iterate (reverse) over Drawables list
		for (let i = canvasobj.Drawables.length - 1; i >= 0; i--)
		{
			if (canvasobj.Drawables[i].type === SpriteType.Piece)
				if (canvasobj.Drawables[i].HitTest(getMousePos(canvasobj._element, e)))
				{
					canvasobj._dragging = canvasobj.Drawables[i];

					//put selected piece on the top
					canvasobj.Drawables.splice(i, 1);
					canvasobj.Drawables.push(canvasobj._dragging);
					break;
				}
		}
			
	}, false);

	this._element.addEventListener("mouseup", function (e) 
	{
		if (canvasobj._dragging)
		{
			let mousePos = getMousePos(canvasobj._element, e);
			canvasobj._managePieceDrop(canvasobj._dragging, mousePos);
		}
		canvasobj._dragging = null;
	}, false);

	this._element.addEventListener("mousemove", function (e) 
	{
		let mousePos = getMousePos(canvasobj._element, e);
		if (canvasobj._dragging)
			canvasobj._setPiecePosition(canvasobj._dragging, mousePos);
		else
			canvasobj._updateMouseCursor(mousePos);
	}, false);
}

Canvas.prototype._addTouchEventListeners = function()
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
}

//Works only when rendering cycle is off
Canvas.prototype._drawLoadingText = function()
{
	this._context.font = "bold 28px sans-serif";
	this._context.fillStyle = "#22B14C";
	this._context.textAlign = "center";
	this._context.fillText("Carregando", this._element.width / 2, this._element.height / 2);
}

Canvas.prototype.Prepare = function()
{
	this._addMouseEventListeners();
	this._addTouchEventListeners();
}

Canvas.prototype.DrawFrame = function(canvasObj)
{
	canvasObj.ClearFrame(canvasObj);

	for (let i = 0; i < canvasObj.Drawables.length; i++)
		canvasObj.Drawables[i].Draw(canvasObj._context);
};

Canvas.prototype.ClearFrame = function(canvasObj)
{
	canvasObj._context.clearRect(0, 0, canvasObj._element.width, canvasObj._element.height);
};

Canvas.prototype.StartRendering = function()
{	
	this._mainLoopInterval = window.setInterval(this.DrawFrame, 1000 / 30, this);
};

Canvas.prototype.StopRendering = function()
{
	this._context.clearRect(0, 0, this._element.width, this._element.height);
	if (this._mainLoopInterval) window.clearInterval(this._mainLoopInterval);
};

Canvas.prototype.DrawPage = function(pageObject)
{
	const canvasobj = this;

	var spritesLoaded = 0;

	this._drawLoadingText();
	this._setPageData(pageObject, function(e)
	{
		spritesLoaded++;
		if (spritesLoaded === canvasobj.Drawables.length) canvasobj.StartRendering();
	});
}

Canvas.prototype.ClearPage = function()
{
	while(this.Drawables[0]) this.Drawables.pop();
	this.StopRendering();
	SetNextButtonEnabled(false);
};

Canvas.prototype._setPageData = function(pageObject, onSpritesLoad)
{
	const canvasobj = this;

	var currentSpritePosition;
	var XpositionIncrement;

	//create receptacles sprites
	currentSpritePosition = {x: 10, y: 500};
	XpositionIncrement = Number(canvasobj._element.getAttribute("width")) / pageObject.receptacles.length;
	pageObject.receptacles.forEach(function(item, index)
	{
		let spriteTypeProperties = {Id: index}
		let sprite = new Sprite(item.picture, currentSpritePosition.x, currentSpritePosition.y, SpriteType.Receptacle, spriteTypeProperties, onSpritesLoad);
		canvasobj.Drawables.push(sprite);

		currentSpritePosition.x += XpositionIncrement;
	});

	//create pieces sprites
	currentSpritePosition = {x: 50, y: 80};
	XpositionIncrement = Number(canvasobj._element.getAttribute("width")) / pageObject.pieces.length;
	pageObject.pieces.forEach(function(item) 
	{
		let spriteTypeProperties = {destinationReceptacle: item.destinationReceptacle}
		let sprite = new Sprite(item.picture, currentSpritePosition.x, currentSpritePosition.y, SpriteType.Piece, spriteTypeProperties, onSpritesLoad);
		canvasobj.Drawables.push(sprite);

		currentSpritePosition.x += XpositionIncrement;
	});

};

var gameSession;
var canvasObject;

var startForm, gameForm, endForm;

function InitializeDocument()
{
	startForm = document.getElementById("startForm");
	gameForm = document.getElementById("gameForm");
	endForm = document.getElementById("endForm");

	document.getElementById("btnNext").onclick = btnNext_onClick;
	SetNextButtonEnabled(false); //Firefox bug fix
	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;

	canvasObject = new Canvas(/**@type{HTMLCanvasElement} */(document.getElementById("canvas")));

	//@ts-ignore
	CommonScript.DownloadGameData("EPI-recycling1.json", Game_onLoad);

}

function StartGame()
{
	CS.SetElementVisibility(startForm, false);
	CS.SetElementVisibility(gameForm, true);

	canvasObject.Prepare();
	canvasObject.DrawPage(gameSession.NextPage());
}

function EndGame()
{
	canvasObject.ClearPage();
	CS.SetElementVisibility(gameForm, false);
	CS.SetElementVisibility(endForm, true);
}

function SetNextButtonEnabled(state)
{
	//@ts-ignore
	document.getElementById("btnNext").disabled = !state;
}

function getMousePos(canvasDom, mouseEvent) 
{
	var rect = canvasDom.getBoundingClientRect();
	return {
	  x: mouseEvent.clientX - rect.left,
	  y: mouseEvent.clientY - rect.top
	};
}

//#region Event listeners

function Game_onLoad(e)
{
	gameSession = e.gameSession;

	CS.SetElementVisibility(startForm, true);
}

function btnStartGame_onClick(e)
{
	StartGame();
}

function btnNext_onClick(e)
{
	canvasObject.ClearPage();
	
	if (!gameSession.IsOver())
		canvasObject.DrawPage(gameSession.NextPage());
	else
		EndGame();
}

//#endregion