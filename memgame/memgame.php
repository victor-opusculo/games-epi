			<form id="startForm" style="display: none;">
				<h1>Jogo da Memória</h1>
				<label id="startPageContent"></label>
				<div style="text-align: center;"><input type="button" id="btnStartGame" value="Iniciar"/></div>
			</form>
			<form id="gameForm" style="display: none;">
				<h1>Jogo da Memória</h1>
				<div id="pieceBoard" style="text-align: center;">
					<!--DOM-->
				</div>
				<div id="buttonsPanel" style="text-align: center;">
					<input type="button" id="btnRestart" value="Reiniciar Jogo"/>
					<input type="button" id="btnNext" value="Prosseguir" disabled/>
				</div>
			</form>
			
			<form id="endForm" style="display: none;">
				<h1>Jogo terminado!</h1>
				<label style="text-align: center;">Você completou o jogo da memória</label>
			</form>