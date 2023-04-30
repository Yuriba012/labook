-- Active: 1682720206810@@127.0.0.1@3306
CREATE TABLE users(
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT(DATETIME('now','localtime'))
);

INSERT INTO users(id, name, email, password, role)
VALUES
    ('u001', 'Jose da Silva', 'joses@hotmail.com', '123456', 'Operador de Painel'),
    ('u002', 'Matheus dos Santos', 'matheussan@gmail.com', '321654', 'Gerente de Projetos'),
    ('u003', 'Joana Batista', 'joanabat@yahoo.com.br', '147258', 'Bancaria'),
    ('u004', 'Vilma Souza', 'vilmasou@outlook.com', '963852', 'Assistente Administrativa');

DROP TABLE users;

SELECT * FROM users;

CREATE TABLE posts(
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT(0) NOT NULL,
    dislikes INTEGER DEFAULT(0) NOT NULL,
    created_at TEXT DEFAULT(DATETIME('now')),
    updated_at TEXT,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

DROP TABLE posts;

INSERT INTO posts(id, creator_id, content)
VALUES
    ('p001', 'u001', 'Fim de semana com a familia.'),
    ('p002', 'u002', 'Viagem a trabalho.'),
    ('p003', 'u003', 'Passeio Cordilheira dos Andes.'),
    ('p004', 'u004', 'Jantar com os amigos.'),
    ('p005', 'u002', 'Visitando meus tios.'),
    ('p006', 'u004', 'Aniversario do meu pai.');

SELECT * FROM posts;

CREATE TABLE likes_dislikes(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

DROP TABLE likes_dislikes;

-- INSERT INTO likes_dislikes(user_id, post_id, like)
-- VALUES
--     ('u001', 'p002', '1'),
--     ('u001', 'p003', '1'),
--     ('u002', 'p003', '1'),
--     ('u002', 'p006', '1'),
--     ('u003', 'p003', '0'),
--     ('u004', 'p005', '0'),
--     ('u004', 'p001', '0'),
--     ('u003', 'p004', '0'),
--     ('u002', 'p006', '0'),
--     ('u001', 'p006', '0'),
--     ('u003', 'p002', '0'),

SELECT 
    posts.id,
    posts.content,
    posts.likes,
    posts.dislikes,
    posts.created_at,
    posts.uploaded_at,
    posts.creator_id,
    users.name
 FROM posts
LEFT JOIN users
ON posts.creator_id = users.id;