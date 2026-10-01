const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    groupName: {
      type: String,
      trim: true,
      default: ''
    },
    groupImage: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: {
      type: {
        type: String,
        enum: ['text', 'image', 'file', 'voice'],
        default: 'text'
      },
      content: {
        type: String,
        default: ''
      },
      text: {
        type: String,
        default: ''
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    pinnedMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message'
        },
        pinnedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        pinnedUntil: {
          type: Date
        },
        pinnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    hiddenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
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

// Virtual aliases
conversationSchema.virtual('groupAvatar').get(function () {
  return this.groupImage || (this.groupName ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(this.groupName)}` : '');
});

conversationSchema.virtual('groupAdmins').get(function () {
  return this.admins;
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
