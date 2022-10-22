const headers = {
	'Access-Control-Allow-Origin': '*'
}

module.exports = {
	async exists(id) {
		return new Promise((resolve, reject) => {
            fetch(`https://nhentai.net/g/${id}/`, {headers})
                .then(res => resolve(true))
                .catch(err => console.log(err) && resolve(false));
        });
	}
}
