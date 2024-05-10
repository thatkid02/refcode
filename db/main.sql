CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    referral_code VARCHAR(255) UNIQUE NOT NULL, 
    referred_by INT REFERENCES users(id), 
    points INT DEFAULT 0,
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_providers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    provider VARCHAR(255) NOT NULL, 
    provider_user_id VARCHAR(255) NOT NULL,
    provider_access_data jsonb NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);