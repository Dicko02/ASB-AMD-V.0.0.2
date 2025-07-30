const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const adminSchema = new mongoose.Schema(
    {
        pseudo: {
          type: String,
          required: true,
          unique: true,
          trim: true
        },

        titre:{
          type: String,
          required: true,
          trim: true
        },

        password: {
          type: String,
          required: true,
          max: 1024,
          min: 6
        }
    },

    {
        timestamps: true
    }
);

// criptage de mot de passe pour l'admin
adminSchema.pre('save', async function (next) {
  const admin = this;
  if (!admin.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const AdminModel = mongoose.model('Admin', adminSchema);
module.exports = AdminModel;