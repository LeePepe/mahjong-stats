insert into players (name) values
  ('佳'),('桂'),('blue'),('evol'),('熊大'),('李姐'),('lin团'),('oyo'),
  ('jingjing'),('felix'),('psq'),('jean'),('momo'),('kexin'),('db'),('Tianpei')
on conflict (name) do nothing;
