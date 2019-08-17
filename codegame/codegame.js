/* =======================================================================================================
 * Jogo dos Códigos
 * Desenvolvido por Victor Opusculo para a Escola do Parlamento de Itapevi - Câmara Municipal de Itapevi
 * =======================================================================================================*/

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
	pagePanel = document.getElementById("pagePanel");

	startForm = document.getElementById("startForm");
	gameForm = document.getElementById("gameForm");
	endForm = document.getElementById("endForm");

	document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
	document.getElementById("btnClear").onclick = btnClear_onClick;
	document.getElementById("btnCheck").onclick = btnCheck_onClick;
	document.getElementById("btnShowAnswer").onclick = btnShowAnswer_onClick;
	document.getElementById("btnNext").onclick = btnNext_onClick;
	SetNextButtonEnabled(false);

	CommonScript.DownloadGameData("EPI-codegame.json", Game_onLoad);
}


function Game_onLoad(e)
{
	gameSession = e.gameSession;
	CS.SetElementVisibility(startForm, true);
}

function EndGame()
{
	ClearPage();
	CS.SetElementVisibility(gameForm, false);
	CS.SetElementVisibility(endForm, true);
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
			inputBox.onfocus = CharInput_onFocus;
			
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
				item.className = "correct";
			}
			else if(item.value.trim() === "")
			{
				item.className = "";
			}
			else
			{
				item.className = "incorrect";
			}
		})(inps[i]);

	return (scannedInputs === correctInputs);
		
}

function SetNextButtonEnabled(state)
{
	document.getElementById("btnNext").disabled = !state;
}

//#region Event listeners
function btnStartGame_onClick(e)
{
	DrawPage(gameSession.NextPage());
	CS.SetElementVisibility(startForm, false);
	CS.SetElementVisibility(gameForm, true);
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
	SetNextButtonEnabled(false);
}

function btnShowAnswer_onClick(e)
{
	ShowSolution();
}

function btnCheck_onClick(e)
{
	SetNextButtonEnabled(VerifyInputs())
}

function CharInput_onFocus(e)
{
	this.select();
}

//#endregion
