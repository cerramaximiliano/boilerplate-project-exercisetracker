const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new Schema({
  username: { type: String, required: true },
  exercises: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],

});

const User = mongoose.model("User", userSchema);


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
    const {username} = req.body;  
    const user = new User ( {username} );
    try {
      const newUser = await user.save();
      res.json({
        username: newUser.username,
        _id: newUser._id
      })
    }catch(err){
      console.log(err)
    }
});

app.get('/api/users', async (req,res) => {
  try {
    const users = await User.find().select('username _id')
    res.json(
      users
    )
  }catch(err){
    console.log(err)
  }
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const { _id } = req.params;
  const {from, to, limit} = req.query;

    try{
      const user = await User.findById(_id)


      console.log(user)
      res.json({
        _id: user._id,
        username: user.username,
        count: user.exercises.length,
        log: user.exercises
      })
    }catch(err){
      console.log(err)
    }
});

app.post('/api/users/:_id/exercises', async (req,res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  let dateToSave;
  if( date === '' ){
    dateToSave = new Date()

  }else {
    dateToSave = new Date(date)
  }
  try {
    const update = await User.findByIdAndUpdate({_id}, {
      $push: {
        exercises: {
          description: description,
          duration: duration,
          date: dateToSave,
        },
      },
      },
      {new: true, select: '-__v' }
      )
      res.json({
        _id: update._id,
        username: update.username,
        date: dateToSave.toDateString(),
        description: description,
        duration: Number(duration)
      })
  }catch(err){
    console.log(err)
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
