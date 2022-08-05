require('../models/database');
const Category = require('../models/Category')
const Recipe = require('../models/Recipe')


//get homepage

exports.homepage = async(req, res) => {

    try {
        const limitNumber = 5;
        const categories = await Category.find( {} ).limit(limitNumber);
        const latest = await Recipe.find( {}).sort( {_id: -1}).limit(limitNumber);
        const thai = await Recipe.find(  {'category': 'Thai'}).limit(limitNumber);
        const american = await Recipe.find(  {'category': 'American'}).limit(limitNumber);
        const chinese = await Recipe.find(  {'category': 'Chinese'}).limit(limitNumber);

        const food = { latest, thai, american, chinese };

        res.render('index', { title: 'Cooking Blog - Home', categories, food });

    } catch (error) {
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}


//get categories


exports.exploreCategories = async(req, res) => {

    try {
        const limitNumber = 20;
        const categories = await Category.find( {} ).limit(limitNumber);


        res.render('categories', { title: 'Cooking Blog - Categories', categories });

    } catch (error) {
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}

//get categories/id


exports.exploreCategoriesById = async(req, res) => {

    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find( { 'category': categoryId } ).limit(limitNumber);


        res.render('categories', { title: 'Cooking Blog - Categories', categoryById });

    } catch (error) {
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}


//get recipe
exports.exploreRecipe = async(req, res) => {

    try {
        let recipeId = req.params.id;

        const recipe = await Recipe.findById(recipeId);

        res.render('recipe', { title: 'Cooking Blog - Recipe', recipe });

    } catch (error) {
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}


//post/search



exports.searchRecipe = async(req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find ( { $text: {  $search: searchTerm , $diacriticSensitive: true } } )
        res.render('search', { title: 'Cooking Blog - Search', recipe});

    } catch (error){
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}

//get explore-latest
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find( {} ).sort({_id: -1 }).limit(limitNumber);
        res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe});

    } catch (error){
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}

//get explore-random
exports.exploreRandom = async(req, res) => {
    try {
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();
        res.render('explore-random', { title: 'Cooking Blog - Explore Random', recipe});

    } catch (error){
        res.status(500).send({message: error.message || 'Error Occured'}) ;   
    }
}

//get submit recipe
exports.submitRecipe = async(req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj });

}

//POST submit recipe
exports.submitRecipeOnPost = async(req, res) => {

    try {
        let imageUploadFile;
        let uploadPath;
        let newImageName;

        if(!req.files || Object.keys(req.files).length ===  0){
            console.log('No files were uploaded.');
        } else {
            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;

            uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function(err){
                if(err) return res.status(500).send(err);
            })
            
        }

       

        const newRecipe = new Recipe( {
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingrediends,
            category: req.body.category,
            image: newImageName
        });

        await newRecipe.save();

    req.flash('infoSubmit', "Recipe has been added.")
    res.redirect('/submit-recipe');

    } catch (error) {
        req.flash('infoErrors', error)
        res.redirect('/submit-recipe');
    }

}

// async function updateRecipe(){
//     try {
//         const res = await Recipe.updateOne( {name: 'New Recipe' }, { name: 'New Recipe Updated'});
//         res.n; //number of documents matched
//         res.nModified; // number of documents modified
//     } catch(error) {
//         console.log(error);
//     }
// }

// updateRecipe();


// async function deleteRecipe(){
//     try {
//         await Recipe.deleteOne( {name: 'New Recipe Updated' });

//     } catch(error) {
//         console.log(error);
//     }
// }

// deleteRecipe();



// async function insertDummyCategoryData(){
//     try {
//         await Category.insertMany( [
//             {
//                 'name': 'Thai',
//                 'image': 'thai-food.jpg'
//             },
//             {
//                 'name': 'American',
//                 'image': 'american-food.jpg'
//             },
//             {
//                 'name': 'Chinese',
//                 'image': 'chinese-food.jpg'
//             },
//             {
//                 'name': 'Mexican',
//                 'image': 'mexican-food.jpg'
//             },
//             {
//                 'name': 'Indian',
//                 'image': 'indian-food.jpg'
//             },
//             {
//                 'name': 'Spanish',
//                 'image': 'spanish-food.jpg'
//             },
//             {
//                 'name': 'Thai',
//                 'image': 'thai-food.jpg'
//             },
//         ]);
//     } catch (error) {
//         console.log('err', + error)
//     }
// }

// insertDummyCategoryData()

// async function insertDummyRecipeData(){
//     try {
//         await Recipe.insertMany( 
//             [
//                 {
//                     "name": "Breads",
//                     "description": `In a wok or large skillet add 1 Tablespoon olive oil over medium high heat. Add bell pepper, peas, carrots, mushrooms, broccoli, baby corn, and water chestnuts. Sauté 2-3 minutes until veggies are almost tender.

                    
//                     Source: https://therecipecritic.com/vegetable-stir-fry/ `,
//                     "email": 'hello@gmail.com',
//                     "ingredients": [
//                         "1 clove of garlic",
//                         "1 fresh red chilli",
//                         "3 spring onions",
//                         "1 small red onion",
//                         "1 handful of mangetout",
//                         "a few shiitake mushroom"
//                     ],
//                         "category": "American",
//                         "image": "breads.jpg"
//                 },
//                 {
//                     "name": "Stir-fried vegetables",
//                     "description": `In a wok or large skillet add 1 Tablespoon olive oil over medium high heat. Add bell pepper, peas, carrots, mushrooms, broccoli, baby corn, and water chestnuts. Sauté 2-3 minutes until veggies are almost tender.

                    
//                     Source: https://therecipecritic.com/vegetable-stir-fry/ `,
//                     "email": 'hello@gmail.com',
//                     "ingredients": [
//                         "1 clove of garlic",
//                         "1 fresh red chilli",
//                         "3 spring onions",
//                         "1 small red onion",
//                         "1 handful of mangetout",
//                         "a few shiitake mushroom"
//                     ],
//                         "category": "Chinese",
//                         "image": "stir-fried-vegetables.jpg"
//                 },
//                 {
//                     "name": "Spring rolls",
//                     "description": `In a wok or large skillet add 1 Tablespoon olive oil over medium high heat. Add bell pepper, peas, carrots, mushrooms, broccoli, baby corn, and water chestnuts. Sauté 2-3 minutes until veggies are almost tender.

                    
//                     Source: https://therecipecritic.com/vegetable-stir-fry/ `,
//                     "email": 'hello@gmail.com',
//                     "ingredients": [
//                         "1 clove of garlic",
//                         "1 fresh red chilli",
//                         "3 spring onions",
//                         "1 small red onion",
//                         "1 handful of mangetout",
//                         "a few shiitake mushroom"
//                     ],
//                         "category": "Chinese",
//                         "image": "spring_rolls.jpg"
//                 },
//                 {
//                     "name": "Chicken Piccata",
//                     "description": `In a wok or large skillet add 1 Tablespoon olive oil over medium high heat. Add bell pepper, peas, carrots, mushrooms, broccoli, baby corn, and water chestnuts. Sauté 2-3 minutes until veggies are almost tender.

                    
//                     Source: https://therecipecritic.com/vegetable-stir-fry/ `,
//                     "email": 'hello@gmail.com',
//                     "ingredients": [
//                         "1 clove of garlic",
//                         "1 fresh red chilli",
//                         "3 spring onions",
//                         "1 small red onion",
//                         "1 handful of mangetout",
//                         "a few shiitake mushroom"
//                     ],
//                         "category": "Italian",
//                         "image": "chicken_Piccata.jpg"
//                 },
//                 {
//                     "name": "Noodle_soup",
//                     "description": `In a wok or large skillet add 1 Tablespoon olive oil over medium high heat. Add bell pepper, peas, carrots, mushrooms, broccoli, baby corn, and water chestnuts. Sauté 2-3 minutes until veggies are almost tender.

                    
//                     Source: https://therecipecritic.com/vegetable-stir-fry/ `,
//                     "email": 'hello@gmail.com',
//                     "ingredients": [
//                         "1 clove of garlic",
//                         "1 fresh red chilli",
//                         "3 spring onions",
//                         "1 small red onion",
//                         "1 handful of mangetout",
//                         "a few shiitake mushroom"
//                     ],
//                         "category": "Thai",
//                         "image": "noodle_soup.jpg"
//                 },


//                     ],
//         )
                    
//                 } catch (error) {
//         console.log('err', + error)
//     }
// }

// insertDummyRecipeData()