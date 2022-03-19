create TABLE users(
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR,
  user_surname VARCHAR,
  user_email VARCHAR UNIQUE NOT NULL,
  user_password VARCHAR,
  user_photoUrl VARCHAR,
  user_activated boolean DEFAULT false,
  user_activationlink VARCHAR,
  user_player boolean NOT NULL DEFAULT false,
  user_role_id INTEGER NOT NULL DEFAULT 4,
  user_created_time DATE NOT NULL DEFAULT CURRENT_DATE,
  FOREIGN KEY (user_role_id) REFERENCES roles (role_id)
);

create TABLE posts(
  post_id SERIAL PRIMARY KEY,
  post_title VARCHAR,
  post_content TEXT,
  post_user INTEGER,
  FOREIGN KEY (post_user) REFERENCES users (user_id)
);

create TABLE roles(
role_id SERIAL PRIMARY KEY,
role_name VARCHAR (10),
role_level INTEGER
);

create TABLE tokens(
  token_id SERIAL PRIMARY KEY,
  token_refresh VARCHAR,
  token_user INTEGER UNIQUE NOT NULL,
  FOREIGN KEY (token_user) REFERENCES users (user_id)
);