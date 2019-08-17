			<form id="startForm" style="display: none;">
				<h1>Acerte as palavras</h1>
				<div style="text-align: center;">
					<input type="button" id="btnStartGame" value="Iniciar"/>
				</div>
			</form>
			<form id="gameForm" style="display: none;">
				<h1>Acerte as palavras</h1>
				<div id="pagePanel">
					<!--DOM-->
				</div>
				<div id="buttonsPanel" style="text-align: center;">
					<input type="button" id="btnShowAnswer" value="Solução"/>
					<input type="button" id="btnVerify" value="Conferir"/>
					<input type="button" id="btnNext" value="Prosseguir" disabled/>
				</div>
				<label id="lblPageResult" style="text-align:center;"></label>
			</form>
			<form id="endForm" style="display: none;">
				<h1>Acerte as palavras</h1>
				<label style="text-align: center;">Você completou o jogo.</label>
			</form>