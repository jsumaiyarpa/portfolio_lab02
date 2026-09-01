const Portfolio = require("../models/Portfolio");

// ================= CREATE PORTFOLIO =================

exports.createPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.create({
      fullName: req.body.fullName,
      headline: req.body.headline,
      tagline: req.body.tagline,
      about: req.body.about,

      email: req.body.email,
      contact: req.body.contact,
      profilePic: req.body.profilePic,

      softSkills: req.body.softSkills,
      techSkills: req.body.techSkills,

      education: req.body.education || [],
      experience: req.body.experience || [],

      projects: req.body.projects || "",

      template: req.body.template || "corporate",

      user: req.user.id,
    });

    res.status(201).json({
      message: "Portfolio Created Successfully",
      portfolio,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= GET MY PORTFOLIO =================

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      user: req.user.id,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    res.status(200).json(portfolio);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= UPDATE PORTFOLIO =================

exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      user: req.user.id,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      portfolio._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Portfolio Updated Successfully",
      portfolio: updatedPortfolio,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};