require('dotenv').config()
const mongoose = require('mongoose')




const url = process.env.MONGODB_URI

console.log('MongoDB URI:', url)
mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB', result)
  })
  .catch(error => {
    console.log('error connecting to MongoDB', error.message)
  })

const personSchema = new mongoose.Schema({
  name:{
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: function(v){
      return /^\d{2,3}-\d+$/.test(v)
    },
    message: props => `${props.value} is not a valid phone number!`

  }
})

personSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject._id
    delete returnObject.__v
  }
})
const Person = mongoose.model('Person', personSchema,'people')

module.exports = mongoose.model('Person', personSchema, 'people')