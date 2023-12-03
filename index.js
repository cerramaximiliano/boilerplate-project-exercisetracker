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
      date: String,
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
    try{
      const user = await User.findById({_id})
      res.json({
        _id: user._id,
        username: user.username,
        count: user.exercises.length,
        logs: user.exercises
      })
    }catch(err){
      console.log(err)
    }
});

app.post('/api/users/:_id/exercises', async (req,res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  let dateToSave;
  if( date === '' ){
    dateToSave = new Date().toLocaleDateString('en-US', options);

  }else {
    dateToSave = new Date(date).toLocaleDateString('en-US', options);
  }
  try {
    const update = await User.findByIdAndUpdate({_id}, {
      $push: {
        exercises: {
          description: description,
          duration: duration,
          date: dateToSave.replace(/,/g, ''),
        },
      },
      },
      {new: true, select: '-__v' }
      )
      console.log(update)
      res.json({
        _id: update._id,
        username: update.username,
        date: dateToSave.replace(/,/g, ''),
        description: description,
        duration: Number(duration)
      })
  }catch(err){
    console.log(err)
  }
});

// {
//   username: "fcc_test",
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
//   _id: "5fb5853f734231456ccb3b05"
// }

// {
//   username: "fcc_test",
//   _id: "5fb5853f734231456ccb3b05"
// }

// {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
