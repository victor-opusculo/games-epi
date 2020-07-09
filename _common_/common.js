const CommonScript = function()
{
    const Game = function()
    {
        function Game(gameDataObject)
        {
            this._gameData = gameDataObject; // expects object { settings: {}, pages: [ ] }
            this._currentPage = -1;
            this._pages = gameDataObject.pages;

            this.Settings = gameDataObject.settings;
        }

        Game.prototype.CurrentPage = function () // { "board":[], "words":[] }
        {
            return this._pages[this._currentPage];
        };

        Game.prototype.NextPage = function () // { "board":[], "words":[] }
        {
            this._currentPage++;
            return this.CurrentPage();
        };

        Game.prototype.IsOver = function () // boolean
        {
            return this._currentPage === (this._pages.length - 1);
        };

        return Game;
    }();
    
    var onGameDataLoad = undefined; //Function

    function DownloadGameData(url, onGameDataLoadFunc)
    {
        onGameDataLoad = typeof (onGameDataLoadFunc) === 'undefined' ? onGameDataLoad : onGameDataLoadFunc;

        var xhttp = new XMLHttpRequest();

        xhttp.callback = ReadJSON;
        xhttp.onload = function () { this.callback.apply(this, this.arguments); };
        xhttp.onerror = function () { console.error(this.statusText); };
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
        const gSession = new Game(gameDataObject);
        SetElementVisibility(document.getElementById("loadingIcon"), false);

        if (typeof onGameDataLoad === 'function') onGameDataLoad({ gameSession: gSession });
        else console.warn("Evento onGameDataLoad não tem função manipuladora definida!");
    }

    function SetElementVisibility(objReference, state)
    {
        objReference.style.display = state ? "" : "none";
    }

    return {
        Game: Game,
        onGameDataLoad: onGameDataLoad,
        DownloadGameData: DownloadGameData,
        SetElementVisibility: SetElementVisibility
    };

}();

const CS = CommonScript;

window.onload = function(e)
{
    if (typeof InitializeDocument === 'function') InitializeDocument();
    else throw new Error("Função InitializeDocument() não presente!");

    document.oncontextmenu = document.body.oncontextmenu = function() {return false;}
};