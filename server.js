const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ===== Rutas ===== //

// Registro
app.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const exists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (exists.rows.length > 0) return res.status(400).json({ error: "Usuario ya existe" });

        await pool.query(
            "INSERT INTO users(email, password, username) VALUES($1, $2, $3)",
            [email, password, username]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email=$1 AND password=$2", [email, password]);
        if (result.rows.length === 0) return res.status(400).json({ error: "Credenciales inválidas" });
        res.json({ email: result.rows[0].email, username: result.rows[0].username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener datos de usuario por email
app.get("/users/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query("SELECT email, username FROM users WHERE email=$1", [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar comentario
app.post("/comments", async (req, res) => {
    const { animeId, title, content, email, username } = req.body;
    try {
        await pool.query(
            'INSERT INTO comments("animeId", title, content, email, username) VALUES($1,$2,$3,$4,$5)',
            [animeId, title, content, email, username]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Obtener comentarios por animeId
app.get("/comments/:animeId", async (req, res) => {
    const { animeId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM comments WHERE "animeId"=$1', [animeId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Obtener comentarios de un usuario
app.get("/comments/user/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query("SELECT * FROM comments WHERE email=$1", [email]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /comments/:id
app.delete("/comments/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM comments WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /comments/:id
app.put("/comments/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        await pool.query(
            "UPDATE comments SET title=$1, content=$2 WHERE id=$3",
            [title, content, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
