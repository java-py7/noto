-- Add order_index column to notes and todos for Drag and Drop reordering
alter table public.notes add column if not exists order_index integer default 0;
alter table public.todos add column if not exists order_index integer default 0;

create index if not exists idx_notes_order on public.notes (user_id, order_index);
create index if not exists idx_todos_order on public.todos (user_id, order_index);

