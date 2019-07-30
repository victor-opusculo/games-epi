/* =======================================================================================================
 * Jogo de Caça-palavras
 * Desenvolvido por Victor Opusculo para a Escola do Parlamento de Itapevi - Câmara Municipal de Itapevi
 * =======================================================================================================*/

function Game(gameDataObject)
{
	this._gameData = gameDataObject; // expects object { settings: {}, pages: [ { "text":"", "board":[], "words":[] } ] }
	this._currentPage = -1;
	this._pages = gameDataObject.pages;
	
	this.StartPageContent = gameDataObject.settings.startPageContent;
}

Game.prototype.CurrentPage = function() // { "board":[], "words":[] }
{
	return this._pages[this._currentPage]; 
};

Game.prototype.NextPage = function() // { "board":[], "words":[] }
{
	this._currentPage++;
	return this.CurrentPage();
};

Game.prototype.IsOver = function() // boolean
{
	return this._currentPage === (this._pages.length - 1);
};

function PageSession(pageObject)
{
	this.WordFound = new Array(pageObject.words.length);
	
	for (let i = 0; i < this.WordFound.length; i++)
		this.WordFound[i] = false;

	this.Mistakes = 0;
}

var gameSession; //Game
var pageSession; //PageSession

var tablePanel; //HTMLElement
var tableElement; //HTMLElement

var startPageForm; //HTMLElement
var gamePageForm; //HTMLElement
var endPageForm; //HTMLElement

function InitializeDocument()
{
	document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

	startPageForm = document.getElementById("startPage");
	gamePageForm = document.getElementById("gamePage");
	endPageForm = document.getElementById("endPage");

	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;

	tablePanel = document.getElementById("tablePanel");
	
	document.getElementById("btnNext").onclick = btnNext_onClick;
	document.getElementById("btnShowAnswer").onclick = btnShowAnswer_onClick;
	document.getElementById("btnClear").onclick = btnClear_onClick;
	document.getElementById("btnCheck").onclick = btnCheck_onClick;
	
	DownloadGameData("EPI-wordhunt1.json", ReadJSON);
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

	document.getElementById("startPageContent").innerHTML = gameDataObject.settings.startPageContent;

	startPageForm.style.display = "";
}

function DrawPage(pageObject)
{
	const table = document.createElement("table");
	const cpage = pageObject;
	
	tableElement = table;
	tablePanel.appendChild(table);

	for (let y = 0; y < cpage.board.length; y++)
	{
		const tableRow = document.createElement("tr"); 
		for (let x = 0; x < cpage.board[y].length; x++)
		{
			const tableCell = document.createElement("td");
			tableCell.innerText = cpage.board[y][x];
			tableCell.onclick = tableCell_onClick;
			tableRow.appendChild(tableCell);
		}
		table.appendChild(tableRow);
	}

	document.getElementById("pageText").innerHTML = cpage.text;

	pageSession = new PageSession(cpage);
	UpdatePageLabels();
	UpdateNextButtonVisibility();
}

function ClearPage()
{
	while (tablePanel.firstChild) tablePanel.removeChild(tablePanel.firstChild);
	pageSession = undefined;
}

function EndGame()
{
	ClearPage();
	gamePageForm.style.display = "none";
	endPageForm.style.display = "";
}

function GetCell(y, x) //HTMLElement
{
	return tableElement.childNodes[y].childNodes[x];
}

function IsCellChecked(tableCell) //bool
{
	return Boolean(tableCell.clicked);
}

Array.prototype.removeDuplicates = function() //returns new array
{
    let unique_array = this.filter(function(elem, index, self) 
	{
        return index == self.indexOf(elem);
    });
    return unique_array;
}

function GoNextPage()
{
	ClearPage();
	DrawPage(gameSession.NextPage());
}

function VerifyAnswer()
{
	var correclyMarkedCells = []; //HTMLElement (td)

	// Look for correctly marked chars

	for (let w = 0; w < gameSession.CurrentPage().words.length; w++)
	{
		
		let wordObject = gameSession.CurrentPage().words[w];
		let checkedChars = 0;

		for (let c = 0; c < wordObject.string.length; c++)
		{
			
			if (wordObject.orient === "h")
			{
				let charTableCell = GetCell(wordObject.position.y, wordObject.position.x + c);
				if (IsCellChecked(charTableCell))
					{ checkedChars++; correclyMarkedCells.push(charTableCell); }
			}
			else
			{
				let charTableCell = GetCell(wordObject.position.y + c, wordObject.position.x);
				if (IsCellChecked(charTableCell))
					{ checkedChars++; correclyMarkedCells.push(charTableCell); }
			}
		}

		if (checkedChars === wordObject.string.length)
			pageSession.WordFound[w] = true; 
		else
			pageSession.WordFound[w] = false; 

			
	}

	correclyMarkedCells = correclyMarkedCells.removeDuplicates();	// Remove duplicated references
	correclyMarkedCells.forEach( function(item) { item.classList.add("checkedCorrect"); } ); // Set BG color to green

	pageSession.Mistakes = tableElement.querySelectorAll("td.checked").length - correclyMarkedCells.length; // Calculate mistakes

	UpdatePageLabels();
	UpdateNextButtonVisibility();
}

function ShowAnswer()
{
	for (let w = 0; w < gameSession.CurrentPage().words.length; w++)
	{
		let wordObject = gameSession.CurrentPage().words[w];

		for (let c = 0; c < wordObject.string.length; c++)
		{
			
			if (wordObject.orient === "h")
			{
				let tcell =  GetCell(wordObject.position.y, wordObject.position.x + c);
				if (c === 0) tcell.classList.add("HWordAnswerStart");
				else if (c === wordObject.string.length - 1) tcell.classList.add("HWordAnswerEnd");
				else tcell.classList.add("HWordAnswerMid");
			}
			else
			{
				let tcell = GetCell(wordObject.position.y + c, wordObject.position.x);
				if (c === 0) tcell.classList.add("VWordAnswerStart");
				else if (c === wordObject.string.length - 1) tcell.classList.add("VWordAnswerEnd");
				else tcell.classList.add("VWordAnswerMid");
			}
		}
	}
}

function SwitchCellState(tcell)
{
	tcell.clicked = !Boolean(tcell.clicked);

	if (tcell.clicked) 
		tcell.classList.add("checked")
	else
	{
		tcell.classList.remove("checked");
		if (tcell.classList.contains("checkedCorrect")) tcell.classList.remove("checkedCorrect");
	}
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

	document.getElementById("lblMistakes").innerText = pageSession.Mistakes;
}

function UpdateNextButtonVisibility()
{
	if (pageSession.WordFound.indexOf(false) > -1)
		document.getElementById("btnNext").style.display = "none";
	else
		document.getElementById("btnNext").style.display = "";
}

//#region Event Listeners

function tableCell_onClick(e)
{
	SwitchCellState(e.target);
} 

function btnNext_onClick(e)
{
	if (!gameSession.IsOver())
		GoNextPage();
	else
		EndGame();
}

function btnCheck_onClick(e)
{
	VerifyAnswer();
}

function btnShowAnswer_onClick(e)
{
	ShowAnswer();
}

function btnClear_onClick(e)
{
	ClearPage();
	DrawPage(gameSession.CurrentPage());
}

function btnStartGame_onClick(e)
{
	startPageForm.style.display = "none";
	gamePageForm.style.display = "";

	DrawPage(gameSession.NextPage());
}

window.onload = function(e)
{
	InitializeDocument();
};

//#endregion
