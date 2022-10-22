'use strict';
module.exports ={
	ms: (ms) => {
	if (typeof ms !== 'number') throw new TypeError('Expected a number');
	const rtz = ms > 0 ? Math.floor : Math.ceil;
	return {
		days: rtz(ms / 86400000),
		hours: rtz(ms / 3600000) % 24,
		minutes: rtz(ms / 60000) % 60,
		seconds: rtz(ms / 1000) % 60,
		miliseconds: rtz(ms) % 1000
	};
    },
	plur: (array, n, insertNumber = true) => {
    n = +n;
    const word = array[n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
    return insertNumber ? `${n} ${word}` : word;
	},
	ruMs: time => {
	const self = require('./ms.js')

	const obj = self.ms(time);

	const data = [
	obj.days !== 0 ? `${self.plur(['день', 'дня', 'дней'], obj.days)} ` : '',
	obj.hours !== 0 ? `${self.plur(['час', 'часа', 'часов'], obj.hours)} ` : '',
	obj.minutes !== 0 ? `${self.plur(['минута', 'минуты', 'минут'], obj.minutes)} ` : '',
	obj.seconds !== 0 ? `${self.plur(['секунда', 'секунды', 'секунд'], obj.seconds)}` : ''
	]
	
	return data.join('');
	}
};
