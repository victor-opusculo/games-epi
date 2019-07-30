function Game(gameDataObject)
{
	this._gameData = gameDataObject; // expects object { settings: {}, pages: [ { paragraphs: [ { lines: [ { content: [ ***text*** ] } ] } ] } ] } /;
	this._currentPage = -1;
	this._pages = gameDataObject.pages;
	
	this.Title = gameDataObject.settings.title;
}

Game.prototype.CurrentPage = function() // { paragraphs: [] }
{
	return this._pages[this._currentPage]; 
};

Game.prototype.NextPage = function() // { paragraphs: [] }
{
	this._currentPage++;
	return this.CurrentPage();
};

Game.prototype.IsOver = function() // boolean
{
	return this._currentPage === (this._pages.length - 1);
};

var gameSession; //Game

var startForm; //HTMLElement (form)
var gameForm;  //HTMLElement (form)
var endForm; //HTMLElement (form)
var pagePanel; //HTMLElement (div)


function IsLetter(c) // boolean
{
	 return c.length === 1 ? c.toLowerCase() != c.toUpperCase() : false;
}

function InitializeDocument() 
{
	document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

	pagePanel = document.getElementById("pagePanel");

	startForm = document.getElementById("startForm");
	gameForm = document.getElementById("gameForm");
	endForm = document.getElementById("endForm");

	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
	document.getElementById("btnClear").onclick = btnClear_onClick;
	document.getElementById("btnCheck").onclick = btnCheck_onClick;
	document.getElementById("btnShowAnswer").onclick = btnShowAnswer_onClick;

	DownloadGameData("EPI-codegame.json", ReadJSON);
}

function DownloadGameData(url, callback)
{
	var xhttp = new XMLHttpRequest();

    xhttp.callback = callback;
    xhttp.onload = function() { this.callback.apply(this, this.arguments); };
    xhttp.onerror = function() { console.error(this.statusText); } ;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(null);
}

function ReadJSON()
{
	var json = this.responseText;
	var obj = JSON.parse(json);
	InitializeGame(obj);
}

function InitializeGame(gameDataObject)
{
	gameSession = new Game(gameDataObject);
	SetFormVisibility(startForm, true);
}

function EndGame()
{
	ClearPage();
	SetFormVisibility(gameForm, false);
	SetFormVisibility(endForm, true);
}

function ClearPage()
{
	while (pagePanel.firstChild) pagePanel.removeChild(pagePanel.firstChild);
}

function DrawPage(pageObject)
{
	const cpage = pageObject;
	for (let p = 0; p < cpage.paragraphs.length; p++)
		DrawParagraph(cpage.paragraphs[p]);
}

function DrawParagraph(paragraphObject)
{
	var pElement = document.createElement("p");
	pElement.className = "paragraph";
	
	for (let l = 0; l < paragraphObject.lines.length; l++)
		DrawLine(paragraphObject.lines[l], pElement);
	
	pagePanel.appendChild(pElement);
}

function DrawLine(lineObject, paragraphElement)
{
	for (let e = 0; e < lineObject.content.length; e++)
	{
		var lineSection = document.createElement("span");
		lineSection.className = "lineSection";
		
		if (lineObject.content[e].inputWord)
			DrawInputField(lineObject.content[e].inputWord, lineSection);
		else
			lineSection.innerText = lineObject.content[e];
		
		paragraphElement.appendChild(lineSection);
		
	}
	paragraphElement.appendChild(document.createElement("br"));
}

function DrawInputField(word, lineSection)
{
	for (let c = 0; c < word.length; c++)
	{
		if (IsLetter(word[c]))
		{
			var img = document.createElement("img");
			img.src = "chars/" + word[c].toUpperCase() + ".jpg";
			
			lineSection.appendChild(img);
		}
	}
	
	lineSection.appendChild(document.createElement("br"));
	
	for (let c = 0; c < word.length; c++)
	{
			var inputBox = document.createElement("input");
			inputBox.type = "text";
			inputBox.maxLength = 1;
			inputBox.setAttribute("data-char", word[c]);
			
			lineSection.appendChild(inputBox);
	}
}

function GoNextPage()
{
	ClearPage();
	DrawPage(gameSession.NextPage());
}

function ClearInputs()
{
	gameForm.reset();

	var inps = pagePanel.querySelectorAll("input");
	for (let i = 0; i < inps.length; i++)
		inps[i].className = "";
}

function ShowSolution()
{
	var inps = pagePanel.querySelectorAll("input");
	for (let i = 0; i < inps.length; i++)
		inps[i].value = inps[i].getAttribute("data-char");
}

function VerifyInputs() // boolean
{
	var scannedInputs = 0;
	var correctInputs = 0;

	var inps = pagePanel.querySelectorAll("input");
	for (let i = 0; i < inps.length; i++)
		(function (item) 
		{
			scannedInputs++;
			if (item.value.localeCompare(item.getAttribute("data-char"), undefined, { sensitivity: 'base' }) === 0)
			{
				correctInputs++;
				item.classList.add("correct");
			}
			else
			{
				item.className = "";
			}
		})(inps[i]);

	return (scannedInputs === correctInputs);
		
}

function SetNextButtonVisibility(state)
{
	document.getElementById("btnNext").style.display = state ? "" : "none";
	document.getElementById("btnNext").onclick = state ? btnNext_onClick : undefined;
}

function SetFormVisibility(formReference, state)
{
	formReference.style.display = state ? "" : "none";
}

//#region Event listeners
function btnStartGame_onClick(e)
{
	DrawPage(gameSession.NextPage());
	SetFormVisibility(startForm, false);
	SetFormVisibility(gameForm, true);
}

function btnNext_onClick(e)
{
	if (!gameSession.IsOver())
		GoNextPage();
	else
		EndGame();
}

function btnClear_onClick(e)
{
	ClearInputs();
	SetNextButtonVisibility(false);
}

function btnShowAnswer_onClick(e)
{
	ShowSolution();
}

function btnCheck_onClick(e)
{
	SetNextButtonVisibility(VerifyInputs())
}

window.onload = function(e)
{
	InitializeDocument();
};
//#endregion
