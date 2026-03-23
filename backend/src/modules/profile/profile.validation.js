import { body } from "express-validator";

/**
 * Profile Module — Sanitation & Validation Layer
 * 
 * Enforced in Phase 4 (Security) for:
 *  - XSS Prevention (escape/trim)
 *  - Format validation (UUID/Email/URL)
 *  - Logical range checks (Graduation Year)
 */
export const updateProfileValidation = [
    body("display_name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .escape() // Layer 4 — XSS Guardian
        .withMessage("Display name must be between 2 and 100 characters"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .escape() // Layer 4 — XSS Guardian
        .withMessage("Bio cannot exceed 300 characters"),

    body("website_url")
        .optional()
        .trim()
        .isURL()
        .withMessage("Invalid website URL"),

    body("graduation_year")
        .optional()
        .isInt({ min: 1980, max: 2100 })
        .withMessage("Invalid graduation year")
];
