const mongoose = require('mongoose') // Erase if already required
const bcrypt = require('bcrypt')
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default: "user",
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    refreshToken:{
        type:String,
    }
},{
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})
userSchema.methods.isPasswordMatched = async function(candidatePassword) {
    // 'this' refers to the current user document
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};
//Export the model
module.exports = mongoose.model('User', userSchema);