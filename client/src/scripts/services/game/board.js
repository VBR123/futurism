angular.module('futurism')
	.factory('board', function(_, players) {
		'use strict';

		var self = this;
		self.minBoard;
		self.areas = {};


		/**
		 * Fully set the board state
		 * @param {Object} minBoard - compact board data
		 */
		self.fullUpdate = function(minBoard) {
			self.minBoard = minBoard;
			self.inflateStatus(self.minBoard);
		};


		/**
		 * Update specific targets
		 * @param {Object} boardDiff - changes to the board
		 */
		self.partialUpdate = function(boardDiff) {
			_.merge(self.minBoard, boardDiff);
			self.inflateStatus(self.minBoard);
		};


		/**
		 * Apply a compressed game status from the server
		 * @param {Object} minBoard
		 */
		self.inflateStatus = function(minBoard) {
			self.clear();
			self.areas = {};

			_.each(minBoard.areas, function(minArea, playerId) {
				var area = {};
				var targets = [];
				area.playerId = Number(playerId);
				area.player = players.idToPlayer(playerId);
				area.team = area.player.team;
				area.targets = targets;
				self.areas[playerId] = area;

				_.each(minArea.targets, function(card, xy) {
					var xyArr = xy.split('-');
					var x = Number(xyArr[0]);
					var y = Number(xyArr[1]);
					if(!targets[x]) {
						targets[x] = [];
					}

					area.targets[x][y] = {
						column: x,
						row: y,
						playerId: area.playerId,
						player: area.player,
						card: card
					};
				});
			});

		};


		/**
		 * Find a target containing specified cid
		 * @param {Number} cid
		 */
		self.cidToTarget = function(cid) {
			var matchTarget = null;
			var targets = self.allTargets();
			_.each(targets, function(target) {
				if(target.card && target.card.cid === cid) {
					matchTarget = target;
				}
			});
			return matchTarget;
		};


		/**
		 * Create a 1d array of all targets
		 * @returns {Array} targets
		 */
		self.allTargets = function() {
			var all = [];
			_.each(self.areas, function(area) {
				_.each(area.targets, function(column) {
					_.each(column, function(target) {
						all.push(target);
					});
				});
			});
			return all;
		};


		/**
		 * reset the board to a pristine state
		 */
		self.clear = function() {
			self.areas = [];
		};


		/**
		 *
		 */
		return self;
	});