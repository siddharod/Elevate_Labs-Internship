const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    profilePicture: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: 'Hey there! I am using Converse.',
      maxlength: [200, 'Bio cannot exceed 200 characters']
    },
    customStatus: {
      type: String,
      default: '',
      maxlength: [100, 'Status cannot exceed 100 characters']
    },
    onlineStatus: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    chatBackground: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual alias for backward compatibility
userSchema.virtual('avatar').get(function () {
  return this.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(this.username)}`;
});

userSchema.virtual('isOnline').get(function () {
  return this.onlineStatus;
});

// Pre-save hook: Hash password and auto-generate default profile picture if missing
userSchema.pre('save', async function (next) {
  if (!this.profilePicture) {
    this.profilePicture = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(this.username)}`;
  }

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON representation (strips password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
