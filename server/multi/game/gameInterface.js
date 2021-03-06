(function() {
	'use strict';

	var gameLookup = require('./gameLookup');


	module.exports = {


		/**
		 * Allow socket to interface with game.js
		 * @param socket
		 */
		initSocket: function(socket) {

			/**
			 * Route an event to a player in a game
			 * @param eventName
			 * @param callback
			 */
			socket.onPlayer = function(eventName, callback) {
				socket.on(eventName, function(data) {

					// get the _id
					socket.get('_id', function(err, _id) {
						if(err) {
							return socket.emitError(err);
						}
						if(!_id) {
							return socket.emitError('No _id is registered to this connection.');
						}

						// get the game
						var game = gameLookup.idToValue(data.gameId);
						if(!game) {
							return socket.emitError('game "'+data.gameId+'" was not found.');
						}

						// get the player in that game
						var player = game.idToPlayer(_id);
						if(!player) {
							return socket.emitError('game "'+data.gameId+'" does not contain user "'+_id+'".');
						}

						//everything worked
						var response = callback(data, game, player);
						if(!response) {
							return null;
						}

						//return the response to the socket
						return socket.emit(eventName, response);
					});
				});
			};


			/**
			 * Send in a deck selection
			 */
			socket.onPlayer('selectDeck', function(data, game, player) {
				game.loadup.selectDeck(player, data.deckId, function(err) {
					if(err) {
						socket.emitError(err);
					}
					socket.emit('selectDeckResult', {result: 'success'});
				});
			});


			/**
			 * Send in a card action
			 */
			socket.onPlayer('doAction', function(data, game, player) {
				return game.doAction(player, data.actionId, data.targets);
			});


			/**
			 * Send in a voluntary turn end
			 */
			socket.onPlayer('endTurn', function(data, game, player) {
				return game.endTurn(player);
			});


			/**
			 * Send in a future
			 */
			socket.onPlayer('alterFuture', function(data, game, player) {
				return game.alterFuture(player, data.futureId);
			});


			/**
			 * Request a list of cards in your hand
			 */
			socket.onPlayer('hand', function(data, game, player) {
				return player.hand;
			});


			/**
			 * Forfeit a match
			 */
			socket.onPlayer('forfeit', function(data, game, player) {
				return game.forfeit(player);
			});


			/**
			 * Request an overview of the game
			 */
			socket.on('gameStatus', function(data) {
				var game = gameLookup.idToValue(data.gameId);
				if(!game) {
					return socket.emitError('game "'+data.gameId+'" not found.');
				}
				return socket.emit('gameStatus', game.getStatus());
			});
		}
	};

}());