const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSch = new mongoose.Schema({
    username: {type: String, required: true}, 
    email: {type: String, required: true},
    password: {type: String, required: true},
    credit: {type: Number, default: 0 },
    stripeCustomerId: { type: String, default: null },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ]
});

// pre middleware function, to hash users' passwords
UserSch.pre("save", function (next) {

    const user = this;

    if (this.isModified("password") || this.isNew) {

        bcrypt.genSalt(10, (saltErr, salt) => {

            if (saltErr) {

                return next(saltErr);

            } else {

                bcrypt.hash(user.password, salt, (hashErr, hash) => {

                    if (hashErr) {

                        return next(hashErr);

                    } else {

                        user.password = hash;
                        next();

                    }

                })

            }

        })

    } else {

        return next();

    }

})

const User = mongoose.model(
    "User", UserSch
);

module.exports = User;