'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const server = express();
const PORT = process.env.PORT;
const DB = process.env.DATABASE_URL;

// mongoose.connect('mongodb://localhost:27017/drink', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });

server.use(cors());
server.use(express.json());

const drinkSchema = new mongoose.Schema({
    strDrink: String,
    strDrinkThumb: String,
});

const drinkModel = mongoose.model('drink', drinkSchema);

// API proof of life
// http://localhost:3070/
server.get('/', (req, res) => {
    res.send('everything is working!')
});

server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

// get the data from Api link 
// http://localhost:3070/getData

server.get('/getData', getDataHandler)

function getDataHandler(req, res) {
    const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`
    axios.get(url).then(result => {
        const drinkData = result.data.drinks.map(item => {
            return new drink(item)
        })
        res.send(drinkData);

    })
}


// CRUD Routes
server.post('/favi', addToFAv)
server.get('/favi', getFav)
server.delete('/favi/:id', deleteFav)
server.put('/favi/:id', updateFav)

function addToFAv(req, res) {
    const { strDrink, strDrinkThumb } = req.body;
    const favData = new drinkModel({
        strDrink: strDrink,
        strDrinkThumb: strDrinkThumb
    })
    favData.save();
    res.send(favData)
}

function getFav(req, res) {
    drinkModel.find({}, (error, data) => {
        res.send(data)
    })

}


function deleteFav(req, res) {
    const id = req.params.id;
    drinkModel.deleteOne({ _id: id }, (error, data) => {
        drinkModel.find({}, (error, data) => {
            res.send(data)
        })
    })
}

function updateFav(req, res) {
    const id = req.params.id;
    const { strDrink, strDrinkThumb } = req.body;
    drinkModel.find({ _id: id }, (error, data) => {
        data[0].strDrink = strDrink;
        data[0].strDrinkThumb = strDrinkThumb;
        data[0].save() 
        .then(()=>{
            drinkModel.find({},(error,data)=>{
                res.send(data)
            })
        })

    })


}


class drink {
    constructor(data) {
        this.strDrink = data.strDrink,
            this.strDrinkThumb = data.strDrinkThumb;

    }
}