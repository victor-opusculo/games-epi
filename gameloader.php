<?php

$gamesDeclarations =
[
	1 => "wordhunt/declaration.json",
	2 => "recycling/declaration.json",
	3 => "memgame/declaration.json",
	4 => "crosswords/declaration.json",
	5 => "compword/declaration.json",
	6 => "codegame/declaration.json",
	7 => "trafficsigns/declaration.json"
];

function findGame($gameId, $gameList)
{
	$idToFind = $gameId;
	if ($idToFind > sizeof($gameList) || $idToFind < 1) 
	{
		$idToFind = 1;
	}

	$jsonString = file_get_contents($gameList[$idToFind]);
	$selectedGameDeclaration = json_decode($jsonString, true);
	
	return $selectedGameDeclaration;
}

if ($_GET["id"] !== null)
{
	$game = findGame($_GET["id"], $gamesDeclarations);
}

?>