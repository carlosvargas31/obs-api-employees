
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
	try {
		const mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();
		await mongoose.connect(uri);
		console.log('MongoDB (in-memory) connected');
	} catch (err) {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	}
};

connectDB();
