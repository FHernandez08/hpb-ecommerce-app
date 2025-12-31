import express from "express";
const router = express.Router();

import { pool } from "../../db/db.js";

// adds addon to a booking - POST
router.post("/", async (req, res) => {
    const { code, name, description, sort_order, is_active, price_cents } = req.body;

    try {
        if (code === undefined) {
        return res.status(400).send("A required field is missing!");
    }
        else {
            const trimmedCode = code.trim().toUpperCase();
            if (trimmedCode.length === 0) {
                return res.status(400).send("A required field is missing!");
            }
            else {
                if (!Number.isInteger(sort_order)) {
                return res.status(400).send("A required field is missing!");
            }
                else {
                    if (name === undefined) {
                        return res.status(400).send("A required field is missing!");
                    }
                    else {
                        const trimmedName = name.trim();
                        if (trimmedName.length === 0) {
                            return res.status(400).send("A required field is missing!");
                        }
                        else {
                            const createdRow = await pool.query(
                                "INSERT INTO add_ons (code, name, description, price_cents, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, code, name, description, price_cents, is_active, sort_order",
                                [trimmedCode, trimmedName, description, price_cents, is_active, sort_order]
                            );

                            if (createdRow.rowCount > 0) {
                                const returnedRow = createdRow.rows[0];

                                return res.status(201).json({ returnedRow, message: "Add-on created successfully!" });
                            }
                            else {
                                return res.status(500).send("No add-on found!");
                            }
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        if (err.code === "23505") {
            return res.status(409).send("Add-on already exists!");
        }
        else {
            return res.status(500).send("500 Internal Server Error");
        }
    }
});


// updates a specific addon for a booking - PUT
router.patch("/:addOnId", async (req, res) => {
    try {
        const body = req.body;
        const { addOnId } = req.params;

        let validatedName;
        let validatedSortOrder;
        let validatedIsActive;
        let validatedDescription;

        let isActiveOption;
        let sortOrderOption;
        let nameOption;
        let descriptionOption;

        const hasValidFields = 'name' in body || 'description' in body || 'sort_order' in body || 'is_active' in body;

        if (!hasValidFields) {
            return res.status(400).send("No valid fields entered. Please try again!");
        }
        else {
            const { name, description, sort_order, is_active } = body;

            if ('name' in body) {
                if (typeof name !== "string") {
                    return res.status(400).send("A required field is missing!");
                }

                const trimmedName = name.trim();
                if (trimmedName.length === 0) {
                    return res.status(400).send("A required field is missing!");
                }

                validatedName = trimmedName;
            };

            if ('sort_order' in body) {
                if (!Number.isInteger(sort_order)) {
                    return res.status(400).send("A required field is missing!");
                }

                validatedSortOrder = sort_order;
            };

            if ('is_active' in body) {
                if (typeof is_active !== "boolean") {
                    return res.status(400).send("A required field is missing!");
                }

                validatedIsActive = is_active;
            };

            if ('description' in body) {
                if (typeof description !== "string") {
                    return res.status(400).send("A required field is missing!");
                }

                validatedDescription = description;
            }

            const existingRow = await pool.query(
                "SELECT name, description, sort_order, is_active FROM add_ons WHERE id = $1", [addOnId]
            );

            if (existingRow.rowCount === 0) {
                return res.status(404).send("The add-on is not found!");
            }

            // choosing between existing or updated value for the specific column
            if (validatedName !== undefined) {
                nameOption = validatedName;
            }
            else {
                nameOption = existingRow.rows[0]["name"];
            }

            if (validatedDescription !== undefined) {
                descriptionOption = validatedDescription;
            }
            else {
                descriptionOption = existingRow.rows[0]["description"]
            }

            if (validatedIsActive !== undefined) {
                isActiveOption = validatedIsActive;
            }
            else {
                isActiveOption = existingRow.rows[0]["is_active"];
            }

            if (validatedSortOrder !== undefined) {
                sortOrderOption = validatedSortOrder;
            }
            else {
                sortOrderOption = existingRow.rows[0]["sort_order"];
            }

            const updatedRow = await pool.query(
                "UPDATE add_ons SET name = $1, description = $2, sort_order = $3, is_active = $4 WHERE id = $5 RETURNING code, name, description, price_cents, is_active, sort_order", [nameOption, descriptionOption, sortOrderOption, isActiveOption, addOnId]
            )

            if (updatedRow.rowCount > 0) {
                const returnedRow = updatedRow.rows[0];

                return res.status(200).json({ returnedRow, message: "Add-on has been successfully updated!" });
            }
        }
    }
    catch (err) {
        if (err) {
            return res.status(500).send("500 Internal Server Error!");
        }
    }
});

export default router;