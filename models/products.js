const mongoose  = require('mongoose')
//schema
const productSchema= mongoose.Schema({
    name:{
     type:String,
     required:true,
    },
    description:{
        type:String,
        required:true
    },
    richDescription:{
        type:String,
        default:''
    },
    image:{
        type:String,
        default:''
    },
    images:[{
        type:String
    }],
    brand:{
        type:String,
        default:''
    },
    price:{
        type:Number,
        default:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
       // ref:'Ctegory',
       ref:'Category',
        required:true,
    },
   
    countInStock:{
        required:true,
        type:Number,
        min:0,
        max:255
    },
    rating:{
        type:Number,
        default:0
    },
    numReviews:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false,
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
})
//for change  _id  to id
// productSchema.virtual('id').get(function(){
//     return this._id.toHexString()
// })

// productSchema.virtual('id').get(function(){
//     return this.id.toHexString()
// })


// productSchema.set('toJSON',{
//     virtuals:true
// })

exports.Product = mongoose.model('Product',productSchema)