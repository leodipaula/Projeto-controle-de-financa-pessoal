create table usuarios (
  id serial primary key unique,
  nome text not null,
  email text unique not null,
  senha text not null 
);

create table categorias (
  id serial primary key unique,
  usuario_id integer references usuarios(id),
  descricao text not null
);
  
create table transacoes (
  id serial primary key unique,
  descricao text not null,
  valor integer not null,
  data date not null,
  categoria_id integer not null references categorias(id),
  usuario_id integer not null references usuarios(id),
  tipo text not null
);

insert into categorias (descricao) values
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');