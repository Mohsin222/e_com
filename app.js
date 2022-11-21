const express = require('express')
const app= express()
const port =process.env.port || 8000;
const morgan =require('morgan')
const mongoose=require('mongoose')
const cors= require('cors')

require('dotenv/config')

//core parts
app.use(cors())
app.options('*',cors)


const api = process.env.API_URL
// Routes
const productRouter= require('./routers/products')
 const categoriesRouter= require('./routers/categories')
const ordersRouter= require('./routers/orders')
 const usersRouter= require('./routers/users');
const authJwt = require('./helper/jwt');
const errorHandler= require('./helper/error_handler')


//middle ware
app.use(express.json())
app.use(morgan('tiny'))
// app.use(authJwt())
// app.use(errorHandler)

app.use('/public/uploads/',express.static(__dirname + '/public/uploads/'))

app.use(`${api}/products`,productRouter)
app.use(`${api}/categories`,categoriesRouter)
app.use(`${api}/orders`,ordersRouter)
app.use(`${api}/users`,usersRouter)





mongoose.connect('mongodb+srv://mohsin:123@cluster0.xgm3y.mongodb.net/shop_database')
.then( ()=>{
    console.log('Connection is ready')
})
.catch( (err)=>{
    console.log(err)
})

app.listen ( port, ()=>{

    console.log(`Server is running at ${port}`)
})