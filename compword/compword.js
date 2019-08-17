
function InitializeDocument()
{
    document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
    document.getElementById("btnVerify").onclick = btnVerify_onClick;
    document.getElementById("btnNext").onclick = btnNext_onClick;
    document.getElementById("btnShowAnswer").onclick = btnShowAnswer_onClick;

    startForm = document.getElementById("startForm");
    gameForm = document.getElementById("gameForm");
    endForm = document.getElementById("endForm");
    pagePanel = document.getElementById("pagePanel");

    SetNextButtonEnabled(false);

    CommonScript.DownloadGameData("compword/EPI-compword1.json", Game_onLoad);
}

var gameSession;
var pagePanel;
var startForm, gameForm, endForm;

function StartGame()
{
    DrawPage(gameSession.NextPage());

    CS.SetElementVisibility(startForm, false);
    CS.SetElementVisibility(gameForm, true);
}

function ClearPage()
{
    while(pagePanel.firstChild) pagePanel.removeChild(pagePanel.firstChild);
    SetNextButtonEnabled(false);
	SetPageResultLabel(null);
}

function DrawPage(pageObject)
{
    pageObject.words.forEach( function(wordObject)
    {
        let table = document.createElement("table");
        let tableRow = document.createElement("tr");

        for (let c = 0; c < wordObject.string.length; c++)
        {
            const char = wordObject.string[c];
            let tableCell = document.createElement("td");

            if (char === ' ')
                tableCell.className = "blank";
            else if (IsFixedChar(wordObject.fixedChars, c))
                tableCell.innerText = char;
            else
            {
                let input = document.createElement("input");
                input.type = "text";
                input.size = input.maxLength = 1;
                input.setAttribute("data-char", char);
                input.onfocus = Input_onFocus;
                tableCell.appendChild(input);
            }
            tableRow.appendChild(tableCell)
        }

        table.appendChild(tableRow);
        pagePanel.appendChild(table);

        pagePanel.appendChild(document.createElement("br"));

        //draw tips:
        for (let t = 0; t < wordObject.tips.length; t++)
        {
            let lbl = document.createElement("label");
            lbl.innerText = "Dica " + (t+1) + " - " + wordObject.tips[t];

            pagePanel.appendChild(lbl);
        }
    });
}

function EndGame()
{
    ClearPage();
    CS.SetElementVisibility(gameForm, false);
    CS.SetElementVisibility(endForm, true);
}

function VerifyInputs() // boolean
{
    var inps = pagePanel.querySelectorAll("input");
    var correctInputs = 0;

    for (let i = 0; i < inps.length; i++)
        (function(item)
        {
            if (item.value.localeCompare(item.getAttribute("data-char"), undefined, { sensitivity: 'base' }) === 0)
            {
                correctInputs++;
                item.className = "correct";
            }
            else if (item.value.trim() === "")
            {
                item.className = "";
            }
            else
            {
                item.className = "incorrect";
            }
        })(inps[i]);

    return (correctInputs === inps.length);
}

function ShowAnswer()
{
    var inps = pagePanel.querySelectorAll("input");
    for (let i = 0; i < inps.length; i++)
        (function(item)
        {
            item.value = item.getAttribute("data-char");
        })(inps[i]);
}

function IsFixedChar(fixedCharList, charIndex)
{
    if (!fixedCharList) return false;

    for (let i = 0; i < fixedCharList.length; i++)
        if (fixedCharList[i] === charIndex) return true;

    return false;
}

//boolNullableState: boolean?
function SetPageResultLabel(boolNullableState)
{
	const lbl = document.getElementById("lblPageResult");
	if (boolNullableState === null || boolNullableState === undefined)
		lbl.innerText = "";
	else
		lbl.innerText = boolNullableState ? "Parabéns, você acertou!" : "Você errou. Tente novamente.";
	
}

function SetNextButtonEnabled(state)
{
    document.getElementById("btnNext").disabled = !state; 
}

//#region Event listeners

function Game_onLoad(e)
{
    gameSession = e.gameSession;

    CS.SetElementVisibility(startForm, true);
}

function btnVerify_onClick(e)
{
	var result = VerifyInputs();
    SetNextButtonEnabled(result);
	SetPageResultLabel(result);
}

function btnStartGame_onClick(e)
{
    StartGame();
}

function btnShowAnswer_onClick(e)
{
    ShowAnswer();
}

function btnNext_onClick(e)
{
    ClearPage();

    if (!gameSession.IsOver())
        DrawPage(gameSession.NextPage());
    else
        EndGame();
}

function Input_onFocus(e)
{
    this.select();
}

//#endregion