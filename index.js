const express = require('express');
const app = express();
const morgan = require('morgan'); 
const Person = require('./models/people')
const cors = require('cors'); 

//app.use(morgan('tiny'));
app.use(express.static('dist'))
// necessary json parser
app.use(express.json());

app.use(cors());


// Define the route to get data, fins({}) - displays all what we have in Person
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
});

app.get('/api/persons/:id', (req, res,next) => {
    Person.findById(req.params.id)
    .then(person => {
        if(person){
            res.json(person)
        } else {
            res.status(404).json({error: ' Person not found'})
        }
    })
    .catch(error => next(error))
});


app.get('/info',(req,res)=>{
    Person.countDocuments({})
    .then(count =>{
        const currentDate = new Date();
        const message = count === 0
        ? 'Phone book has no entries.'
        : `${count} person(s) have been added`;
        res.send(
            `<p>${message}</p>
            <p>${currentDate}</p>`
     );
    })
    .catch(error => next(error))
    });


app.delete('/api/persons/:id',(req,res)=>{
   Person.findByIdAndDelete(req.params.id)
   .then(deletedNote =>{
    res.status(200).end()
   })
   .catch(error => next())
});

app.put('/api/persons/:id',(req,res)=>{
    const {name, number} = req.body;

    Person.findByIdAndUpdate(
        req.params.id,
        {name, number}, 
        {new: true, runValidators: true, context: 'query'})
    //new: true - ensures you gt back a modified version
    //runValidators: true -
    .then(updatedPerson => {
        if(updatedPerson){
            res.json(updatedPerson)
        }
    }) 
    .catch(error => next(error))
});

app.post('/api/persons', (req, res, next) => { // Added next parameter
    const body = req.body;

    if (body.name.length < 3) {
        return res.status(400).json({ error: `Person validation failed: "${body.name}" is shorter than 3 symbols (allowed length)` });
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
            res.status(201).json(savedPerson);
        })
        .catch(error => {
            // Check if the error is a validation error
            if (error.name === 'ValidationError') {
                return res.status(400).json({ error: error.message });
            }
            next(error); 
        }); // Closing bracket added here
});



//for the uncknown endpoint errors
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
    };
    app.use(unknownEndpoint);

//for errors
const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation Error' });
    }

    next(error); // Call next(error) for other types of errors
};

app.use(errorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`App is running at port ${PORT}`);
});
