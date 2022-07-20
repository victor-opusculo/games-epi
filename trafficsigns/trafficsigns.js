const TrafficSigns = {};

TrafficSigns.SpriteType =
{
	Effect: 3,
	Background: 2,
	Piece: 1,
	Receptacle: 0
}; Object.freeze(TrafficSigns.SpriteType);

TrafficSigns.Sprite = function(imgSrc, x, y, type, typeProperties, onSpriteLoad)
{
	this._imageObj = new Image();
	this._imageObj.src = imgSrc;
	this._imageObj.onload = onSpriteLoad;
	
	this.Position = {X: x, Y: y};
	this.Size = {};
	const self = this;
	Object.defineProperty(this.Size, "Width", { get: function() { return self._imageObj.width; } });
	Object.defineProperty(this.Size, "Height", { get: function() { return self._imageObj.height; } });
	
	this.InitialPosition = {};
	Object.defineProperty(this.InitialPosition, "X", {writable: false, value: x});
	Object.defineProperty(this.InitialPosition, "Y", {writable: false, value: y});
	
	this.Type = type;
	this.TypeProperties = typeProperties;
	
};

TrafficSigns.Sprite.prototype =
{
	constructor: TrafficSigns.Sprite,
	
	Draw: function(context)
	{
		context.drawImage(this._imageObj, this.Position.X, this.Position.Y);
	},
	
	HitTest: function(positionObject)
	{
		var x = positionObject.X;
		var y = positionObject.Y;
		
		return  (
				(x >= this.Position.X) && (x <= this.Position.X + this.Size.Width)
				&&
				(y >= this.Position.Y) && (y <= this.Position.Y + this.Size.Height)
				);
	}
};

TrafficSigns.CanvasManager = function(canvasElement)
{
	this._element = canvasElement;
	this._context = canvasElement.getContext("2d");
	this._drawLoopInterval = undefined;
	
	this._draggingSprite = null;
	
	this.Drawables = [];
	
	this._lastTouchPosition = {x: 0, y: 0}
	
	this._addMouseEventListeners();
	this._addTouchEventListeners();
};

TrafficSigns.CanvasManager.prototype = 
{
	constructor: TrafficSigns.CanvasManager,
	
	_clearFrame: function()
	{
		this._context.clearRect(0, 0, this._element.width, this._element.height);
	},
	
	_drawFrame: function(canvasManagerSelf) 
	{
		const self = canvasManagerSelf;

		self._clearFrame();
		
		for (let i = 0; i < self.Drawables.length; i++)
			self.Drawables[i].Draw(self._context);
	},
	
	_setPageData: function(pageObject, onSpritesLoad)
	{
		const canvasObj = this;
		
		//create background
		let bgSprite = new TrafficSigns.Sprite(pageObject.background, 0, 0, TrafficSigns.SpriteType.Background, null, onSpritesLoad);
		canvasObj.Drawables.push(bgSprite);

		//create receptacles
		pageObject.receptacles.forEach( function(item, index)
		{
			let spriteTypeProperties = {Id: index};
			let sprite = new TrafficSigns.Sprite(item.picture, item.position.x, item.position.y, TrafficSigns.SpriteType.Receptacle, spriteTypeProperties, onSpritesLoad);
			
			canvasObj.Drawables.push(sprite);
		});
		
		//create pieces
		pageObject.pieces.forEach( function(item, index)
		{
			let spriteTypeProperties = {DestinationReceptacle: item.destinationReceptacle, Placed: false};
			let sprite = new TrafficSigns.Sprite(item.picture, item.position.x, item.position.y, TrafficSigns.SpriteType.Piece, spriteTypeProperties, onSpritesLoad);
			
			canvasObj.Drawables.push(sprite);
		});
	},

	_addCorrectAnswerSprite: function(positionObject)
	{
		var canvasObj = this;

		var sprite = new TrafficSigns.Sprite(gameSession.Settings.correctAnswerEffectSprite.picture, positionObject.X, positionObject.Y, TrafficSigns.SpriteType.Effect, null, 
			function(e)
			{
				canvasObj.Drawables.push(sprite);
			});
	},

	_drawLoadingText: function()
	{
		this._context.font = "bold 28px sans-serif";
		this._context.fillStyle = "#22B14C";
		this._context.textAlign = "center";
		this._context.fillText("Carregando", this._element.width / 2, this._element.height / 2);
	},
	
	_addMouseEventListeners: function()
	{
		const canvasObj = this;
		
		this._element.addEventListener("mousedown", function(e)
		{
			//iterate (reverse) over Drawables list
			for (let i = canvasObj.Drawables.length - 1; i >= 0; i--)
			{
				if (canvasObj.Drawables[i].Type === TrafficSigns.SpriteType.Piece)
					if (canvasObj.Drawables[i].HitTest(GetMousePos(canvasObj._element, e)))
						if (!canvasObj.Drawables[i].TypeProperties.Placed)
						{
							canvasObj._draggingSprite = canvasObj.Drawables[i];
							
							//put selected piece on top
							canvasObj.Drawables.splice(i, 1);
							canvasObj.Drawables.push(canvasObj._draggingSprite);
							break;
						}
			}
			
		}, false);
		
		this._element.addEventListener("mouseup", function(e)
		{
			if (canvasObj._draggingSprite)
			{
				let mousePos = GetMousePos(canvasObj._element, e);
				canvasObj._managePieceDrop(canvasObj._draggingSprite, mousePos);
			}
			canvasObj._draggingSprite = null;
		}, false);
		
		this._element.addEventListener("mousemove", function(e)
		{
			let mousePos = GetMousePos(canvasObj._element, e);
			
			if (canvasObj._draggingSprite)
				canvasObj._setPiecePosition(canvasObj._draggingSprite, mousePos);
			else
				canvasObj._updateMouseCursor(mousePos);
		}, false);
	},
	
	_addTouchEventListeners: function()
	{
		const canvasobj = this;
	
		this._element.addEventListener("touchstart", function(e)
		{
			var touch = e.touches[0];
			
			canvasobj._lastTouchPosition.x = touch.clientX;
			canvasobj._lastTouchPosition.y = touch.clientY;
			
			var mouseEvent = new MouseEvent("mousedown", { clientX: touch.clientX, clientY: touch.clientY });
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);

		this._element.addEventListener("touchend", function(e)
		{
			var mouseEvent = new MouseEvent("mouseup", { clientX: canvasobj._lastTouchPosition.x, clientY: canvasobj._lastTouchPosition.y });
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);

		this._element.addEventListener("touchmove", function(e)
		{
			var touch = e.touches[0];
			
			canvasobj._lastTouchPosition.x = touch.clientX;
			canvasobj._lastTouchPosition.y = touch.clientY;
			
			var mouseEvent = new MouseEvent("mousemove", { clientX: touch.clientX, clientY: touch.clientY });
			canvasobj._element.dispatchEvent(mouseEvent);
		}, false);
	},
	
	_updateMouseCursor: function(mousePos)
	{
		const canvasobj = this;
		
		for (let i = 0; i < canvasobj.Drawables.length; i++)
		{
			if(canvasobj.Drawables[i].Type === TrafficSigns.SpriteType.Piece)
			{
				if (canvasobj.Drawables[i].HitTest(mousePos))
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
	},
	
	_setPiecePosition: function(pieceObj, positionObject, topLeftOrigin)
	{
		if (topLeftOrigin)
		{
			pieceObj.Position.X = positionObject.X;
			pieceObj.Position.Y = positionObject.Y;
		}
		else
		{
			pieceObj.Position.X = positionObject.X - (pieceObj.Size.Width / 2);
			pieceObj.Position.Y = positionObject.Y - (pieceObj.Size.Height / 2);
		}
	},
	
	_managePieceDrop: function(draggedPiece, mousePos)
	{
		for (let i = 0; i < this.Drawables.length; i++)
		{
			if (this.Drawables[i].Type === TrafficSigns.SpriteType.Receptacle)
				if (this.Drawables[i].HitTest(mousePos))
					if (this.Drawables[i].TypeProperties.Id === draggedPiece.TypeProperties.DestinationReceptacle)
					{
						draggedPiece.TypeProperties.Placed = true;

						let placedPosition = 
						{
							X: this.Drawables[i].Position.X + (this.Drawables[i].Size.Width / 2),
							Y: this.Drawables[i].Position.Y + (this.Drawables[i].Size.Height / 2)
						};
						this._setPiecePosition(draggedPiece, placedPosition, false);
						this._addCorrectAnswerSprite(draggedPiece.Position);
						SetNextButtonEnabled(this.IsPageCompleted());
						break;
					}
					else
						this._setPiecePosition(draggedPiece, {X: draggedPiece.InitialPosition.X, Y: draggedPiece.InitialPosition.Y}, true);
		}
	},
	
	IsPageCompleted: function()
	{
		let piecesNotPlaced = 0;
		this.Drawables.forEach( function(item)
		{
			if (item.Type === TrafficSigns.SpriteType.Piece)
				if (!item.TypeProperties.Placed) piecesNotPlaced++;
		});
		
		return piecesNotPlaced === 0;
	},
	
	StartRendering: function() 
	{
		this._drawLoopInterval = window.setInterval(this._drawFrame, 1000 / 30, this);
	},
	
	StopRendering: function() 
	{
		if (this._drawLoopInterval) window.clearInterval(this._drawLoopInterval);
		this._clearFrame();
	},
	
	DrawPage: function(pageObject)
	{
		const canvasObj = this;
		
		var spritesLoaded = 0;
		
		this._drawLoadingText();
		this._setPageData(pageObject, function(e)
		{
			spritesLoaded++;
			if (spritesLoaded === canvasObj.Drawables.length) canvasObj.StartRendering();
		});
	},
	
	ClearPage: function()
	{
		SetNextButtonEnabled(false);
		while(this.Drawables[0]) this.Drawables.pop();
		this.StopRendering();
	}
	
};

Object.freeze(TrafficSigns);

var startForm, gameForm, endForm;
var gameSession;
var canvasManager;

function InitializeDocument()
{
	startForm = document.getElementById("startForm");
	gameForm = document.getElementById("gameForm");
	endForm = document.getElementById("endForm");
	
	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
	document.getElementById("btnNext").onclick = btnNext_onClick;
	
	CommonScript.DownloadGameData("trafficsigns/EPI-trafficsigns1.json", Game_onLoad);
	
	canvasManager = new TrafficSigns.CanvasManager(document.getElementById("canvas"));
}

function StartGame()
{
	canvasManager.DrawPage(gameSession.NextPage());
	
	CS.SetElementVisibility(startForm, false);
	CS.SetElementVisibility(gameForm, true);
}

function EndGame()
{
	canvasManager.ClearPage();
	
	CS.SetElementVisibility(gameForm, false);
	CS.SetElementVisibility(endForm, true);
}

function SetNextButtonEnabled(state)
{
	document.getElementById("btnNext").disabled = !state;
}

function GetMousePos(canvasDom, mouseEvent) 
{
	var rect = canvasDom.getBoundingClientRect();
	return {
	  X: mouseEvent.clientX - rect.left,
	  Y: mouseEvent.clientY - rect.top
	};
}

//#region Event Listeners

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
	canvasManager.ClearPage();
	
	if (!gameSession.IsOver())
		canvasManager.DrawPage(gameSession.NextPage());
	else
		EndGame();
}

//#endregion