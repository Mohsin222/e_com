const { Product } = require("../models/products");
const express = require("express");
const router = express.Router();
const { Category } = require("../models/categories");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

//multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

//product list
router.get(`/`, async (req, res) => {
  const productList = await Product.find().select("name images -_id");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);

  //select is used for what field i want to dispaly
  //_id for not showing id
});

//single product
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});
//get two tabel data
// router.get(`/:id`,async(req,res)=>{
//     const product= await Product.findById(req.params.id).populate('Category');
//     if(!product) {
//         res.status(500).json({success: false})
//     }
//     res.send(product)

//     //populate use for like ref table data

// })

//post product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;

  const newProduct = req.body;
  console.log(newProduct);
  const product = new Product({
    name: req.body.name,
    description: req.body.description,

    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,

    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  console.log(product);
  try {
    product = await product.save();
    if (!product) return res.status(500).send("the product cannot be created");
  } catch (error) {
    console.log(error);
  }

  res.send(product);
});

//update
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid product");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,

      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,

      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    //for get new resposne data in post man
    {
      new: true,
    }
  );
  if (!updatedProduct)
    return res.status(500).send("The product can not updated");

  res.send(updatedProduct);
});

//delete product
router.delete("/:id", async (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleated" });
      } else {
        res.status(404).json({ success: false, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

//count product for statictics purpose
router.get(`/get/count`, async (req, res) => {
  //not working properly
  try {
    const productCount = await Product.countDocuments({});
    //(count)=>count).catch((err)=>console.log(err))
    if (!productCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      productCounta: productCount,
    });
  } catch (error) {
    console.log(error);
  }
});

//featured products
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;

  const product = await Product.find({ isFeatured: true }).limit(count);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

//filtering and getting product by category
router.get(`/`, async (req, res) => {
  let filter = [];
  if (req.query.categories) {
    filter = req.query.categories.split(",");
  }

  const productList = await Product.find({ categories: filter }).select(
    "name images -_id"
  );
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);

  //select is used for what field i want to dispaly
  //_id for not showing id
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Product Id");
    }
    const files = req.files;

    let imagepath = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;
    if (files) {
      files.map((file) => {
        imagepath.push(`${basePath}${file.fileName}`);
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
  
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
  
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      //for get new resposne data in post man
      {
        new: true,
      }
    );
    if (!updatedProduct)
      return res.status(500).send("The product can not updated");

    res.send(updatedProduct);
  }
);

module.exports = router;
