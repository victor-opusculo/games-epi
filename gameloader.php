<?php

$games =
[
	1 => ["script" => "wordhunt/wordhunt.js", "style" => "wordhunt/wordhunt.css", "title" => "Caça-palavras", "HTML" => "wordhunt/wordhunt.php"],
	2 => ["script" => "recycling/recycling.js", "style" => "recycling/recycling.css", "title" => "Jogo da Reciclagem", "HTML" => "recycling/recycling.php"],
	3 => ["script" => "memgame/memgame.js", "style" => "memgame/memgame.css", "title" => "Jogo da Memória", "HTML" => "memgame/memgame.php"],
	4 => ["script" => "crosswords/crosswords.js", "style" => "crosswords/crosswords.css", "title" => "Palavras Cruzadas", "HTML" => "crosswords/crosswords.php"],
	5 => ["script" => "compword/compword.js", "style" => "compword/compword.css", "title" => "Acerte as palavras", "HTML" => "compword/compword.php"],
	6 => ["script" => "codegame/codegame.js", "style" => "codegame/codegame.css", "title" => "Jogo dos Códigos", "HTML" => "codegame/codegame.php"]
];

function findGame($gameId, $gameList)
{
	$idToFind = $gameId;
	if ($idToFind > sizeof($gameList) || $idToFind < 1) 
	{
		$idToFind = 1;
	}

	return $gameList[$idToFind];
}

if ($_GET["id"] !== null)
{
	$game = findGame($_GET["id"], $games);
}

?>