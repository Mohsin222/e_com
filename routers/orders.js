const {Order} = require('../models/orders');
const express = require('express');
const router = express.Router();
const {OrderItem}= require('../models/order_item');
const { Promise } = require('mongoose');
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user','name').sort({'dateordered':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

//find by id
router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id).populate('user','name')
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}});

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})


router.post('/',async(req,res)=>{
    const orderItemsIds=Promise.all( req.body.orderItems.map( async orderItem=>{
        let newOrderItem=new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product,
        })
        newOrderItem=await newOrderItem.save()
        
        return newOrderItem._id
    }))
const orderItemResolved =await orderItemsIds;
// console.log(orderItemResolved)

//for totla price
var totalPrice;

  totalPrice =await Promise.all(orderItemResolved.map(async(orderItemId)=>{
  const  orderItem = await OrderItem.findById(orderItemId).populate('product','price');
    const price = orderItem.product.price * orderItem.quantity;
    console.log(price)
     return  totalPrice;
}))

totalPrice = totalPrice.reduce((a,b) => a+b,0)


    let order =new Order({
        orderItems:orderItemResolved,
   //     quantity:orderItemResolved.quantity,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:req.body.price,
        user:req.body.user,
     //   dateordered:req.body.dateordered,

    })

 console.log(totalPrice)

try {
order = await order.save()
console.log(order)
    if(!order)
    return res.status(404).send('The order cannot be created')

} catch (error) {
    console.log(error)
}
  res.send(order)
})



//update 
router.put('/:id',async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
status:req.body.status
    },
    //for get new resposne data in post man
    {
        new:true
    }
    )
    if(!order)
    return res.status(404).send('The Order not updated')

    res.send(order)
})


//delete Order
router.delete('/:id',async(req,res)=>{
    Order.findByIdAndRemove(req.params.id).then( order =>{
        if(order){
            return res.status(200).json({success:true,message:'the Order is deleated'})
        }else{
            res.status(404).json({success:false,message:'Order not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
})

//for total sales
router.get('/get/totalSales',async(req,res)=>{
    const totalSales = await Order.aggregate([
        {$group :{_id:null,totalSales :{ $sum :'$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('The order sales can not be granted')
    }

    res.status(200).send({totalSales:totalSales})
})

//count product for statictics purpose
router.get(`/get/count`,async(req,res)=>{
//not working
try {
    const orderCount= await Order.countDocuments((count)=>count)
       
    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount:orderCount
 
    })
} catch (error) {
    console.log(error)
}

})




//user own orders
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user:req.params.userid})    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}}).sort({'dateordered':-1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})




module.exports =router;