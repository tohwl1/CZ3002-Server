CREATE DATABASE ASEProj;

CREATE TABLE users(
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    is_accessor BOOLEAN NOT NULL,
    accessor VARCHAR(255),
    PRIMARY KEY (user_id)
);

CREATE TABLE attempts(
    user_id varchar(255) NOT NULL,
    attempt_no SERIAL,
    attempted_on timestamp NOT NULL,
    time_taken int NOT NULL,
    accuracy int NOT NULL,
    difficulty bool NOT NULL,
    pass_fail bool NOT NULL,
    PRIMARY KEY (attempt_no),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


