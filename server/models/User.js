import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'],
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, 'Enter a valid 6-digit pincode'],
    },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'],
    },
    name: { type: String, trim: true, default: '' },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    addresses: { type: [addressSchema], default: [] },

    // Never returned unless explicitly selected.
    otpHash: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, select: false, default: null },
    otpAttempts: { type: Number, select: false, default: 0 },
    lastOtpRequestedAt: { type: Date, select: false, default: null },
  },
  { timestamps: true },
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    phone: this.phone,
    name: this.name,
    email: this.email,
    addresses: this.addresses.map((address) => ({
      ...address.toObject(),
      id: address._id.toString(),
    })),
  };
};

export const User = mongoose.model('User', userSchema);
export { addressSchema };
