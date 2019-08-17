<!--Desenvolvido por Victor Opusculo-->
<?php require("gameloader.php"); ?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<script src="_common_/common.js"></script>
		<link type="text/css" rel="stylesheet" href="_common_/common.css"/>
		
		<script src="<?php echo $game["script"]?>"></script>
		<link type="text/css" rel="stylesheet" href="<?php echo $game["style"]?>"/>
		<title><?php echo $game["title"]?></title>
		
		<script>
			if (!window.location.search) window.location.href = "index.php";
		</script>
	</head>
	<body>
		<main>
			<div id="loadingIcon" style="text-align: center;">
				<img src="_common_/pics/loading.gif" alt="Carregando..."/>
			</div>
			<?php require($game["HTML"])?>
		</main>

		<div id="Logos">
			<img src="_common_/pics/EPI.jpg" alt="Escola do Parlamento de Itapevi" height="130" style="margin-right: 50px;"/>
			<img src="_common_/pics/CMI.jpg" alt="Câmara Municipal de Itapevi" height="80"/>
		</div>

		<footer>
				
		</footer>

	</body>
</html>