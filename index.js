const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

module.exports = app;

app.use(cors())
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.qmhrwse.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const usersCollection = client.db('GadgetGrid').collection('Users')
const categoriesCollection = client.db('GadgetGrid').collection('categories')

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // add new users
        app.post('/users', async (req, res) => {
            const user = req.body
            const existingUser = await usersCollection.findOne(user)
            if (existingUser) {
                res.send({ exist: true, message: 'user already exist' })
            }
            else {
                const result = await usersCollection.insertOne(user)
                res.send(result)
            }
        })

        app.get('/categories', async (req, res) => {
            const result = await categoriesCollection.find().toArray()
            res.send(result)
        })


        // add category 
        app.post('/addCategory', async (req, res) => {
            const category = req.body
            console.log(category);
            const existingCategory = await categoriesCollection.findOne({ name: category.name })
            if (existingCategory) {
                res.send({ exist: true, message: 'category already exist' })
            }
            else {
                const result = await categoriesCollection.insertOne(category)
                res.send(result)
            }
        })

        // add sub-category
        app.post('/add-subCategory', async (req, res) => {
            const data = req.body
            const category = data.category
            const subCategory = data.subCategoryData
            const result = await categoriesCollection.updateOne(
                { name: category },
                { $addToSet: { subCategories: subCategory } })
            res.send(result)
        })







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})