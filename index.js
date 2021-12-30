const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gxrbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        console.log('db connected');

        const database = client.db("bikeWala");
        const bikesCollection = database.collection('bikes');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        //GET all bikes API
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        });
        //GET single bike API
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const single = await bikesCollection.findOne(query);
            res.json(single);
        })

        // //POST bikes API
        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            console.log('hit the post api', bike);

            const result = await bikesCollection.insertOne(bike);
            console.log(result);
            res.json(result);
        });

        //delete single bike/product
        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            console.log('deleting product with id', result);
            res.json(result);
        });


        //GET all orders API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //GET single order API
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific order', id);
            const query = { _id: ObjectId(id) };
            const singleOrder = await ordersCollection.findOne(query);
            res.json(singleOrder);
        });
        // POST ORDERS API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the order post api', order);

            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });
        //delete single order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting order with id', result);
            res.json(result);
        });
        //update ship/status single order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('updating order', id)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                },
            };
            const result = await ordersCollection.updateOne(query, updateDoc, options);
            console.log('approving to ship the order', result);

            res.json(result);
        });

        //////////////  ///// review part  ////// ///////////////////////

        //GET all reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // POST reviews API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the review post api', review);

            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        //////////////  ///// User part  ////// ///////////////////////

        //post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('hit the user post api', user);

            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        //update user as admin
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log('updating user role', email)
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: "Admin"
                },
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            console.log('approving role admin', result);

            res.json(result);
        });

        // //GET single user API
        // app.get('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     console.log('getting specific service', email);
        //     const query = { email: email };
        //     const single = await usersCollection.findOne(query);
        //     res.json(single);
        // })


        //check if admin

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log('getting specific service', email);
            const query = { email: email };
            const single = await usersCollection.findOne(query);

            let isAdmin = false;
            if (single?.role === 'Admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        //GET all users API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });




    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Bike Wala server is running!')
});

app.listen(port, () => {
    console.log('Bike Wala server is running on port', port);
})