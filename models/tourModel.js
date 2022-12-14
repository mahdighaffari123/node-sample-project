const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour most have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A name most have less or equal then 40 characters'],
      minLength: [10, 'A name most have more or equal then 10 characters'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A tour most have a price'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour most have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour most have a groupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour most have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour most have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour most have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour most have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJson
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Embedding way of implementing tour guides
    // guides: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__V -passwordChangedAt',
  });
  next();
});

// Get tour guide in embedding way
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
