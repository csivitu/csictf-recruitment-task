import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import assert from 'assert';
import mongo from 'mongodb';

const { MongoClient } = mongo;

const url = process.env.MONGO_URL;
const dbName = 'csictf';

let collection;
MongoClient.connect(url, function(err, client) {
	assert.equal(null, err);
	console.log("Connected successfully to server");
	const db = client.db(dbName);

	collection = db.collection('registrations');
});

const app = express();
const PORT = 3000;

const checkYesNo = (data) => {
	return data.every((d) => ['y', 'n'].includes(d));
};

let limiter;
if (process.env.NODE_ENV !== 'production') {
	limiter = (req, res, next) => {next();}
} else {
	// Max attempts per hour
	limiter = rateLimit({
		windowMs: 1000 * 60 * 60,
		max: 20,
	});
}

app.use(bodyParser.json());

app.post('/', limiter, (req, res, next) => {
	let {
		token
	} = req.body;
	
	if (!token) {	
		return res.send('That doesn\'t seem right...');
	}
	
	try {
	// https://jwt.io
	const data = jwt.verify(token, 'P3RMmFVMGb');
	} catch (e) {
		console.log(e);
		return res.send('That doesn\'t seem right...');
	}

	// user's discord username
	const usernameRegex = /^\w+#\d{4}$/;
	const discordUsername = data.discordUsername.toString();

	if (!usernameRegex.test(discordUsername)) {
		return res.send('That doesn\'t seem right...');
	}
	
	// user's email id
	const email = data.email.toString();

	// is the user a student
	const isStudent = data.isStudent.toString();
	
	if (!checkYesNo([isStudent])) {
		return res.send('That doesn\'t seem right...');
	}

	// what are the user's favourite challenge categories in a CTF?
	const favCategories = data.favCategories.toString();

	// what is the user's experience in CTF's/cybersecurity with these categories?
	const experience = data.experience.toString();

	if (experience.length < 30 || experience.length > 500) {
		return res.send('That doesn\'t seem right...');	
	} 	
	
	collection.findOne({ discordUsername }, (err, user) => {
		if (err) {
			console.log(err);
			return res.send('There was an error');
		}
		if (user) {
			return res.send('Already registered...');
		}
		
		collection.insertOne({ 
			discordUsername,
			email,
			isStudent,
			favCategories,
			experience,
		}, (err, data) => {
			if (err) {
				console.log(err);
				return res.send('There was an error.');
			}

			return res.send(`Congrats ${discordUsername}! You have successfully applied for csictf. We'll be contacting you shortly for further shortlisting.`);
		});
	});
});

app.get('/', (req, res, next) => {
	res.send('We were too lazy to make the frontend, figure out how to apply...');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));

