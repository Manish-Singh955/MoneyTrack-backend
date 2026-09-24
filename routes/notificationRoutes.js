const express = require("express");

const router =
  express.Router();

const Notification =
  require("../models/Notification");

const protect =
  require("../middleware/authMiddleware");


// =====================================
// GET NOTIFICATIONS
// =====================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({

          user_id:
            req.user.userId

        })
        .sort({
          createdAt: -1
        });


      res.json(
        notifications
      );


    } catch (error) {

      res.status(500).json({

        message:
          "Failed to load notifications",

        error:
          error.message

      });

    }

  }
);


// =====================================
// MARK AS READ
// =====================================

router.put(
  "/:id/read",
  protect,
  async (req, res) => {

    try {

      const notification =
        await Notification.findOneAndUpdate(

          {
            _id:
              req.params.id,

            user_id:
              req.user.userId
          },

          {
            is_read: true
          },

          {
            new: true
          }

        );


      if (!notification) {

        return res.status(404).json({

          message:
            "Notification not found"

        });

      }


      res.json(
        notification
      );


    } catch (error) {

      res.status(500).json({

        message:
          "Failed to update notification",

        error:
          error.message

      });

    }

  }
);


// =====================================
// DELETE NOTIFICATION
// =====================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {

    try {

      const notification =
        await Notification.findOneAndDelete({

          _id:
            req.params.id,

          user_id:
            req.user.userId

        });


      if (!notification) {

        return res.status(404).json({

          message:
            "Notification not found"

        });

      }


      res.json({

        message:
          "Notification deleted"

      });


    } catch (error) {

      res.status(500).json({

        message:
          "Failed to delete notification",

        error:
          error.message

      });

    }

  }
);


module.exports = router;