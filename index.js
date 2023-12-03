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
  description: String,
  duration: Number,
  date: String
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

app.post('/api/users/:_id/exercises', async (req,res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body
  let dateToSave;
  if( new Date(date) === 'Invalid Date' ){
    dateToSave = new Date().toString()
  }else {
    dateToSave = new Date(date).toString()
  }
  try {
    const update = await User.findByIdAndUpdate({_id}, {
      description: description,
      duration: duration,
      date: dateToSave
      },
      {new: true}
      )
      res.json(update)
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
