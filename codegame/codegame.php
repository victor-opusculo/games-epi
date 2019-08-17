			<form id="startForm" style="display: none;">
				<h1>Jogo dos Códigos</h1>
				<div style="text-align: center;">
					<input type="button" id="btnStartGame" value="Iniciar"/>
				</div>
			</form>
			<form id="gameForm" style="display: none;">
				<h1>Jogo dos Códigos</h1>
				<label>Para descobrir as respostas, coloque a primeira letra de cada imagem no quadradinho correspondente:</label>
				<div id="pagePanel">
					<!--DOM-->
				</div>
				<div id="buttonsPanel">
					<input type="button" id="btnClear" value="Limpar"/>
					<input type="button" id="btnShowAnswer" value="Solução"/>
					<input type="button" id="btnCheck" value="Conferir"/>
					<input type="button" id="btnNext" value="Prosseguir" disabled/>
				</div>
				
			</form>
			<form id="endForm" style="display: none;">
				<h1>Jogo dos Códigos</h1>
				<label style="text-align: center;">Você completou o Jogo dos Códigos.</label>
			</form>