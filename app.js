//jshint esversion:6
const express= require("express");
const bodyParser= require("body-parser");
const port = 3000;
const app= express();
const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.listen(port,function(req,res){
  console.log("Server started");
});

mongoose.connect("mongodb+srv://admin-princy:MMmm123%23%23@cluster0-aoeym.mongodb.net/todolistDB",{ useUnifiedTopology: true ,useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
mongoose.set('useFindAndModify', false);
const itemSchema = new mongoose.Schema({
    name: {
      type : String,
      required: [true],
      min :1,
      max : 50
    }
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
   name : "Welcome to your todolist!"
});

const item2 = new Item({
   name :  "Hit the + button to add a new item."
});

const item3 = new Item({
   name : "<--- Hit this to delete an item."
});

defaultItems = [item1,item2,item3];


app.get("/",function(req,res){
  Item.find(function(err,items){

    if( items.length === 0)
    {
        Item.insertMany(defaultItems,function(err){
           if(err)
            console.log(err);
           else
           console.log("inserted");
    });
      res.redirect("/");
    }
    else
      res.render("list",{listTitle:"Today",newListItems:items});


});
});


const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/:listTitle",function(req,res){
   customListName=_.capitalize(req.params.listTitle);
  List.findOne({name:customListName},function(err,list){
      if (!list){
      const list = new List({
        name : customListName,
        items :defaultItems

  });
     list.save();
     console.log("list created");
     res.redirect("/"+customListName);
  }
  else
    res.render("list",{listTitle:list.name,newListItems:list.items});
});

});


app.post("/",function(req,res){

   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item= new Item({
       name : itemName
   });
   if (listName === "Today")
   {
      item.save();
      console.log("inserted");
      res.redirect("/");
   }
   else
   List.findOne({name : listName},function(err,list){
       if (err)
       console.log(err);
       else
        {
          list.items.push(item);
          list.save();
          res.redirect("/"+ listName);
        }
   });
});

app.post("/delete",function(req,res){
     const checkedItemId = req.body.checkbox;
     const listName = req.body.listName;

     if (listName === "Today")
     {
     Item.findByIdAndRemove(checkedItemId,function(err){
        if(err)
         console.log(err);
        else
         console.log("Deleted");
          res.redirect("/");
   });
     }
     else
     List.findOneAndUpdate({name : listName},{$pull :{items :{_id :checkedItemId}}},function(err,list){
        if(!err)
        {
           res.redirect("/" + listName);
        }
     });
});


app.get("/about",function(req,res){
  res.render("about");
});
