-- Run in Supabase SQL Editor (Dashboard → SQL)
-- Creates Media table + storage buckets

create table if not exists public."Media" (
  id text primary key,
  "fileName" text not null,
  "filePath" text not null,
  "mediaType" text not null,
  "uploadDate" timestamptz not null default now(),
  "fileSize" integer not null,
  "thumbnailPath" text,
  "folderGroupId" text,
  "folderName" text
);

create index if not exists "Media_mediaType_idx" on public."Media" ("mediaType");
create index if not exists "Media_uploadDate_idx" on public."Media" ("uploadDate");
create index if not exists "Media_fileName_idx" on public."Media" ("fileName");
create index if not exists "Media_folderGroupId_idx" on public."Media" ("folderGroupId");

-- Storage buckets (create in Dashboard → Storage if insert fails)
insert into storage.buckets (id, name, public)
values
  ('images', 'images', true),
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;
