const Portfolio = require("../models/Portfolio");
const crypto = require("crypto");

function generatePublicId() {
  return crypto.randomBytes(6).toString("base64url");
}

// ================= CREATE OR UPSERT PORTFOLIO =================

exports.createPortfolio = async (req, res) => {
  try {
    const {
      fullName,
      headline,
      tagline,
      about,
      email,
      contact,
      profilePic,
      softSkills,
      techSkills,
      education,
      experience,
      projects,
      template,
    } = req.body;

    if (
      !fullName ||
      !headline ||
      !tagline ||
      !about ||
      !email ||
      !contact ||
      !softSkills ||
      !techSkills
    ) {
      return res.status(400).json({
        message:
          "Please provide all required fields (fullName, headline, tagline, about, email, contact, softSkills, techSkills)",
      });
    }
    const allowedTemplates = [
  "minimal",
  "glass",
  "dark",
  "corporate",
];

const selectedTemplate = allowedTemplates.includes(template)
  ? template
  : "corporate";
    const portfolioData = {
      fullName: fullName.trim(),
      headline: headline.trim(),
      tagline: tagline.trim(),
      about: about.trim(),
      email: email.trim(),
      contact: contact.trim(),
      profilePic: profilePic || "",
      softSkills: softSkills.trim(),
      techSkills: techSkills.trim(),
      education: Array.isArray(education) ? education : [],
      experience: Array.isArray(experience) ? experience : [],
      projects: typeof projects === "string" ? projects : "",
      template: selectedTemplate,
      user: req.user.id,
    };

    // Upsert: Find existing portfolio for this user or create a new one
    let portfolio = await Portfolio.findOne({ user: req.user.id });

    if (portfolio) {
      if (!portfolio.publicId) {
        portfolioData.publicId = generatePublicId();
      }
      portfolio = await Portfolio.findByIdAndUpdate(
        portfolio._id,
        portfolioData,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.status(200).json({
        message: "Portfolio Updated Successfully",
        portfolio,
      });
    }

    portfolioData.publicId = generatePublicId();
    portfolio = await Portfolio.create(portfolioData);

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
    let portfolio = await Portfolio.findOne({
      user: req.user.id,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    // Backfill publicId if missing for existing portfolios
    if (!portfolio.publicId) {
      portfolio.publicId = generatePublicId();
      await portfolio.save();
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

    // Sanitize input fields
    const updateData = { ...req.body };
    delete updateData.user; // Prevent changing user ownership
    delete updateData._id;

    if (!portfolio.publicId && !updateData.publicId) {
      updateData.publicId = generatePublicId();
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      portfolio._id,
      updateData,
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

// ================= PUBLISH PORTFOLIO (EXPORT AS LINK) =================

exports.publishPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({
      user: req.user.id,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found. Please create a portfolio first.",
      });
    }

    if (!portfolio.publicId) {
      portfolio.publicId = generatePublicId();
    }

    portfolio.isPublic = true;
    await portfolio.save();

    res.status(200).json({
      message: "Portfolio Published Successfully",
      publicId: portfolio.publicId,
      isPublic: portfolio.isPublic,
      template: portfolio.template,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE PORTFOLIO =================

exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      user: req.user.id,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    res.status(200).json({
      message: "Portfolio Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET PUBLIC PORTFOLIO BY ID =================

exports.getPublicPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      publicId: id,
      isPublic: true,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    // Sanitize response to expose only public portfolio fields
    const publicData = {
      _id: portfolio._id,
      publicId: portfolio.publicId,
      fullName: portfolio.fullName,
      headline: portfolio.headline,
      tagline: portfolio.tagline,
      about: portfolio.about,
      email: portfolio.email,
      contact: portfolio.contact,
      profilePic: portfolio.profilePic,
      softSkills: portfolio.softSkills,
      techSkills: portfolio.techSkills,
      education: portfolio.education,
      experience: portfolio.experience,
      projects: portfolio.projects,
      template: portfolio.template,
      isPublic: portfolio.isPublic,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };

    res.status(200).json(publicData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};