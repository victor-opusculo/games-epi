			<form id="startForm" style="display: none;">
				<h1>Palavras Cruzadas</h1>
				<label id="startPageContent"></label>
				<div style="text-align: center;"><input type="button" id="btnStartGame" value="Iniciar"/></div>
			</form>
			<form id="gameForm" style="display: none;">
				<h1>Palavras Cruzadas</h1>
				<div id="panels">
					<div id="tipsPanel">
						<p><strong>Vertical:</strong></p>
						<label id="lblWordTipsV"></label>
						<p><strong>Horizontal:</strong></p>
						<label id="lblWordTipsH"></label>
					</div>
					<div id="tablePanel" style="text-align: center;">
						<!--DOM-->
					</div>
				</div>
				
				<div id="buttonsPanel" style="text-align: center;">
					<div style="float:left;">
						<input type="button" id="btnClear" value="Limpar Tudo" />
						<input type="button" id="btnShowAnswers" value="Ver Solução" />
						<input type="button" id="btnShowChar" value="Ver Letra" />
					</div>
					<div style="float:right;">
						<input type="button" id="btnVerify" value="Conferir" />
						<input type="button" id="btnNext" value="Prosseguir" disabled/>
					</div>
				</div>
			</form>
			
			<form id="endForm" style="display: none;">
				<h1>Jogo terminado!</h1>
				<label style="text-align: center;">Você completou o jogo de palavras cruzadas</label>
			</form>