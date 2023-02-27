const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const Service = require('../models/Service')

//Index Page
module.exports.index = async (req,res)=>{
    try{ 
        res.render('services/index');
    }
    catch
    {
        res.render('/');
    }
}

//Index Page
module.exports.newService = async (req,res)=>{
    try{ 
        res.render('services/index');
    }
    catch
    {
        res.render('/');
    }
}