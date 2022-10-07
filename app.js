const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const _ =require('lodash')

const app=express()



app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
mongoose.connect('mongodb://localhost:27017/todolistDB')

const itemsSchema ={
    name: String
}


const Item =mongoose.model('item',itemsSchema)
const item1=new Item ({
    name:"Welcome to your to-do-list!"
})
const item2=new Item ({
    name:"Click on add to add in your list"
})

const defaultItems =[item1,item2]

const listSchema ={
    name: String,
    items: [itemsSchema]
}

const List =mongoose.model('List',listSchema)



app.get('/', function(req,res)
{
    Item.find({}, function(err,foundItems){
        if(foundItems.length===0)
        {

            Item.insertMany(defaultItems,function(err){
                if(err)console.log('error');
                else console.log('successfully saved default items to database.')
            })
            res.redirect('/')
        }
        else {
          
            res.render('list',{Tday:'Today',newitems:foundItems})
        }
    })
    
   
})
// req is received in below section
app.post('/',function(req,res)
{
  const itemName=req.body.newItem;      
  const listName= req.body.list;       //work

  console.log(itemName+"  "+ listName)
  const item= new Item({
    name:itemName
  })

  if(listName==='Today')
  {
    item.save()
    res.redirect('/')  
  }
  else{
    
    List.findOne({name:listName},function(err,results){
        if(!err){
        results.items.push(item)
        results.save()
        res.redirect('/'+ listName)
        }
    })
    
    
       
   
  }

 
})

app.post('/delete',function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==='Today')
    {
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err)console.log('error');
            else console.log('successfully removed item from database.')
    
        })
        res.redirect('/')
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err,results){
            if(err)
            {
                console.log('Error')
            }
            else console.log('Successfully pulled out the item.  ')
            res.redirect('/'+listName)
        })
    }
  
})

app.get('/:customListName', function(req,res){
    const customListName= _.capitalize(req.params.customListName)
    
    List.findOne({name:customListName},function(err,results){
        if(!err){
          if(!results){
            const list =new List ({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect('/'+customListName)
          }
          else{
            res.render('list',{Tday:results.name,newitems:results.items})
          }
        }
    })

   
    
})
app.listen(3000,function()
{
    console.log('Server is running up fine')
})