const mongoose = require('mongoose');
const Nexmo = require('nexmo');
const jwt = require("jsonwebtoken");


const nexmo = new Nexmo({
  apiKey: "879ba2c0",
  apiSecret: "CaSkha79myFb1PYy"
});


const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type : String,
        unique : true,
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password : {
        type : String,
    },
    name : {
        type : String,
    },
    mobile : {
        type : String,
        required : true,
        unique : true,
        minlength : 6
    },
    request_id : String,
    mobile_verified : {
        type : Boolean
    },

    email_verified : {
        type : Boolean
    },
    profile_completed : Boolean
});


userSchema.methods.verifyMobileNumber = function(otp, cb) {
    const self = this;

    nexmo.verify.check({request_id: self.request_id, code: otp}, (err, result) => {
        if(err){
            return cb(new Error(err),null);
        }
    
        self.mobile_verified = true;
        self.save()
        .then(res => {
            return cb(null,this)
        })
        .catch(err => {
            return cb(new Error(err),null);
        });

    });
};


userSchema.methods.requestOtp = function(cb) {
    var self = this;
    nexmo.verify.request({number: self.mobile, brand: 'Hobotreks Company', country : 'IN'},(err,result)=>{
        
        if(err){
            return cb(new Error(err),null);
        }

        self.request_id = result.request_id;
        self.save()
        .then(res => {
            return cb(null,this);
        })
        .catch(err => {
                return cb(new Error(err),null);
        });
    });
};

userSchema.methods.requestAuthToken = () => {
    var self = this;

    const token = jwt.sign(
        {
            mobile : self.mobile,
            userId : self._id
        },
        process.env.JWT_PASS_KEY,
        {
            expiresIn : "1h"
        }
    );
    return Promise.resolve(token);
}


module.exports = mongoose.model('User', userSchema);