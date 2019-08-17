
			<form id="startForm" style="display: none;">
				<h1>Reciclagem</h1>
				<div style="text-align: center;">
					<input type="button" id="btnStartGame" value="Iniciar"/>
				</div>
			</form>
			<form id="gameForm" style="display: none;">
				<h1>Reciclagem</h1>
				<label style="text-align: center;">Arraste cada item abaixo para a sua lixeira correspondente:</label>
				<div id="canvasPanel" style="text-align: center;">
					<canvas id="canvas" width="700" height="700">
						Este jogo requer um navegador com suporte a HTML 5.
					</canvas>
				</div>
				<div id="buttonsPanel" style="text-align: center;">
					<input type="button" id="btnNext" value="Prosseguir" disabled/>
				</div>
				
			</form>
			<form id="endForm" style="display: none;">
				<h1>Reciclagem</h1>
				<label style="text-align: center;">Você completou o Jogo da Reciclagem.</label>
			</form>