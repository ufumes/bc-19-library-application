var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    passport = require('passport'); 

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))
router.route('/')
    //GET all books
    .get(function(req, res, next) {
        //retrieve all books from Monogo
        mongoose.model('book').find({}, function (err, books) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/books folder. We are also setting "books" to be an accessible variable in our jade view
                    html: function(){
                        res.render('books/index', {
                              title: 'All my books',
                              "books" : books,
                              user: req.user
                          });
                    },
                    //JSON response will show all books in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }     
        });
    })
    //POST a new book
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name1 = req.body.name;
        var isbn1 = req.body.isbn;
        var author1 = req.body.author;
        var description1 = req.body.description;        
        var quantity1 = req.body.quantity;
        var surchargeFee1 = req.body.surchargeFee;
        var category1 = req.body.category;
        // var isAvailable1 = req.body.isAvailable;
        //call the create function for our database
        mongoose.model('book').create({
            name : name1,
            isbn : isbn1,
            author : author1,
            description: description1,
            quantity: quantity1,
            surchargeFee: surchargeFee1,
            category:category1,
            // isAvailable : isAvailable1
        }, function (err, book) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //book has been created
                  console.log('POST creating new book: ' + book);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("books");
                        // And forward to success page
                        res.redirect("/books");
                    },
                    //JSON response will show the newly created book
                    json: function(){
                        res.json(book);
                    }
                });
              }
        })
    });


router.get('/new', isAnAdmin, function(req, res) {
  console.log(req.user)
    res.render('books/new', { title: 'Add New book' });
});



// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('book').findById(id, function (err, book) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(book);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('book').findById(req.id, function (err, book) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + book._id);
        // var bookdob = book.dob.toISOString();
        // bookdob = bookdob.substring(0, bookdob.indexOf('T'))
        res.format({
          html: function(){
              res.render('books/show', {
                "book" : book
              });
          },
          json: function(){
              res.json(book);
          }
        });
      }
    });
});

//GET the individual book by Mongo ID
router.get('/:id/edit',isAnAdmin, function(req, res) {
    //search for the book within Mongo
    mongoose.model('book').findById(req.id, function (err, book) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the book
            console.log('GET Retrieving ID: ' + book._id);
            //format the date properly for the value to show correctly in our edit form
          // var bookdob = book.dob.toISOString();
          // bookdob = bookdob.substring(0, bookdob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('books/edit', {
                          title: 'book' + book._id,
                        // "bookdob" : bookdob,
                          "book" : book,
                          user: req.user
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(book);
                 }
            });
        }
    });
});

//PUT to update a book by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
        var name1 = req.body.name;
        var isbn1 = req.body.isbn;
        var author1 = req.body.author;
        var description1 = req.body.description;        
        var quantity1 = req.body.quantity;
        var surchargeFee1 = req.body.surchargeFee;
        var category1 = req.body.category
        // var isAvailable1 = req.body.isAvailable;

   //find the document by ID
        mongoose.model('book').findById(req.id, function (err, book) {
            //update it
            book.update({
                name : name1,
              isbn : isbn1,
              author : author1,
              description: description1,
              quantity: quantity1,
              surchargeFee: surchargeFee1,
              category:category1,
              // isAvailable : isAvailable1
            }, function (err, bookID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/books/" + book._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(book);
                         }
                      });
               }
            })
        });
});

//DELETE a book by ID
router.delete('/:id/edit',isAnAdmin, function (req, res){
    //find book by ID
    mongoose.model('book').findById(req.id, function (err, book) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            book.remove(function (err, book) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + book._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/books");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : book
                               });
                         }
                      });
                }
            });
        }
    });
});


router.put('/:id/borrow', isLoggedIn,  function(req, res){
  console.log(req.user);
  mongoose.model('book').findById(req.id,function(err, book){
    if(err) {console.log(err)}
    else {
      mongoose.model('borrowed_books').findOne({'user_id':req.user.id, 'book_id':req.id}, function(err, result){
        if(result !== null) res.send("You've borrowed this book before");
        else{
      
          if(book.quantity >= 1 && book.isAvailable === true){
            mongoose.model('book').findByIdAndUpdate({_id:req.id}, {$inc:{quantity: -1}}, {new:true}, function (err, book) {
            if (err) {res.send("There was a problem updating the information to the database: " + err);}
                     
                    else {
                              mongoose.model('borrowed_books').create({
                                  user_id: req.user.id,
                                  book_id:req.id,
                                  user:req.user,
                                  book:book,
                                  is_returned:false
                              })
                            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                            res.format({
                                html: function(){
                                     res.redirect("/books/" + book._id);
                               },
                               //JSON responds showing the updated values
                              json: function(){
                                     res.json(book);
                               }
                            });
                     }// end if else block to save to borrowed_books schema and display the results
            })
          }// end if else block to check that a book has copies left and is available before a user can borrow it
          else {res.send("Sorry, you can't borrow this book")}
        }// end of if else block for checking if a user has borrowed a book before
      }) // end of mongoose call that checks if a user has borrowed a book before
    }// end if else block that checks if book was grabbed successfully
  })// end of first mongoose call to grab the book
});// end route handler

router.put('/:id/return', isLoggedIn, function(req, res){

  mongoose.model('borrowed_books').findOneAndUpdate({'book_id':req.id},{$set:{is_returned:false}}, function(err, borrowed_book){
      if(err) console.log(err);
      else {
                  //book has been returned
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.redirect('back');
                    },
                    //JSON response will show the newly created book
                    json: function(){
                        res.json(borrowed_book);
                    }
                });
              }
  })// end mongoose call
})

router.put('/:id/return_and_update', isAnAdmin, function(req, res){
  
  mongoose.model('borrowed_books').findOneAndUpdate({'book_id':req.id},{$set:{is_returned:true}}, function(err, borrowed_book){
      if(err) console.log(err);
      else {
              mongoose.model('books').findOneAndUpdate({_id:req.id}, {$inc:{quantity:1}}, function(err, book){
                if (err) console.log(err);
              })// end of second mongoose call
              //book has been returned
              res.format({
                  //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                html: function(){
                    // If it worked, set the header so the address bar doesn't still say /adduser
                    res.redirect('back');
                    res.flash("Book returned successfully")
                },
                //JSON response will show the newly created book
                json: function(){
                    res.json(borrowed_book);
                }
            });
          }
  })// end mongoose call

})

module.exports = router;

function isLoggedIn(req, res, next) {  
  if (req.isAuthenticated())
      return next();
  res.redirect('/login');
}
function isAnAdmin(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.local.isAdmin === true) return next();
    else res.redirect('/login')
  }

  else res.redirect('/login')
}