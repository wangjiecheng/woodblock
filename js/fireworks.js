window.requestAnimFrame = (function() {
				return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
					function(callback) {
						window.setTimeout(callback, 1000 / 60)
					}
			})();
			(function() {
				var pageData = {
						canvas: document.getElementById('canvas'),
						ctx: this.canvas.getContext('2d'),
						canvasParent: document.getElementById('fireworks'),
						fireworks: [],
						particles: [],
						hue: 336,
						timerTotal: 35,
						timerTick: 0
					},
					stochastic = function(min, max) {
						return Math.random() * (max - min) + min
					},
					calculateDistance = function(p1x, p1y, p2x, p2y) {
						var xDistance = p1x - p2x,
							yDistance = p1y - p2y;
						return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
					},
					wm = {
						cw: pageData.canvasParent.offsetWidth,
						ch: pageData.canvasParent.offsetHeight,
						Firework: function(sx, sy, tx, ty) {
							this.x = sx;
							this.y = sy;
							this.sx = sx;
							this.sy = sy;
							this.tx = tx;
							this.ty = ty;
							this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
							this.distanceTraveled = 0;
							this.coordinates = [];
							this.coordinateCount = 2;
							while(this.coordinateCount--) {
								this.coordinates.push([this.x, this.y])
							}
							this.angle = Math.atan2(ty - sy, tx - sx);
							this.speed = 2;
							this.acceleration = 1.05;
							this.brightness = stochastic(50, 70);
							this.update = function(index) {
								this.coordinates.pop();
								this.coordinates.unshift([this.x, this.y]);
								this.speed *= this.acceleration;
								var vx = Math.cos(this.angle) * this.speed,
									vy = Math.sin(this.angle) * this.speed;
								this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
								if(this.distanceTraveled >= this.distanceToTarget) {
									wm.createParticles(this.tx, this.ty);
									pageData.fireworks.splice(index, 1)
								} else {
									this.x += vx;
									this.y += vy
								}
							}
							this.draw = function() {
								pageData.ctx.beginPath();
								pageData.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
								pageData.ctx.lineTo(this.x, this.y);
								pageData.ctx.strokeStyle = 'hsl(' + pageData.hue + ', 47%, ' + this.brightness + '%)';
								pageData.ctx.stroke();
								pageData.ctx.beginPath()
							}
						},
						Particle: function(x, y) {
							this.x = x;
							this.y = y;
							this.coordinates = [];
							this.coordinateCount = 5;
							while(this.coordinateCount--) {
								this.coordinates.push([this.x, this.y])
							}
							this.angle = stochastic(0, Math.PI * 2);
							this.speed = stochastic(1, 14);
							this.friction = 0.95;
							this.gravity = .8;
							this.hue = stochastic(pageData.hue - 10, pageData.hue + 10);
							this.brightness = stochastic(50, 80);
							this.alpha = 1;
							this.decay = stochastic(0.01, 0.025);
							this.update = function(index) {
								this.coordinates.pop();
								this.coordinates.unshift([this.x, this.y]);
								this.speed *= this.friction;
								this.x += Math.cos(this.angle) * this.speed;
								this.y += Math.sin(this.angle) * this.speed + this.gravity;
								this.alpha -= this.decay;
								if(this.alpha <= this.decay) {
									pageData.particles.splice(index, 1)
								}
							}
							this.draw = function() {
								pageData.ctx.beginPath();
								pageData.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
								pageData.ctx.lineTo(this.x, this.y);
								pageData.ctx.strokeStyle = 'hsla(' + this.hue + ', 47%, ' + this.brightness + '%, ' + this.alpha + ')';
								pageData.ctx.stroke()
							}
						},
						createParticles: function(x, y) {
							var particleCount = 800;
							while(particleCount--) {
								pageData.particles.push(new wm.Particle(x, y))
							}
						},
						init: function() {
							requestAnimFrame(wm.init);
							pageData.ctx.globalCompositeOperation = 'destination-out';
							pageData.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
							pageData.ctx.fillRect(0, 0, wm.cw, wm.ch);
							pageData.ctx.globalCompositeOperation = 'lighter';
							var i = pageData.fireworks.length;
							while(i--) {
								pageData.fireworks[i].draw();
								pageData.fireworks[i].update(i)
							}
							var i = pageData.particles.length;
							while(i--) {
								pageData.particles[i].draw();
								pageData.particles[i].update(i)
							}
							if(pageData.timerTick >= pageData.timerTotal) {
								pageData.fireworks.push(new wm.Firework(wm.cw / 2, wm.ch, stochastic(wm.cw / 8, wm.cw / 8 * 7), stochastic(wm.ch / 4, wm.ch /6)));
								pageData.hue = stochastic(240, 360);
								pageData.timerTick = 0
							} else {
								pageData.timerTick++
							}
						}
					}
				pageData.canvas.width = wm.cw;
				pageData.canvas.height = wm.ch;
				wm.init()
			}())