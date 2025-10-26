const express = require('express');//ec5
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

const users =[
    {
    'id':'1',
    'name':"lolo",
    'email':'lolo@gmail.com',
    'password':'12345'
    },
        {
    'id':'2',
    'name':"tot",
    'email':'tot@gmail.com',
    'password':'12345'
    },
        {
    'id':'3',
    'name':"dflolo",
    'email':'lfolo@gmail.com',
    'password':'12345'
    },
        {
    'id':'4',
    'name':"lolomm",
    'email':'lolommm@gmail.com',
    'password':'12345'
    },
]
app.get('/users',(req,res)=>{
    return res.json({message:"success",data:users});
});

app.post('/users',(req,res)=>{
    const {id,name,email,password} = req.body;
    
    const checkUser = users.find((user)=>{
        return user.email == email;
    });
    if(checkUser){
        return res.json({message:"email is exists"});
    }
    users.push({id,name,email,password});
    return res.json(checkUser);
});

app.post('/deleteuser',(req,res)=>{
    const id = req.body.id;
    const index = users.findIndex((user)=>{
        return user.id === id;
    })
    users.splice(index,1);
    return res.json({message:'success',data:users});

});
app.delete('/users',(req,res)=>{
    const id = req.body.id;
    const index = users.findIndex((ele)=>{
        return ele.id === id;
    });
    if(index == -1){
        return ({message:"user not found"})
    }
    users.splice(index,1);
    return res.json({message:"success",data:users});
})
app.patch('/users',(req,res)=>{
    const {id,name} = req.body;

    const checkUser = users.find((user)=>{
        user.id === id;
    });
    if(checkUser == undefined){
        return res.json({message:"user not found"});
    }
    checkUser.name = name;
    return res.json({message:"success"},data.users);
})
app.get('/ping', (req, res) => {
  res.json({ message: 'Pong from Node server!' });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

