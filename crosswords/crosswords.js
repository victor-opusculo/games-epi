/* =======================================================================================================
 * Jogo de Palavras Cruzadas
 * Desenvolvido por Victor Opusculo para a Escola do Parlamento de Itapevi - Câmara Municipal de Itapevi
 * =======================================================================================================*/

var gameSession;
var tableElement;

var focusedInput;

var startForm, gameForm, endForm;

function InitializeDocument()
{
    startForm = document.getElementById("startForm");
    gameForm = document.getElementById("gameForm");
    endForm = document.getElementById("endForm");

    document.getElementById("btnStartGame").onclick = btnStartGame_onClick;
    document.getElementById("btnNext").onclick = btnNext_onClick
    document.getElementById("btnVerify").onclick = btnVerify_onClick;
    document.getElementById("btnClear").onclick = btnClear_onClick;
    document.getElementById("btnShowAnswers").onclick = btnShowAnswers;
    document.getElementById("btnShowChar").onclick = btnShowChar_onClick;
    SetNextButtonEnabled(false);

    document.body.onclick = documentBody_onClick;

    CommonScript.DownloadGameData("EPI-crosswords1.json", Game_onLoad);
}

function Game_onLoad(e)
{
    gameSession = e.gameSession;

    CS.SetElementVisibility(startForm, true);
}

function ClearPage()
{
    let tablePanel = document.getElementById("tablePanel");
    tablePanel.removeChild(tableElement);
    tableElement = undefined;
}

function DrawPage(pageObject)
{
    //Create table
    tableElement = document.createElement("table");
    
    var tableSize = CalculateTableSize(pageObject.words);

    for (let y = 0; y <= tableSize.y; y++ )
    {
        let tableRow = document.createElement("tr");
        for (let x = 0; x <= tableSize.x; x++)
        {
            tableRow.appendChild(document.createElement("td"));
        }
        tableElement.appendChild(tableRow);
    }
    document.getElementById("tablePanel").appendChild(tableElement);

    //Tips label
    var tipsV = "";
    var tipsH = "";
    
    //Fill table
    pageObject.words.forEach(function(word, wIndex) 
    {
        if (word.orient === "v")
        {
            tipsV += (wIndex + 1) + " - " + word.tip + "<br/>";

            let numberCell = GetCell(word.position.y, word.position.x + 1);
            numberCell.innerText = wIndex + 1;
            numberCell.className = "number";

            for (let c = 0; c < word.string.length; c++)
            {
                let cell = GetCell(word.position.y + c + 1, word.position.x + 1);
                if (cell.querySelector("input")) continue;

                let input = document.createElement("input");
                input.type = "text";
                input.maxLength = 1;
                input.size = 1;
                input.onfocus = txtCell_onFocus;
                input.setAttribute("data-char", word.string[c]);
                cell.appendChild(input);
            }
        }
        else
        {
            tipsH += (wIndex + 1) + " - " + word.tip + "<br/>";

            let numberCell = GetCell(word.position.y + 1, word.position.x);
            numberCell.innerText = wIndex + 1;
            numberCell.className = "number";

            for (let c = 0; c < word.string.length; c++)
            {
                let cell = GetCell(word.position.y + 1, word.position.x + c + 1);
                if (cell.querySelector("input")) continue;

                let input = document.createElement("input");
                input.type = "text";
                input.maxLength = 1;
                input.size = 1;
                input.onfocus = txtCell_onFocus;
                input.setAttribute("data-char", word.string[c]);
                cell.appendChild(input);
            }
        }
    });

    document.getElementById("lblWordTipsV").innerHTML = tipsV;
    document.getElementById("lblWordTipsH").innerHTML = tipsH;

}

function GetCell(y, x)
{
    return tableElement.childNodes[y].childNodes[x];
}

function CalculateTableSize(words) //returns {y: number, x: number} // param -> words: [] of { string: string , orient: string, position:{y: number, x: number}, tip: string }
{
    var maxY = -1;
    var maxX = -1;

    for (let i = 0; i < words.length; i++)
        (function(word)
        {
            if (word.orient === "v")
            {
                let wordFullYPosition = word.position.y + word.string.length;
                if (wordFullYPosition > maxY)
                    maxY = wordFullYPosition;
            }
            else
            {
                let wordFullXPosition = word.position.x + word.string.length;
                if (wordFullXPosition > maxX)
                    maxX = wordFullXPosition;
            }
        })(words[i]);

    return {y: maxY, x: maxX};
}

function SetNextButtonEnabled(state)
{
    document.getElementById("btnNext").disabled = !state;
}

function ShowAnswers()
{
    var inps = tableElement.querySelectorAll("input");

    for (let i = 0; i < inps.length; i++)
        inps[i].value = inps[i].getAttribute("data-char");
}

function ClearInputs()
{
    gameForm.reset();

    var inps = tableElement.querySelectorAll("input");
    for (let i = 0; i < inps.length; i++)
        inps[i].className = "";

    SetNextButtonEnabled(false);
}

function VerifyInputs() // boolean
{
    var scannedInputs = 0;
    var correctInputs = 0;

    var inps = tableElement.querySelectorAll("input");
    for (let i = 0; i < inps.length; i++)
        (function(item)
        {
            scannedInputs++;
            if (item.value.localeCompare(item.getAttribute("data-char"), undefined, { sensitivity: 'base' }) === 0)
            {
                correctInputs++
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

    return (scannedInputs === correctInputs);
}

//#region Event listeners

function btnStartGame_onClick(e)
{
    CS.SetElementVisibility(startForm, false);
    CS.SetElementVisibility(gameForm, true);

    DrawPage(gameSession.NextPage());
}

function txtCell_onFocus(e)
{
    this.select();
    focusedInput = this;
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

function btnClear_onClick(e)
{
    ClearInputs();
}

function btnVerify_onClick(e)
{
    SetNextButtonEnabled(VerifyInputs());
}

function btnShowAnswers(e)
{
    ShowAnswers();
}

function btnShowChar_onClick(e)
{
    if (focusedInput)
        focusedInput.value = focusedInput.getAttribute("data-char");
}

function documentBody_onClick(e)
{
    if (e.target.nodeName !== "INPUT")
        focusedInput = undefined;
}

//#endregion