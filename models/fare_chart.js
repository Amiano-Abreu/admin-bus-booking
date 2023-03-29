var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var fareSchema = new mongoose.Schema(
{
	source:String,
	destination:String,
	fare:Number
	
});

fareSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("fare",fareSchema);