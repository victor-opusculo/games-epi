<!--Desenvolvido por Victor Opusculo-->
			<form id="startPage" style="display: none;">
				<h1>Caça-palavras</h1>
				<label id="startPageContent"></label>
				<div style="text-align: center;"><input type="button" id="btnStartGame" value="Iniciar"/></div>
			</form>
			<form id="gamePage" style="display: none;">
				<h1>Caça-palavras</h1>
				<label id="pageText"></label>
				
				<div id="panels">
					<div id="tablePanel">
						<canvas id="tableCanvas"></canvas>
					</div>
					<div id="buttonsPanel" >
						<input type="button" id="btnShowAnswer" value="Solução"/>
						<input type="button" id="btnNext" value="Prosseguir" disabled/>
						<br/><br/>
						Palavras encontradas:<br/>
						<label id="lblFoundWords"></label>
					</div>
				</div>
				
			</form>
			
			<form id="endPage" style="display: none;">
				<h1>Jogo terminado!</h1>
				<label style="text-align: center;">Você completou o caça-palavras.</label>
			</form>