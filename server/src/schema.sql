create table if not exists users (
    id serial primary key,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    created_at timestamp default now()
);

create table if not exists items (
    id serial primary key,
    owner_id integer not null references users(id) on delete cascade,
    name varchar(255) not null,
    description text,
    category varchar(50) default 'personal',
    priority varchar(20) default 'medium',
    done boolean default false,
    created_at timestamp default now(),
    updated_at timestamp default now()
);