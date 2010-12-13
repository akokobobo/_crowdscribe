Number.prototype.minutes = Number.prototype.minute = function () {
	return this.seconds() * 60;
}

Number.prototype.seconds = Number.prototype.second = function () {
	return this * 1000;
}
