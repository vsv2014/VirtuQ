const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  addresses: [addressSchema],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  preferences: {
    sizePreferences: {
      top: String,
      bottom: String,
      shoe: String
    },
    colorPreferences: [String],
    stylePreferences: [String],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update last login date
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Set default address
userSchema.methods.setDefaultAddress = function(addressId) {
  this.defaultAddress = addressId;
  return this.save();
};

// Add address
userSchema.methods.addAddress = async function(addressData) {
  // If this is the first address or marked as default
  if (this.addresses.length === 0 || addressData.isDefault) {
    // Set all other addresses to non-default
    this.addresses.forEach(addr => addr.isDefault = false);
    addressData.isDefault = true;
    this.defaultAddress = addressData._id;
  }
  
  this.addresses.push(addressData);
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
