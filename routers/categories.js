const {Category} = require('../models/categories');
const express = require('express');
const router = express.Router();

//get all categoris
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})
//get category by id
router.get(`/:id`, async (req, res) =>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({success: false,message:'The category with given ID is not found'})
    } 
    res.status(200).send(category);
})

//add category
router.post('/',async(req,res)=>{
    let category =new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })

    category = await category.save()

    if(!category)
    return res.status(404).send('The category cannot be created')

    res.send(category)
})

//update
router.put('/:id',async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color,
    },
    //for get new resposne data in post man
    {
        new:true
    }
    )
    if(!category)
    return res.status(404).send('The category not updated')

    res.send(category)
})

//delete category
router.delete('/:id',async(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then( category =>{
        if(category){
            return res.status(200).json({success:true,message:'the Category is deleated'})
        }else{
            res.status(404).json({success:false,message:'Category not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
})

module.exports =router;