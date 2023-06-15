const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set("view engine" , 'ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB" , { useNewUrlParser : true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item" , itemsSchema);

const ListSchema = {
  name : String ,
  items : [itemsSchema]
}

const List = mongoose.model("List",ListSchema);

const item1 = new Item({
  name : "Welcome to TODOLIST"
});

const item2 = new Item({
  name : "Second Item"
});

const defaultItems = [item1,item2];

app.get("/" , function(req,res){

  Item.find(function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Connected Succesfully");
        }
      })
      res.redirect("/");
    }else{
      res.render('list' , { kindOfDay : "Today" , newToDoItem:foundItems});
    }
  })

  var today = new Date();
  var currentDay = today.getDay();
  var day = "";

  var options = {
    weekday : "long",
    day : "numeric",
    month : "long"
  };

  day = today.toLocaleDateString("en-US" , options)

});

app.get("/:customRoute" , function(req,res){
  const customListName = _.capitalize(req.params.customRoute);

  List.findOne({name:customListName} , function(err , foundListItem){
    if(!err){
      if(!foundListItem){
      const list = new List({
        name : customListName,
        items : defaultItems
      })

      list.save();
      res.redirect("/"+customListName);
    }else{
        res.render('list' , { kindOfDay : foundListItem.name , newToDoItem:foundListItem.items});
    }
    }
  })


});

app.post("/",function(req,res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name : item
  })

  if(listName === "Today"){
  newItem.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
    });
    res.redirect("/"+listName);
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId[0],function(err){
        if(err){
          console.log("Error in deleting item")
        }else{
          res.redirect("/");
        }
      });
  }else{
      List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItemId}}} , function(err,result){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
});

app.listen(3000,function(){
  console.log("Server started at port 3000");
});
