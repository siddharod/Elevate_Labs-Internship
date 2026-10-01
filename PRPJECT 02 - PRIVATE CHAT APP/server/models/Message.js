const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice'],
      default: 'text'
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    voiceDuration: {
      type: Number,
      default: 0
    },
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      senderName: {
        type: String,
        default: ''
      },
      content: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'text'
      }
    },
    reactions: [
      {
        emoji: {
          type: String,
          required: true
        },
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
        ]
      }
    ],
    forwardedFrom: {
      isForwarded: {
        type: Boolean,
        default: false
      },
      originalSenderName: {
        type: String,
        default: ''
      }
    },
    edited: {
      isEdited: {
        type: Boolean,
        default: false
      },
      editedAt: {
        type: Date
      }
    },
    deleted: {
      isDeletedForEveryone: {
        type: Boolean,
        default: false
      },
      deletedFor: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      deletedAt: {
        type: Date
      }
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    pinnedUntil: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual alias conversationId <-> conversation
messageSchema.virtual('conversationId')
  .get(function () {
    return this.conversation;
  })
  .set(function (val) {
    this.conversation = val;
  });

// Virtual alias text <-> content
messageSchema.virtual('text')
  .get(function () {
    return this.content;
  })
  .set(function (val) {
    this.content = val;
  });

// Indexes for fast retrieval and text search
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ content: 'text', fileName: 'text' });

module.exports = mongoose.model('Message', messageSchema);
