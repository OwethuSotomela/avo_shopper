const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash')
const avo = require('./avo-shopper');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

const connectionString = process.env.DATABASE_URL || 'postgresql://avos:avos123@localhost:5432/avo_shopper';

const pool = new Pool({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false
	}
});

const avoDeals = avo(pool);
console.log(avoDeals);

app.get('/', async function (req, res, next) {

	try {
		// console.log(await avoDeals.topFiveDeals())
		res.render('index', {
			bestDeals: await avoDeals.topFiveDeals()
		})
	} catch (error) {
		next(error)
	}
});

app.get('/dealsForShop', async function (req, res, next) {
	try {
		res.render('dealforshop', {
			shopName: req.params,
			// name: await avoDeals.dealsForShop(req.params)
		})
	} catch (error) {
		next(error)
	}
});

// app.get('/dealsForShop/:id/:name', async function (req, res, next) {
// 	try {
// 		res.render('dealforshop', {
// 			shopName: req.params.name,
// 			name: await avoDeals.dealsForShop(req.params.id)
// 			// shopDeals: await avoDeals.dealsForShop(req.params.id)
// 		})
// 	} catch (error) {
// 		next(error)
// 	}
// });

app.get('/createDeal', async function (req, res) {
	res.render('createdeal', {
		shopName: await avoDeals.createDeal()
	})
});

app.post('/createDeal', async function (req, res, next) {
	try {
		let id = req.body.id;
		let qty = req.body.qty;
		let price = req.body.price;
		console.log(id, qty, price)
		res.render('createdeal', {
			create: await avoDeals.createDeal(id.rows[0].id, qty, price)
		})
	} catch (error) {
		next(error)
	}
});

app.post('/createShop', async function (req, res) {
	console.log(await avoDeals.listShops())

	res.render('index', {
		createshop: await avoDeals.createShop(),
		shopList: await avoDeals.listShops()
	})
});

app.post('/listShops', async function (req, res) {
	res.render('shoplist', {
		shopList: await avoDeals.listShops()
	})
});

app.post('/recommendDeals', async function (req, res) {
	res.render('index', {
		recomment: await avoDeals.recommendDeals()
	})
});

app.post('/back', async function(req, res){
	res.redirect('/')
});

app.post('/home', async function(req, res){
	res.redirect('/')
})

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function () {
	console.log(`AvoApp started on port ${PORT}`)
});



